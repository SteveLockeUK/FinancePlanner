import { useState, useEffect } from 'react'
import Title from '@/components/ui/Title'
import Table, { type ColumnDef } from '@/components/ui/Table'
import AddAccountDialog from './AddAccountDialog'
import EditAccountDialog from './EditAccountDialog'
import type Account from '@/data/models/Account'
import { accountStore } from '@/data/stores/AccountStore'
import DeleteAccountDialog from './DeleteAccountDialog'

export default function Accounts() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
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
            render: (value: string) => value,
        },
        {
            key: 'balance',
            label: 'Balance',
            sortable: true,
            filterable: true,
            editable: true,
            render: (value: number) => <div className='text-right'>{value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</div>,
        }
    ]

    const onAddAccount = () => {
        setIsAddDialogOpen(true)
    }

    const onEditAccount = (row: Account) => {
        setSelectedAccount(row)
        setIsEditDialogOpen(true)
    }

    const onDeleteAccount = (row: Account) => {
        setSelectedAccount(row)
        setIsDeleteDialogOpen(true)
    }

    const handleSaveAccount = (accountData: Omit<Account, 'id'>) => {
        // Add account to store
        accountStore.addAccount(accountData)
        // Update local state
        setRows(accountStore.getAccounts())
    }

    const handleEditAccount = (account: Account) => {
        accountStore.updateAccount(account.id, account)
        setRows(accountStore.getAccounts())
    }

    const handleDeleteAccount = (id: number) => {
        accountStore.deleteAccount(id)
        setRows(accountStore.getAccounts())
    }

    return (
        <>
            <Title text='Accounts' />
            <Table entityName='Account' columns={columns} rows={rows} onAdd={onAddAccount} onEdit={onEditAccount} onDelete={onDeleteAccount} />

            <AddAccountDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSave={handleSaveAccount}
            />

            <EditAccountDialog
                isOpen={isEditDialogOpen}
                account={selectedAccount}
                onClose={() => {
                    setSelectedAccount(null)
                    setIsEditDialogOpen(false)
                }}
                onSave={handleEditAccount}
            />

            <DeleteAccountDialog
                isOpen={isDeleteDialogOpen}
                account={selectedAccount}
                onClose={() => {
                    setSelectedAccount(null)
                    setIsDeleteDialogOpen(false)
                }}
                onDelete={handleDeleteAccount}                
            />            
        </>
    )
}