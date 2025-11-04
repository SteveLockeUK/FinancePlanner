import type { AccountType } from "./AccountType"
import type { Currency } from "./Currencies"

export default interface Account {
    id: number
    name: string
    type: AccountType
    currency: Currency
    startingBalance: number
    createdAt: Date
    updatedAt: Date
    archivedAt?: Date
}

