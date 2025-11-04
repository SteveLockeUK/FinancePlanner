import type RecurringPayment from '@/data/models/RecurringPayment'

const STORAGE_KEY = 'finance-planner-recurring-payments'

class RecurringPaymentStore {
    private recurringPayments: RecurringPayment[] = []

    constructor() {
        this.loadRecurringPayments()
    }

    private loadRecurringPayments(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if(stored) {
                let parsed = stored ?JSON.parse(stored) : [];
                this.recurringPayments = parsed.map((p: RecurringPayment) => ({
                    ...p,
                    startDate: new Date(p.startDate),
                    endDate: p.endDate ? new Date(p.endDate) : undefined,
                    lastGeneratedAt: p.lastGeneratedAt ? new Date(p.lastGeneratedAt) : undefined,
                    createdAt: new Date(p.createdAt),
                    updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
                    fromAccountId: p.fromAccountId ? Number(p.fromAccountId) : undefined,
                    toAccountId: p.toAccountId ? Number(p.toAccountId) : undefined,
                }));
            }
        } catch (error) {
            console.error('Error loading recurring payments from LocalStorage:', error)
        }
    }

    private saveRecurringPayments(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.recurringPayments))
        } catch (error) {
            console.error('Error saving recurring payments to LocalStorage:', error)
        }
    }

    getRecurringPayments(): RecurringPayment[] {
        return [...this.recurringPayments]
    }

    addRecurringPayment(RecurringPayment: Omit<RecurringPayment, "id">): RecurringPayment {
        const newId = this.recurringPayments.length > 0
        ? Math.max(...this.recurringPayments.map(p => p.id)) + 1
        : 1

        const newRecurringPayment: RecurringPayment = {
            id: newId,
            ...RecurringPayment,
        }

        this.recurringPayments.push(newRecurringPayment)
        this.saveRecurringPayments()
        return newRecurringPayment
    }

    updateRecurringPayment(id: number, updatedRecurringPayment: Partial<Omit<RecurringPayment, "id">>): RecurringPayment | null {
        const index = this.recurringPayments.findIndex(p => p.id === id)
        
        if(index === -1) {
            return null
        }

        this.recurringPayments[index] = {
            ...this.recurringPayments[index],
            ...updatedRecurringPayment,
        }
        this.saveRecurringPayments()
        return this.recurringPayments[index]
    }

    deleteRecurringPayment(id: number): boolean {
        const index = this.recurringPayments.findIndex(p => p.id === id)
        if(index !== -1) {
            this.recurringPayments.splice(index, 1)
            this.saveRecurringPayments()
            return true
        }
        return false
    }
}

export const recurringPaymentStore = new RecurringPaymentStore()