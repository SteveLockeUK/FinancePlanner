export const CURRENCIES = ['GBP', 'USD', 'EUR'] as const;
export type Currency = typeof CURRENCIES[number];