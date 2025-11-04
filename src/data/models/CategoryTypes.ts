export const CATEGORY_TYPES = ['Income', 'Expense'] as const
export type CategoryType = typeof CATEGORY_TYPES[number]