import type { RecurringPaymentFrequency } from "./RecurringPaymentFrequencies";
import type { RecurringPaymentType } from "./RecurringPaymentTypes";
import type BaseEntity from "../BaseEntity";

export default interface RecurringPayment extends BaseEntity {
    userId: string;
    name: string;
    description?: string | null;
    type: RecurringPaymentType;
    amount: number;
    frequency: RecurringPaymentFrequency;
    startDate: Date;
    endDate?: Date | null;
    fromAccountId?: number | null;
    toAccountId?: number | null;
    categoryId?: number | null;
    isActive: boolean;
    lastGeneratedAt?: Date | null;
    nextPaymentDate?: Date | null;
    createdAt: Date;
}