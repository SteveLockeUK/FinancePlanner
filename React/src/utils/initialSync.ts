import { accountService } from '@/data/services/AccountService';
import { transactionService } from '@/data/services/TransactionService';
import { recurringPaymentService } from '@/data/services/RecurringPaymentService';
import { indexedDBService } from '@/data/services/IndexedDBService';

export async function performInitialSync(): Promise<void> {
    try {
        // Initialize IndexedDB
        await indexedDBService.init();
        
        // Check if we've done an initial sync before
        const lastSyncTime = await indexedDBService.getSyncMetadata('lastSyncTime');
        
        if (!lastSyncTime) {
            // First time sync - get all data
            console.log('Performing initial sync...');
            await Promise.all([
                accountService.initialSync(),
                transactionService.initialSync(),
                recurringPaymentService.initialSync()
            ]);
            
            await indexedDBService.setSyncMetadata('lastSyncTime', new Date().toISOString());
        } else {
            // Incremental sync - get updates since last sync
            console.log('Performing incremental sync...');
            const lastSync = new Date(lastSyncTime);
            const response = await fetch(`api/sync/updates-since?lastSyncTime=${lastSync.toISOString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const updates = await response.json();
                
                if (updates.Accounts && updates.Accounts.length > 0) {
                    await accountService.syncFromAPI(updates.Accounts);
                }
                if (updates.Transactions && updates.Transactions.length > 0) {
                    await transactionService.syncFromAPI(updates.Transactions);
                }
                if (updates.RecurringPayments && updates.RecurringPayments.length > 0) {
                    await recurringPaymentService.syncFromAPI(updates.RecurringPayments);
                }
                
                await indexedDBService.setSyncMetadata('lastSyncTime', updates.LastSyncTime || new Date().toISOString());
            }
        }
    } catch (error) {
        console.error('Error performing initial sync:', error);
    }
}

