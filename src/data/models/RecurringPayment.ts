
export interface RecurringPayment {
    id: string;
    userId: string;
    description: string;
    type: 'standingOrder' | 'directDebit' | 'income' | 'transfer';
    amount: number;
    frequency: 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
    fromAccountId?: string;
    toAccountId?: string;
    categoryId?: string;
    active: boolean;
    lastGeneratedAt?: string;
    createdAt: string;
}
