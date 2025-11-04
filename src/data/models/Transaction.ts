
export interface Transaction {
    id: string;
    userId: string;
    description: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number; // Always positive
    fromAccountId?: string; // Outflow
    toAccountId?: string; // Inflow
    categoryId?: string;
    recurrenceId?: string; // Link to RecurringPayment if auto-generated
    date: string; // ISO date string
    createdAt: string;
}
