import { useState, useEffect } from 'react';
import Title from '@/components/ui/Title';
import DataTable, { type ColumnDef } from '@/components/ui/DataTable';
import type Account from '@/data/models/Accounts/Account';
import type { AccountType } from '@/data/models/Accounts/AccountType';
import { accountService } from '@/data/services/AccountService';
import { ACCOUNT_TYPES } from '@/data/models/Accounts/AccountType';
import { CURRENCIES, type Currency } from '@/data/models/Currencies';

export default function Accounts() {
    const [rows, setRows] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Load accounts from IndexedDB on mount and listen for updates
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const accounts = await accountService.getAccounts();
                setRows(accounts);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccounts();

        // Listen for updates from SignalR and service worker
        const handleAccountsUpdated = async () => {
            await fetchAccounts();
        };

        window.addEventListener('accountsUpdated', handleAccountsUpdated);
        window.addEventListener('dataSyncComplete', (event: any) => {
            if (event.detail?.entityType === 'accounts' || !event.detail?.entityType) {
                fetchAccounts();
            }
        });

        return () => {
            window.removeEventListener('accountsUpdated', handleAccountsUpdated);
            window.removeEventListener('dataSyncComplete', handleAccountsUpdated);
        };
    }, []);

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
            render: (value: Date) => new Date(value).toLocaleDateString('en-GB'),
        }
    ];

    const handleSaveAdd = async (accountData: Partial<Account>) => {
        try {
            const newAccount: Partial<Account> = {
                id: 0, // Will be set by IndexedDB service (temporary negative ID)
                name: accountData.name || '',
                type: (accountData.type as AccountType) || 'Current',
                currency: (accountData.currency as Currency) || 'GBP',
                startingBalance: accountData.startingBalance || 0
            };
            await accountService.createAccount(newAccount);
            // Refetch accounts from IndexedDB
            const accounts = await accountService.getAccounts();
            setRows(accounts);
        } catch (error) {
            console.error('Failed to create account:', error);
            throw error;
        }
    }

    const handleSaveEdit = async (account: Account) => {
        try {
            await accountService.updateAccount(account.id, {
                ...account,
                updatedAt: new Date()
            });
            // Refetch accounts from IndexedDB
            const accounts = await accountService.getAccounts();
            setRows(accounts);
        } catch (error) {
            console.error('Failed to update account:', error);
            throw error;
        }
    }

    const handleDelete = async (account: Account) => {
        try {
            await accountService.deleteAccount(account.id);
            // Refetch accounts from IndexedDB
            const accounts = await accountService.getAccounts();
            setRows(accounts);
        } catch (error) {
            console.error('Failed to delete account:', error);
            throw error;
        }
    }

    if (loading) {
        return (
            <>
                <Title text='Accounts' />
                <div>Loading accounts...</div>
            </>
        );
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