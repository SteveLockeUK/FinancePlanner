export async function registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('Service Worker registered:', registration);
            
            // Check for updates periodically
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('New service worker available');
                        }
                    });
                }
            });
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'SYNC_COMPLETE' || event.data.type === 'FULL_SYNC_COMPLETE') {
                    // Dispatch custom event to notify React components
                    window.dispatchEvent(new CustomEvent('dataSyncComplete', {
                        detail: { entityType: event.data.entityType }
                    }));
                }
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

export function triggerSync(entityType?: string): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        if (entityType) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SYNC_REQUEST',
                entityType
            });
        } else {
            navigator.serviceWorker.controller.postMessage({
                type: 'FULL_SYNC'
            });
        }
    }
}

