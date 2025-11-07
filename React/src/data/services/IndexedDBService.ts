import type BaseEntity, { SyncStatus } from '@/data/models/BaseEntity';

const DB_NAME = 'FinancePlannerDB';
const DB_VERSION = 1;

const STORES = {
    ACCOUNTS: 'accounts',
    TRANSACTIONS: 'transactions',
    RECURRING_PAYMENTS: 'recurringPayments',
    SYNC_METADATA: 'syncMetadata'
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

class IndexedDBService {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.ACCOUNTS)) {
                    const accountStore = db.createObjectStore(STORES.ACCOUNTS, { keyPath: 'id', autoIncrement: false });
                    accountStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    accountStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
                    const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id', autoIncrement: false });
                    transactionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    transactionStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.RECURRING_PAYMENTS)) {
                    const recurringPaymentStore = db.createObjectStore(STORES.RECURRING_PAYMENTS, { keyPath: 'id', autoIncrement: false });
                    recurringPaymentStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                    recurringPaymentStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
                    db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
                }
            };
        });
    }

    private async ensureDb(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('Failed to initialize IndexedDB');
        }
        return this.db;
    }

    async getAll<T extends BaseEntity>(storeName: StoreName): Promise<T[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result as T[];
                // Convert date strings back to Date objects
                const converted = results.map(item => this.deserializeDates(item));
                resolve(converted);
            };
        });
    }

    async getById<T extends BaseEntity>(storeName: StoreName, id: number): Promise<T | null> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result as T | undefined;
                if (result) {
                    resolve(this.deserializeDates(result));
                } else {
                    resolve(null);
                }
            };
        });
    }

    async add<T extends BaseEntity>(storeName: StoreName, entity: T): Promise<T> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const serialized = this.serializeDates(entity);
            const request = store.add(serialized);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve(entity);
            };
        });
    }

    async put<T extends BaseEntity>(storeName: StoreName, entity: T): Promise<T> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const serialized = this.serializeDates(entity);
            const request = store.put(serialized);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve(entity);
            };
        });
    }

    async delete(storeName: StoreName, id: number): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve();
            };
        });
    }

    async getPendingSync<T extends BaseEntity>(storeName: StoreName): Promise<T[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('syncStatus');
            const request = index.getAll('pending');

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result as T[];
                const converted = results.map(item => this.deserializeDates(item));
                resolve(converted);
            };
        });
    }

    async getDeletedSync<T extends BaseEntity>(storeName: StoreName): Promise<T[]> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('syncStatus');
            const request = index.getAll('deleted');

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result as T[];
                const converted = results.map(item => this.deserializeDates(item));
                resolve(converted);
            };
        });
    }

    async updateSyncStatus(storeName: StoreName, id: number, syncStatus: SyncStatus): Promise<void> {
        const entity = await this.getById<BaseEntity>(storeName, id);
        if (!entity) {
            throw new Error(`Entity with id ${id} not found in ${storeName}`);
        }
        entity.syncStatus = syncStatus;
        await this.put(storeName, entity);
    }

    async getSyncMetadata(key: string): Promise<any> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.SYNC_METADATA, 'readonly');
            const store = transaction.objectStore(STORES.SYNC_METADATA);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve(result.value);
                } else {
                    resolve(null);
                }
            };
        });
    }

    async setSyncMetadata(key: string, value: any): Promise<void> {
        const db = await this.ensureDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORES.SYNC_METADATA, 'readwrite');
            const store = transaction.objectStore(STORES.SYNC_METADATA);
            const request = store.put({ key, value });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve();
            };
        });
    }

    private serializeDates<T extends BaseEntity>(entity: T): any {
        const serialized = { ...entity } as any;
        // Convert Date objects to ISO strings for storage
        if (serialized.updatedAt instanceof Date) {
            serialized.updatedAt = serialized.updatedAt.toISOString();
        }
        if (serialized.createdAt instanceof Date) {
            serialized.createdAt = serialized.createdAt.toISOString();
        }
        if (serialized.date instanceof Date) {
            serialized.date = serialized.date.toISOString();
        }
        if (serialized.startDate instanceof Date) {
            serialized.startDate = serialized.startDate.toISOString();
        }
        if (serialized.endDate instanceof Date) {
            serialized.endDate = serialized.endDate.toISOString();
        }
        if (serialized.lastGeneratedAt instanceof Date) {
            serialized.lastGeneratedAt = serialized.lastGeneratedAt.toISOString();
        }
        if (serialized.nextPaymentDate instanceof Date) {
            serialized.nextPaymentDate = serialized.nextPaymentDate.toISOString();
        }
        if (serialized.archivedAt instanceof Date) {
            serialized.archivedAt = serialized.archivedAt.toISOString();
        }
        return serialized;
    }

    private deserializeDates<T extends BaseEntity>(entity: any): T {
        const deserialized = { ...entity };
        // Convert ISO strings back to Date objects
        if (typeof deserialized.updatedAt === 'string') {
            deserialized.updatedAt = new Date(deserialized.updatedAt);
        }
        if (typeof deserialized.createdAt === 'string') {
            deserialized.createdAt = new Date(deserialized.createdAt);
        }
        if (typeof deserialized.date === 'string') {
            deserialized.date = new Date(deserialized.date);
        }
        if (typeof deserialized.startDate === 'string') {
            deserialized.startDate = new Date(deserialized.startDate);
        }
        if (typeof deserialized.endDate === 'string') {
            deserialized.endDate = new Date(deserialized.endDate);
        }
        if (typeof deserialized.lastGeneratedAt === 'string') {
            deserialized.lastGeneratedAt = new Date(deserialized.lastGeneratedAt);
        }
        if (typeof deserialized.nextPaymentDate === 'string') {
            deserialized.nextPaymentDate = new Date(deserialized.nextPaymentDate);
        }
        if (typeof deserialized.archivedAt === 'string') {
            deserialized.archivedAt = new Date(deserialized.archivedAt);
        }
        return deserialized as T;
    }
}

export const indexedDBService = new IndexedDBService();
export { STORES };

