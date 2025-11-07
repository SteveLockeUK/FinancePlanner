import type Transaction from "@/data/models/Transactions/Transaction.ts";
import { indexedDBService, STORES } from "./IndexedDBService.ts";
import type { SyncStatus } from "@/data/models/BaseEntity.ts";

class TransactionService {
    async init(): Promise<void> {
        await indexedDBService.init();
    }

    private transformTransaction(transaction: any): Transaction {
        return {
            ...transaction,
            date: new Date(transaction.date),
            createdAt: new Date(transaction.createdAt),
            updatedAt: new Date(transaction.updatedAt),
            fromAccountId: transaction.fromAccountId ? Number(transaction.fromAccountId) : undefined,
            toAccountId: transaction.toAccountId ? Number(transaction.toAccountId) : undefined,
            recurrenceId: transaction.recurrenceId ? Number(transaction.recurrenceId) : undefined,
            syncStatus: transaction.syncStatus || 'synced'
        };
    }
    
    async getTransactions(): Promise<Transaction[]> {
        await this.init();
        return await indexedDBService.getAll<Transaction>(STORES.TRANSACTIONS);
    }

    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
        await this.init();
        
        // Generate a temporary negative ID for pending entities
        const tempId = Date.now() * -1;
        
        const newTransaction: Transaction = {
            id: tempId,
            userId: transactionData.userId || '',
            description: transactionData.description || '',
            type: transactionData.type!,
            amount: transactionData.amount || 0,
            fromAccountId: transactionData.fromAccountId,
            toAccountId: transactionData.toAccountId,
            categoryId: transactionData.categoryId,
            recurrenceId: transactionData.recurrenceId,
            date: transactionData.date || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus
        };

        await indexedDBService.add(STORES.TRANSACTIONS, newTransaction);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return newTransaction;
    }

    async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
        await this.init();
        
        const existing = await indexedDBService.getById<Transaction>(STORES.TRANSACTIONS, id);
        if (!existing) {
            throw new Error(`Transaction with id ${id} not found`);
        }

        const updatedTransaction: Transaction = {
            ...existing,
            ...transaction,
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus
        };

        await indexedDBService.put(STORES.TRANSACTIONS, updatedTransaction);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return updatedTransaction;
    }

    async deleteTransaction(id: number): Promise<void> {
        await this.init();
        
        const existing = await indexedDBService.getById<Transaction>(STORES.TRANSACTIONS, id);
        if (!existing) {
            throw new Error(`Transaction with id ${id} not found`);
        }

        // If it's a pending entity that hasn't been synced, just delete it
        if (existing.syncStatus === 'pending' && existing.id < 0) {
            await indexedDBService.delete(STORES.TRANSACTIONS, id);
        } else {
            // Mark as deleted for sync
            existing.syncStatus = 'deleted';
            existing.updatedAt = new Date();
            await indexedDBService.put(STORES.TRANSACTIONS, existing);
        }
        
        // Trigger sync in service worker
        this.triggerSync();
    }

    async syncFromAPI(transactions: any[]): Promise<void> {
        await this.init();
        
        // Update or insert transactions from API
        for (const transaction of transactions) {
            const transformed = this.transformTransaction(transaction);
            const syncedTransaction: Transaction = {
                ...transformed,
                syncStatus: 'synced' as SyncStatus,
                updatedAt: transformed.updatedAt || new Date()
            };
            await indexedDBService.put(STORES.TRANSACTIONS, syncedTransaction);
        }
    }

    async initialSync(): Promise<void> {
        await this.init();
        try {
            const response = await fetch('api/transactions', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const transactions = await response.json();
                await this.syncFromAPI(transactions);
            }
        } catch (error) {
            console.error('Failed to perform initial sync for transactions:', error);
        }
    }

    private triggerSync(): void {
        // Post message to service worker to trigger sync
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SYNC_REQUEST',
                entityType: 'transactions'
            });
        }
    }
}

export const transactionService = new TransactionService();
