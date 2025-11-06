export const RECURRING_PAYMENT_TYPES = ['Standing Order', 'Direct Debit', 'Income', 'Transfer'];
export type RecurringPaymentType = (typeof RECURRING_PAYMENT_TYPES)[number];