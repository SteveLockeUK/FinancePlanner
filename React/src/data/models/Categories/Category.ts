import type { CategoryType } from "./CategoryTypes";

export default interface Category {
    id: number;
    userId: string;
    name: string;
    type: CategoryType;
    color?: string;
    icon?: string;
}