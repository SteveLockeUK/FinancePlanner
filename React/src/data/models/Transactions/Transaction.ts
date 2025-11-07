import type { TransactionType } from "./TransactionTypes"
import type BaseEntity from "../BaseEntity";

export default interface Transaction extends BaseEntity {
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
}
