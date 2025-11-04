
export default interface BalanceSnapshot {
    id: number;
    userId: string;
    accountId: string;
    date: string; // e.g. month-end date
    balance: number;
}
