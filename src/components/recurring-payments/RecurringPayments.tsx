import { useState, useEffect } from 'react';
import Title from '@/components/ui/Title';
import DataTable, { type ColumnDef } from '@/components/ui/DataTable';
import type RecurringPayment from '@/data/models/RecurringPayments/RecurringPayment';
import { type RecurringPaymentFrequency, RECURRING_PAYMENT_FREQUENCIES } from '@/data/models/RecurringPayments/RecurringPaymentFrequencies';
import { type RecurringPaymentType, RECURRING_PAYMENT_TYPES } from '@/data/models/RecurringPayments/RecurringPaymentTypes';
import { recurringPaymentStore } from '@/data/stores/RecurringPaymentStore';
import { accountStore } from '@/data/stores/AccountStore';
import type Account from '@/data/models/Accounts/Account';
import calculateNextPaymentDate from '@/data/models/RecurringPayments/RecurringPaymentHelpers';

export default function RecurringPayments() {
    const [rows, setRows] = useState<RecurringPayment[]>(recurringPaymentStore.getRecurringPayments());
    const [accounts, setAccounts] = useState<Account[]>(accountStore.getAccounts());
    useEffect(() => {
        setRows(recurringPaymentStore.getRecurringPayments());
        setAccounts(accountStore.getAccounts());
    }, []);

    const columns: ColumnDef<RecurringPayment>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'text',
                required: true,
                placeholder: 'Enter recurring payment name'
            },
            render: (value: string) => value,
        },
        {
            key: 'description',
            label: 'Description',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'textarea',
                placeholder: 'Enter recurring payment description'
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
                options: RECURRING_PAYMENT_TYPES.map(type => ({ label: type, value: type }))
            },
            render: (value: RecurringPaymentType) => value,
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
            },
            render: (value: number) => value.toLocaleString('en-GB', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
        {
            key: 'frequency',
            label: 'Frequency',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'select',
                required: true,
                options: RECURRING_PAYMENT_FREQUENCIES.map(frequency => ({ label: frequency, value: frequency }))
            },
            render: (value: RecurringPaymentFrequency) => value,
        },
        {
            key: 'startDate',
            label: 'Start Date',
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
            key: 'endDate',
            label: 'End Date',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'date',
            },
            render: (value: Date) => value ? new Date(value).toLocaleDateString('en-GB') : '',
        },
        {
            key: 'active',
            label: 'Active',
            sortable: true,
            filterable: true,
            editable: true,
            fieldConfig: {
                type: 'checkbox',
                required: true,
            },
            render: (value: boolean) => value ? 'Yes' : 'No',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            sortable: true,
            filterable: true,
            editable: false,
            fieldConfig: {
                type: 'date',
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
            },
            render: (value: Date) => new Date(value).toLocaleDateString('en-GB'),
        },
        {
            key: 'lastGeneratedAt',
            label: 'Last Generated At',
            sortable: true,
            filterable: true,
            editable: false,
            fieldConfig: {
                type: 'date',
            },
            render: (value: Date) => value ? new Date(value).toLocaleDateString('en-GB') : '',
        },
        {
            key: 'nextPaymentDate',
            label: 'Next Payment Date',
            sortable: true,
            filterable: true,
            editable: false,
            fieldConfig: {
                type: 'date',
            },
            render: (value: Date) => value ? new Date(value).toLocaleDateString('en-GB') : '',
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
                options: accounts.map(account => ({ label: account.name, value: account.id }))
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
                options: accounts.map(account => ({ label: account.name, value: account.id }))
            },
            render: (value: number) => accounts.find(x => x.id == value)?.name || '',
        }
    ];    

    const handleSaveAdd = (recurringPaymentData: Partial<RecurringPayment>) => {
        const nextPaymentDate = calculateNextPaymentDate(recurringPaymentData as RecurringPayment);
        const newRecurringPayment: Omit<RecurringPayment, 'id'> = {
            userId: '',
            name: recurringPaymentData.name || '',
            description: recurringPaymentData.description || '',
            type: (recurringPaymentData.type as RecurringPaymentType) || 'Standing Order',
            amount: recurringPaymentData.amount || 0,
            frequency: (recurringPaymentData.frequency as RecurringPaymentFrequency) || 'Weekly',
            startDate: recurringPaymentData.startDate || new Date(),
            endDate: recurringPaymentData.endDate || undefined,
            fromAccountId: Number(recurringPaymentData.fromAccountId) || undefined,
            toAccountId: Number(recurringPaymentData.toAccountId) || undefined,
            nextPaymentDate: nextPaymentDate,
            active: recurringPaymentData.active || true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        recurringPaymentStore.addRecurringPayment(newRecurringPayment);
        setRows(recurringPaymentStore.getRecurringPayments());
    }

    const handleSaveEdit = (recurringPayment: RecurringPayment) => {
        recurringPaymentStore.updateRecurringPayment(recurringPayment.id, {
            ...recurringPayment,
            nextPaymentDate: calculateNextPaymentDate(recurringPayment),
            updatedAt: new Date()
        });
        setRows(recurringPaymentStore.getRecurringPayments());
    }

    const handleDelete = (recurringPayment: RecurringPayment) => {
        recurringPaymentStore.deleteRecurringPayment(recurringPayment.id);
        setRows(recurringPaymentStore.getRecurringPayments());
    }

    return (
        <>
            <Title text='Recurring Payments' />
            <DataTable
                entityName='Recurring Payment'
                columns={columns}
                rows={rows}
                enableAddDialog={true}
                enableEditDialog={true}
                enableDeleteDialog={true}
                onSaveAdd={handleSaveAdd}
                onSaveEdit={handleSaveEdit}
                onConfirmDelete={handleDelete}
                defaultSortColumn={'startDate'}
                defaultSortDirection='asc'
            />
        </>
    )
}