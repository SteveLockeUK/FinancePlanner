import type { AccountType } from "./AccountType";
import type { Currency } from "../Currencies";
import type BaseEntity from "../BaseEntity";

export default interface Account extends BaseEntity {
    name: string;
    type: AccountType;
    currency: Currency;
    startingBalance: number;
    createdAt: Date;
    archivedAt?: Date;
}

