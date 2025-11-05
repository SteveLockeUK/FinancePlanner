import type RecurringPayment from "./RecurringPayment";

export default function calculateNextPaymentDate(recurringPayment: RecurringPayment): Date | null {

    if(!recurringPayment.lastGeneratedAt){
        return recurringPayment.startDate;
    }

    var startDate = 
            recurringPayment.lastGeneratedAt ||
            recurringPayment.startDate;

        // We might be going from the last generated date. This might not be the usual day the payment takes place (e.g. if the date fell on a weekend).
        // So we need to reset to the scheduled date.
        startDate.setDate(startDate.getDate());
            
        const nextPaymentDate = new Date(startDate);
        switch (recurringPayment.frequency) {
            case 'Weekly':
                nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
                break;
            case 'Monthly':
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                break;
            case 'Yearly':
                nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
                break;
            default:
                break;
        }

        // If the recurring payment hasn't started yet, return null.
        if(nextPaymentDate < startDate) {
            return null;
        }

        // If the recurring payment has ended, return null.
        if(recurringPayment.endDate && nextPaymentDate > new Date(recurringPayment.endDate)) {
            return null;
        }

        return nextPaymentDate;
}