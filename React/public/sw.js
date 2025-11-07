const CACHE_NAME = 'finance-planner-v1';
const API_BASE = '/api';

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    return self.clients.claim();
});

// Message handler for sync requests
self.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'SYNC_REQUEST') {
        event.waitUntil(syncEntityType(event.data.entityType));
    } else if (event.data && event.data.type === 'FULL_SYNC') {
        event.waitUntil(performFullSync());
    }
});

// Periodic background sync (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-entities') {
        event.waitUntil(performFullSync());
    }
});


async function performFullSync() {
    if (!navigator.onLine) {
        console.log('Offline, skipping full sync');
        return;
    }

    try {
        // Sync all entity types
        await syncEntityType('accounts');
        await syncEntityType('transactions');
        await syncEntityType('recurringPayments');

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
            client.postMessage({
                type: 'FULL_SYNC_COMPLETE'
            });
        });
    } catch (error) {
        console.error('Error performing full sync:', error);
    }
}

async function syncEntityType(entityType) {
    if (!navigator.onLine) {
        console.log('Offline, skipping sync');
        return;
    }

    try {
        const pending = await getPendingEntities(entityType);
        const deleted = await getDeletedEntities(entityType);

        // Use batch sync endpoint if available
        if (pending.length > 0 || deleted.length > 0) {
            await batchSyncEntities(entityType, pending, deleted);
        }

        // Notify clients of sync completion
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                entityType
            });
        });
    } catch (error) {
        console.error(`Error syncing ${entityType}:`, error);
    }
}

async function batchSyncEntities(entityType, pending, deleted) {
    const syncEndpoint = getSyncEndpointForEntityType(entityType);
    const items = pending.map(entity => ({
        id: entity.id,
        data: serializeEntityForAPI(entity)
    }));
    const deletedIds = deleted.map(entity => entity.id);

    const response = await fetch(`${API_BASE}/sync/${syncEndpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: items,
            deletedIds: deletedIds
        })
    });

    if (response.ok) {
        const results = await response.json();
        
        // Update IndexedDB with synced entities
        for (const result of results) {
            if (result.id) {
                // Find the original entity (might have temp ID)
                const originalEntity = pending.find(e => 
                    (e.id < 0 && result.id > 0) || e.id === result.id
                );
                
                if (originalEntity && originalEntity.id < 0) {
                    // Replace temp ID with real ID
                    await updateEntityInIndexedDB(entityType, originalEntity.id, result);
                } else {
                    // Update existing entity
                    await updateEntityInIndexedDB(entityType, result.id, result);
                }
            }
        }
        
        // Delete entities that were successfully deleted on server
        for (const id of deletedIds) {
            await deleteEntityFromIndexedDB(entityType, id);
        }
    } else {
        throw new Error(`Failed to sync ${entityType}: ${response.statusText}`);
    }
}

function getSyncEndpointForEntityType(entityType) {
    switch (entityType) {
        case 'accounts':
            return 'accounts';
        case 'transactions':
            return 'transactions';
        case 'recurringPayments':
            return 'recurring-payments';
        default:
            throw new Error(`Unknown entity type: ${entityType}`);
    }
}


function serializeEntityForAPI(entity) {
    // Remove syncStatus and convert dates to ISO strings
    const serialized = { ...entity };
    delete serialized.syncStatus;
    
    // Convert Date objects to ISO strings
    Object.keys(serialized).forEach(key => {
        if (serialized[key] instanceof Date) {
            serialized[key] = serialized[key].toISOString();
        }
    });
    
    return serialized;
}

// IndexedDB operations (using IDBRequest wrapper)
async function getPendingEntities(entityType) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinancePlannerDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeName = getStoreNameForEntityType(entityType);
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('syncStatus');
            const getAllRequest = index.getAll('pending');
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result || []);
            };
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

async function getDeletedEntities(entityType) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinancePlannerDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeName = getStoreNameForEntityType(entityType);
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('syncStatus');
            const getAllRequest = index.getAll('deleted');
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result || []);
            };
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

async function updateEntitySyncStatus(entityType, id, syncStatus) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinancePlannerDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeName = getStoreNameForEntityType(entityType);
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const entity = getRequest.result;
                if (entity) {
                    entity.syncStatus = syncStatus;
                    entity.updatedAt = new Date().toISOString();
                    const putRequest = store.put(entity);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

async function updateEntityInIndexedDB(entityType, oldId, newEntity) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinancePlannerDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeName = getStoreNameForEntityType(entityType);
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Delete old entity with temp ID
            const deleteRequest = store.delete(oldId);
            deleteRequest.onsuccess = () => {
                // Add new entity with real ID
                const entityToAdd = {
                    ...newEntity,
                    syncStatus: 'synced',
                    updatedAt: newEntity.updatedAt || new Date().toISOString()
                };
                const addRequest = store.add(entityToAdd);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

async function deleteEntityFromIndexedDB(entityType, id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinancePlannerDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const storeName = getStoreNameForEntityType(entityType);
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

function getStoreNameForEntityType(entityType) {
    switch (entityType) {
        case 'accounts':
            return 'accounts';
        case 'transactions':
            return 'transactions';
        case 'recurringPayments':
            return 'recurringPayments';
        default:
            throw new Error(`Unknown entity type: ${entityType}`);
    }
}

// Fetch interceptor for offline support (optional)
self.addEventListener('fetch', (event) => {
    // Only handle GET requests for now
    if (event.request.method === 'GET' && event.request.url.includes(API_BASE)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached response if offline
                    return caches.match(event.request);
                })
        );
    }
});

