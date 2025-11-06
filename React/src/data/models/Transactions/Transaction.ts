import type { TransactionType } from "./TransactionTypes"

export default interface Transaction {
    id: number;
    userId: string;
    description: string;
    type: TransactionType;
    amount: number;
    fromAccountId?: number;
    toAccountId?: number;
    categoryId?: number;
    recurrenceId?: number;
    date: Date; 
    createdAt: Date;
    updatedAt?: Date;
}
