
export interface Category {
    id: string;
    userId: string;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
}
