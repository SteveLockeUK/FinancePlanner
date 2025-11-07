import { useState, useEffect } from 'react';
import Title from '@/components/ui/Title';
import DataTable, { type ColumnDef } from '@/components/ui/DataTable';
import type Transaction from '@/data/models/Transactions/Transaction';
import { type TransactionType, TRANSACTION_TYPES } from '@/data/models/Transactions/TransactionTypes';
import { transactionService } from '@/data/services/TransactionService';
import { accountService } from '@/data/services/AccountService';
import type Account from '@/data/models/Accounts/Account';
import type RecurringPayment from '@/data/models/RecurringPayments/RecurringPayment';
import { recurringPaymentService } from '@/data/services/RecurringPaymentService';

export default function Transactions() {
    const [rows, setRows] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const fetchTransactions = async () => {
        try {
            const transactions = await transactionService.getTransactions();
            setRows(transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    }

    const fetchAccounts = async () => {
        try {
            const accountsData = await accountService.getAccounts();
            setAccounts(accountsData);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    }

    const fetchRecurringPayments = async () => {
        try {
            const payments = await recurringPaymentService.getRecurringPayments();
            setRecurringPayments(payments);
        } catch (error) {
            console.error('Failed to fetch recurring payments:', error);
        }
    }
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTransactions(),
                fetchAccounts(),
                fetchRecurringPayments()
            ]);
            setLoading(false);
        };
        loadData();

        // Listen for updates from SignalR and service worker
        const handleTransactionsUpdated = async () => {
            await fetchTransactions();
        };

        const handleAccountsUpdated = async () => {
            await fetchAccounts();
        };

        const handleRecurringPaymentsUpdated = async () => {
            await fetchRecurringPayments();
        };

        window.addEventListener('transactionsUpdated', handleTransactionsUpdated);
        window.addEventListener('accountsUpdated', handleAccountsUpdated);
        window.addEventListener('recurringPaymentsUpdated', handleRecurringPaymentsUpdated);
        window.addEventListener('dataSyncComplete', (event: any) => {
            if (event.detail?.entityType === 'transactions' || !event.detail?.entityType) {
                fetchTransactions();
            }
            if (event.detail?.entityType === 'accounts' || !event.detail?.entityType) {
                fetchAccounts();
            }
            if (event.detail?.entityType === 'recurringPayments' || !event.detail?.entityType) {
                fetchRecurringPayments();
            }
        });

        return () => {
            window.removeEventListener('transactionsUpdated', handleTransactionsUpdated);
            window.removeEventListener('accountsUpdated', handleAccountsUpdated);
            window.removeEventListener('recurringPaymentsUpdated', handleRecurringPaymentsUpdated);
        };
    }, []);

    const columns: ColumnDef<Transaction>[] = [
        {
            key: 'description',
            label: 'Description',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'text',
                required: true,
                placeholder: 'Enter transaction description'
            },
            render: (value: string) => value,
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
                options: TRANSACTION_TYPES.map(type => ({label: type, value: type}))
            },
            render: (value: TransactionType) => value,
        },
        {
            key: 'recurrenceId',
            label: 'Recurrence',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: false,
                options: recurringPayments.map(recurrence => ({label: recurrence.name, value: recurrence.id}))
            },
            render: (value: number) => recurringPayments.find(x => x.id == value)?.name || '',
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'number',
                required: true,
                step: 0.01,
                placeholder: '0.00'
            },
            render: (value: number) => value.toLocaleString('en-GB', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {                
                type: 'date',
                required: true,
            },
            render: (value: Date) => new Date(value).toLocaleDateString('en-GB'),
        },
        {
            key: 'fromAccountId',
            label: 'From Account',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: false,
                options: accounts.map(account => ({label: account.name, value: account.id}))
            },
            render: (value: number) => accounts.find(x => x.id == value)?.name || '',
        },
        {
            key: 'toAccountId',
            label: 'To Account',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: false,
                options: accounts.map(account => ({label: account.name, value: account.id}))
            },
            render: (value: number) => accounts.find(x => x.id == value)?.name || '',
        },
        {
            key: 'categoryId',
            label: 'Category',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: false,
                options: []
            },
            render: (value: number) => value ? value.toString() : '',
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
            render: (value: Date) => value ? new Date(value).toLocaleDateString('en-GB') : '',
        }
    ];

    const handleSaveAdd = async (transactionData: Partial<Transaction>) => {
        try {
            const newTransaction: Partial<Transaction> = {
                description: transactionData.description || '',
                type: (transactionData.type as TransactionType) || 'Expense',
                amount: transactionData.amount || 0,
                date: transactionData.date || new Date(),
                fromAccountId: Number(transactionData.fromAccountId) || undefined,
                toAccountId: Number(transactionData.toAccountId) || undefined,
                categoryId: Number(transactionData.categoryId) || undefined,
                recurrenceId: Number(transactionData.recurrenceId) || undefined,
            };
            await transactionService.createTransaction(newTransaction);
            // Refetch transactions to get the updated list
            const transactions = await transactionService.getTransactions();
            setRows(transactions);
        } catch (error) {
            console.error('Failed to create transaction:', error);
            throw error;
        }
    }

    const handleSaveEdit = async (transaction: Transaction) => {
        try {
            await transactionService.updateTransaction(transaction.id, {
                ...transaction,
                updatedAt: new Date()
            });
            // Refetch transactions to get the updated list
            const transactions = await transactionService.getTransactions();
            setRows(transactions);
        } catch (error) {
            console.error('Failed to update transaction:', error);
            throw error;
        }
    }

    const handleDelete = async (transaction: Transaction) => {
        try {
            await transactionService.deleteTransaction(transaction.id);
            // Refetch transactions to get the updated list
            const transactions = await transactionService.getTransactions();
            setRows(transactions);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            throw error;
        }
    }

    if (loading) {
        return (
            <>
                <Title text='Transactions' />
                <div>Loading transactions...</div>
            </>
        );
    }

    return (
        <>
            <Title text='Transactions' />
            <DataTable 
                entityName='Transaction' 
                columns={columns} 
                rows={rows}
                enableAddDialog={true}
                enableEditDialog={true}
                enableDeleteDialog={true}
                onSaveAdd={handleSaveAdd}
                onSaveEdit={handleSaveEdit}
                onConfirmDelete={handleDelete}
                defaultSortColumn={'date'}
                defaultSortDirection='asc'
            />
        </>
    )
}
