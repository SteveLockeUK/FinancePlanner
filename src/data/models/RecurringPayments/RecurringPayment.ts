import type { RecurringPaymentFrequency } from "./RecurringPaymentFrequencies";
import type { RecurringPaymentType } from "./RecurringPaymentTypes";

export default interface RecurringPayment {
    id: number;
    userId: string;
    name: string;
    description?: string;
    type: RecurringPaymentType;
    amount: number;
    frequency: RecurringPaymentFrequency;
    startDate: Date;
    endDate?: Date;
    fromAccountId?: number;
    toAccountId?: number;
    categoryId?: number;
    active: boolean;
    lastGeneratedAt?: Date;
    nextPaymentDate?: Date | null;
    createdAt: Date;
    updatedAt?: Date;
}
