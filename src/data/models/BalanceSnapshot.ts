
export interface BalanceSnapshot {
    id: string;
    userId: string;
    accountId: string;
    date: string; // e.g. month-end date
    balance: number;
}
