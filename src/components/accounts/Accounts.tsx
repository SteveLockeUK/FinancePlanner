import { useState, useEffect } from 'react'
import Title from '@/components/ui/Title'
import DataTable, { type ColumnDef } from '@/components/ui/DataTable'
import type Account from '@/data/models/Account'
import type { AccountType } from '@/data/models/AccountType'
import { accountStore } from '@/data/stores/AccountStore'
import { ACCOUNT_TYPES } from '@/data/models/AccountType'
import { CURRENCIES, type Currency } from '@/data/models/Currencies'

export default function Accounts() {
    const [rows, setRows] = useState<Account[]>(accountStore.getAccounts())

    // Load accounts from store on mount
    useEffect(() => {
        setRows(accountStore.getAccounts())
    }, [])

    const columns: ColumnDef<Account>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'text',
                required: true,
                placeholder: 'Enter account name'
            },
            render: (value: string) => value,
        },
        {
            key: 'currency',
            label: 'Currency',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: true,
                options: CURRENCIES.map(currency => ({label: currency, value: currency}))
            },
            render: (value: Currency) => value,
        },        
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: true,
                options: ACCOUNT_TYPES.map(type => ({ label: type, value: type }))
            },
            render: (value: AccountType) => value,
        },
        {
            key: 'startingBalance',
            label: 'Starting Balance',
            sortable: true,
            filterable: true,
            editable: true,
            requiredOnAdd: true,
            fieldConfig: {
                type: 'number',
                required: true,
                step: 0.01,
                placeholder: '0.00'
            },
            render: (value: number) => value.toLocaleString('en-GB', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
        {
            key: 'createdAt',
            label: 'Created At',
            sortable: true,
            filterable: true,
            editable: false,
            fieldConfig: {
                type: 'date',
                readonly: true
            },
            render: (value: Date) => new Date(value).toLocaleDateString('en-GB'),
        },
        {
            key: 'updatedAt',
            label: 'Updated At',
            sortable: true,
            filterable: true,
            editable: false,
            fieldConfig: {
                type: 'date',
                readonly: true
            },
            render: (value: Date) => new Date(value).toLocaleDateString('en-GB')
        }
    ]

    const handleSaveAdd = (accountData: Partial<Account>) => {
        const newAccount: Omit<Account, 'id'> = {
            name: accountData.name || '',
            type: (accountData.type as AccountType) || 'Current',
            currency: accountData.currency || 'GBP',
            startingBalance: accountData.startingBalance || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        accountStore.addAccount(newAccount)
        setRows(accountStore.getAccounts())
    }

    const handleSaveEdit = (account: Account) => {
        accountStore.updateAccount(account.id, {
            ...account,
            updatedAt: new Date()
        })
        setRows(accountStore.getAccounts())
    }

    const handleDelete = (account: Account) => {
        accountStore.deleteAccount(account.id)
        setRows(accountStore.getAccounts())
    }

    return (
        <>
            <Title text='Accounts' />
            <DataTable 
                entityName='Account' 
                columns={columns} 
                rows={rows}
                enableAddDialog={true}
                enableEditDialog={true}
                enableDeleteDialog={true}
                onSaveAdd={handleSaveAdd}
                onSaveEdit={handleSaveEdit}
                onConfirmDelete={handleDelete}
            />
        </>
    )
}