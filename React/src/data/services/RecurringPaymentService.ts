import type RecurringPayment from "@/data/models/RecurringPayments/RecurringPayment.ts";
import { indexedDBService, STORES } from "./IndexedDBService.ts";
import type { SyncStatus } from "@/data/models/BaseEntity.ts";

class RecurringPaymentService {
    async init(): Promise<void> {
        await indexedDBService.init();
    }

    private transformRecurringPayment(payment: any): RecurringPayment {
        return {
            ...payment,
            startDate: new Date(payment.startDate),
            endDate: payment.endDate ? new Date(payment.endDate) : null,
            lastGeneratedAt: payment.lastGeneratedAt ? new Date(payment.lastGeneratedAt) : null,
            nextPaymentDate: payment.nextPaymentDate ? new Date(payment.nextPaymentDate) : null,
            createdAt: new Date(payment.createdAt),
            updatedAt: payment.updatedAt ? new Date(payment.updatedAt) : new Date(),
            fromAccountId: payment.fromAccountId ? Number(payment.fromAccountId) : null,
            toAccountId: payment.toAccountId ? Number(payment.toAccountId) : null,
            syncStatus: payment.syncStatus || 'synced'
        };
    }

    async getRecurringPayments(): Promise<RecurringPayment[]> {
        await this.init();
        return await indexedDBService.getAll<RecurringPayment>(STORES.RECURRING_PAYMENTS);
    }

    async createRecurringPayment(paymentData: Partial<RecurringPayment>): Promise<RecurringPayment> {
        await this.init();
        
        // Generate a temporary negative ID for pending entities
        const tempId = Date.now() * -1;
        
        const newPayment: RecurringPayment = {
            id: tempId,
            userId: paymentData.userId || '',
            name: paymentData.name || '',
            description: paymentData.description || null,
            type: paymentData.type!,
            amount: paymentData.amount || 0,
            frequency: paymentData.frequency!,
            startDate: paymentData.startDate || new Date(),
            endDate: paymentData.endDate || null,
            fromAccountId: paymentData.fromAccountId || null,
            toAccountId: paymentData.toAccountId || null,
            categoryId: paymentData.categoryId || null,
            isActive: paymentData.isActive ?? true,
            lastGeneratedAt: paymentData.lastGeneratedAt || null,
            nextPaymentDate: paymentData.nextPaymentDate || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus
        };

        await indexedDBService.add(STORES.RECURRING_PAYMENTS, newPayment);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return newPayment;
    }

    async updateRecurringPayment(id: number, payment: Partial<RecurringPayment>): Promise<RecurringPayment> {
        await this.init();
        
        const existing = await indexedDBService.getById<RecurringPayment>(STORES.RECURRING_PAYMENTS, id);
        if (!existing) {
            throw new Error(`RecurringPayment with id ${id} not found`);
        }

        const updatedPayment: RecurringPayment = {
            ...existing,
            ...payment,
            updatedAt: new Date(),
            syncStatus: 'pending' as SyncStatus
        };

        await indexedDBService.put(STORES.RECURRING_PAYMENTS, updatedPayment);
        
        // Trigger sync in service worker
        this.triggerSync();
        
        return updatedPayment;
    }

    async deleteRecurringPayment(id: number): Promise<void> {
        await this.init();
        
        const existing = await indexedDBService.getById<RecurringPayment>(STORES.RECURRING_PAYMENTS, id);
        if (!existing) {
            throw new Error(`RecurringPayment with id ${id} not found`);
        }

        // If it's a pending entity that hasn't been synced, just delete it
        if (existing.syncStatus === 'pending' && existing.id < 0) {
            await indexedDBService.delete(STORES.RECURRING_PAYMENTS, id);
        } else {
            // Mark as deleted for sync
            existing.syncStatus = 'deleted';
            existing.updatedAt = new Date();
            await indexedDBService.put(STORES.RECURRING_PAYMENTS, existing);
        }
        
        // Trigger sync in service worker
        this.triggerSync();
    }

    async syncFromAPI(payments: any[]): Promise<void> {
        await this.init();
        
        // Update or insert payments from API
        for (const payment of payments) {
            const transformed = this.transformRecurringPayment(payment);
            const syncedPayment: RecurringPayment = {
                ...transformed,
                syncStatus: 'synced' as SyncStatus,
                updatedAt: transformed.updatedAt || new Date()
            };
            await indexedDBService.put(STORES.RECURRING_PAYMENTS, syncedPayment);
        }
    }

    async initialSync(): Promise<void> {
        await this.init();
        try {
            const response = await fetch('api/recurring-payments', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const payments = await response.json();
                await this.syncFromAPI(payments);
            }
        } catch (error) {
            console.error('Failed to perform initial sync for recurring payments:', error);
        }
    }

    private triggerSync(): void {
        // Post message to service worker to trigger sync
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SYNC_REQUEST',
                entityType: 'recurringPayments'
            });
        }
    }
}

export const recurringPaymentService = new RecurringPaymentService();
