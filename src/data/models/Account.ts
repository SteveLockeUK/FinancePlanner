import type { AccountType } from "./AccountType"

export default interface Account {
    id: number
    name: string
    type: AccountType
    currency: string
    startingBalance: number
    createdAt: Date
    updatedAt: Date
    archivedAt?: Date
}

