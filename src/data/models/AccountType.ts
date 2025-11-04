export const ACCOUNT_TYPES = ['Current', 'Savings', 'Credit', 'Cash', 'Investment'] as const
export type AccountType = typeof ACCOUNT_TYPES[number]