import type RecurringPayment from "@/data/models/RecurringPayments/RecurringPayment.ts";
import {recurringPaymentStore} from "@/data/stores/RecurringPaymentStore.ts";

class RecurringPaymentService {
    async getRecurringPayments(): Promise<RecurringPayment[]> {
        const response = await fetch('api/recurring-payments', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recurring payments');
        }

        let payments = await response.json();
        recurringPaymentStore.setRecurringPayments(payments);

        return payments;
    }

    async createRecurringPayment(paymentData: Partial<RecurringPayment>): Promise<RecurringPayment> {
        let request = JSON.stringify(paymentData);
        debugger;
        const response = await fetch('api/recurring-payments', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: request
        });

        if (!response.ok) {
            throw new Error('Failed to create recurring payment');
        }

        return (await response.json()).value;
    }

    async updateRecurringPayment(id: number, payment: RecurringPayment): Promise<RecurringPayment> {
        const response = await fetch(`api/recurring-payments/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payment)
        });

        if (!response.ok) {
            throw new Error('Failed to update recurring payment');
        }

        return await response.json();
    }

    async deleteRecurringPayment(id: number): Promise<void> {
        const response = await fetch(`api/recurring-payments/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete recurring payment');
        }
    }
}

export const recurringPaymentService = new RecurringPaymentService();