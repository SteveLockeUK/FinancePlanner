import { useState, useEffect } from 'react';
import Title from '@/components/ui/Title';
import DataTable, { type ColumnDef } from '@/components/ui/DataTable';
import type Transaction from '@/data/models/Transactions/Transaction';
import { type TransactionType, TRANSACTION_TYPES } from '@/data/models/Transactions/TransactionTypes';
import { transactionStore } from '@/data/stores/TransactionStore';
import { accountStore } from '@/data/stores/AccountStore';
import type Account from '@/data/models/Accounts/Account';

export default function Transactions() {
    const [rows, setRows] = useState<Transaction[]>(transactionStore.getTransactions());
    const [accounts, setAccounts] = useState<Account[]>(accountStore.getAccounts());
    
    useEffect(() => {
        setRows(transactionStore.getTransactions());
        setAccounts(accountStore.getAccounts());
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

    const handleSaveAdd = (transactionData: Partial<Transaction>) => {
        const newTransaction: Omit<Transaction, 'id'> = {
            userId: '',
            description: transactionData.description || '',
            type: (transactionData.type as TransactionType) || 'Expense',
            amount: transactionData.amount || 0,
            date: transactionData.date || new Date(),
            fromAccountId: transactionData.fromAccountId || undefined,
            toAccountId: transactionData.toAccountId || undefined,
            categoryId: transactionData.categoryId || undefined,
            recurrenceId: transactionData.recurrenceId || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        transactionStore.addTransaction(newTransaction);
        setRows(transactionStore.getTransactions());
    }

    const handleSaveEdit = (transaction: Transaction) => {
        transactionStore.updateTransaction(transaction.id, {
            ...transaction,
            updatedAt: new Date()
        });
        setRows(transactionStore.getTransactions());
    }

    const handleDelete = (transaction: Transaction) => {
        transactionStore.deleteTransaction(transaction.id);
        setRows(transactionStore.getTransactions());
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
                defaultSortDirection='desc'
            />
        </>
    )
}

