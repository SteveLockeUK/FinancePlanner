import type Account from "@/data/models/Accounts/Account.ts";
import { indexedDBService, STORES } from "./IndexedDBService.ts";
import type { SyncStatus } from "@/data/models/BaseEntity.ts";

class AccountService {
    async init(): Promise<void> {
        await indexedDBService.init();
    }

    async getAccounts(): Promise<Account[]> {
        await this.init();
        const accounts = await indexedDBService.getAll<Account>(STORES.ACCOUNTS);
        return accounts.filter(a => a.syncStatus !== 'deleted');
    }
    
    async createAccount(accountData: Partial<Account>): Promise<Account> {
        await this.init();
        
        // Generate a temporary negative ID for pending entities
        const tempId = Date.now() * -1;
        
        const newAccount: Account = {
            id: tempId,
            name: accountData.name || '',
            type: accountData.type || 'Current',
            currency: accountData.currency || 'GBP',
            startingBalance: accountData.startingBalance || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus,
            ...(accountData.archivedAt && { archivedAt: accountData.archivedAt })
        };

        await indexedDBService.add(STORES.ACCOUNTS, newAccount);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return newAccount;
    }
    
    async updateAccount(id: number, account: Partial<Account>): Promise<Account> {
        await this.init();
        
        const existing = await indexedDBService.getById<Account>(STORES.ACCOUNTS, id);
        if (!existing) {
            throw new Error(`Account with id ${id} not found`);
        }

        const updatedAccount: Account = {
            ...existing,
            ...account,
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus
        };

        await indexedDBService.put(STORES.ACCOUNTS, updatedAccount);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return updatedAccount;
    }

    async deleteAccount(id: number): Promise<void> {
        await this.init();
        
        const existing = await indexedDBService.getById<Account>(STORES.ACCOUNTS, id);
        if (!existing) {
            throw new Error(`Account with id ${id} not found`);
        }

        // If it's a pending entity that hasn't been synced, just delete it
        if (existing.syncStatus === 'pending' && existing.id < 0) {
            await indexedDBService.delete(STORES.ACCOUNTS, id);
        } else {
            // Mark as deleted for sync
            existing.syncStatus = 'deleted';
            existing.updatedAt = new Date();
            await indexedDBService.put(STORES.ACCOUNTS, existing);
        }
        
        // Trigger sync in service worker
        this.triggerSync();
    }

    async syncFromAPI(accounts: any[]): Promise<void> {
        await this.init();
        
        // Update or insert accounts from API
        for (const account of accounts) {
            const syncedAccount: Account = {
                id: account.id,
                name: account.name,
                type: account.type,
                currency: account.currency,
                startingBalance: account.startingBalance,
                createdAt: new Date(account.createdAt),
                updatedAt: new Date(account.updatedAt),
                syncStatus: 'synced' as SyncStatus,
                ...(account.archivedAt && { archivedAt: new Date(account.archivedAt) })
            };
            await indexedDBService.put(STORES.ACCOUNTS, syncedAccount);
        }
    }

    async initialSync(): Promise<void> {
        await this.init();
        try {
            const response = await fetch('api/accounts', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const accounts = await response.json();
                await this.syncFromAPI(accounts);
            }
        } catch (error) {
            console.error('Failed to perform initial sync for accounts:', error);
        }
    }

    private triggerSync(): void {
        // Post message to service worker to trigger sync
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SYNC_REQUEST',
                entityType: 'accounts'
            });
        }
    }
}

export const accountService = new AccountService();
