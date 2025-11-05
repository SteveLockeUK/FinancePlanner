import { useState, useEffect } from 'react'
import type Account from "@/data/models/Accounts/Account";
import type Transaction from '@/data/models/Transactions/Transaction';
import type RecurringPayment from '@/data/models/RecurringPayments/RecurringPayment';
import { recurringPaymentStore } from '@/data/stores/RecurringPaymentStore';
import { transactionStore } from '@/data/stores/TransactionStore';
import calculateNextPaymentDate from '@/data/models/RecurringPayments/RecurringPaymentHelpers';
import Dialog from '@/components/ui/Dialog';

interface RecurringPaymentTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    account: Account;
}

export default function RecurringPaymentTransactionDialog({ isOpen, onClose, account }: RecurringPaymentTransactionDialogProps) {
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [selectedRecurringPayment, setSelectedRecurringPayment] = useState<RecurringPayment | null>(null);
    const [showDateEditor, setShowDateEditor] = useState(false);
    const [transactionDate, setTransactionDate] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const upperBound = new Date(today.setDate(today.getDate() + 3));
            const lowerBound = new Date(today.setDate(today.getDate() - 3));
            
            let paymentsForAccount = recurringPaymentStore.getRecurringPayments();
            paymentsForAccount = paymentsForAccount
                .filter(x => x.active && x.nextPaymentDate && (x.fromAccountId == account.id || x.toAccountId == account.id));                

            paymentsForAccount = paymentsForAccount
                .filter(x => !x.lastGeneratedAt || (x.nextPaymentDate && new Date(x.nextPaymentDate) <= upperBound));

            setRecurringPayments(paymentsForAccount);
            setSelectedRecurringPayment(null);
            setShowDateEditor(false);
            setTransactionDate('');
        }
    }, [isOpen, account.id]);

    const onCancel = () => {
        setSelectedRecurringPayment(null);
        setShowDateEditor(false);
        setTransactionDate('');
        onClose();
    }

    const handleSelectRecurringPayment = (recurringPayment: RecurringPayment) => {
        setSelectedRecurringPayment(recurringPayment);
        setShowDateEditor(false);
        // Set default date to next payment date or today
        const defaultDate = new Date();
        setTransactionDate(defaultDate.toISOString().split('T')[0]);
    }

    const handleCreateTransactionClick = () => {
        if (selectedRecurringPayment) {
            setShowDateEditor(true);
        }
    }

    const generateTransaction = () => {
        if (!selectedRecurringPayment) {
            return;
        }

        const date = transactionDate ? new Date(transactionDate) : (selectedRecurringPayment.nextPaymentDate || new Date());

        if(selectedRecurringPayment.endDate && date > selectedRecurringPayment.endDate) {            
            return;
        }

        const transaction = {
            userId: '',
            description: selectedRecurringPayment.name,
            type: selectedRecurringPayment.type,
            amount: selectedRecurringPayment.amount,
            date: date,
            fromAccountId: selectedRecurringPayment.fromAccountId,
            toAccountId: selectedRecurringPayment.toAccountId,
            categoryId: selectedRecurringPayment.categoryId,
            recurrenceId: selectedRecurringPayment.id,
            createdAt: new Date(),
            updatedAt: new Date()
        } as Omit<Transaction, 'id'>;
        transactionStore.addTransaction(transaction);

        recurringPaymentStore.updateRecurringPayment(selectedRecurringPayment.id, {
            lastGeneratedAt: new Date(),
            nextPaymentDate: calculateNextPaymentDate(selectedRecurringPayment)
        } as Partial<RecurringPayment>);
        
        setSelectedRecurringPayment(null);
        setShowDateEditor(false);
        setTransactionDate('');
        onClose();
    }

    const formatDate = (date: Date | undefined | null): string => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB');
    }

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
    }

    return (
        <Dialog isOpen={isOpen} onClose={onCancel} title="Create Transaction from Recurring Payment">
            <div className="space-y-4">
                {!showDateEditor ? (
                    <>
                        <div>
                            <p className="text-sm text-gray-600 mb-3">
                                Select a recurring payment to create a transaction for account: <strong>{account.name}</strong>
                            </p>
                            {recurringPayments.length === 0 ? (
                                <p className="text-gray-500 text-sm">No recurring payments available for this account.</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {recurringPayments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            onClick={() => handleSelectRecurringPayment(payment)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedRecurringPayment?.id === payment.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                                                    {payment.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                        <span>{payment.type}</span>
                                                        <span>•</span>
                                                        <span>{payment.frequency}</span>
                                                        {payment.nextPaymentDate && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Next: {formatDate(payment.nextPaymentDate)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTransactionClick}
                                disabled={!selectedRecurringPayment}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    selectedRecurringPayment
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                Create Transaction
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {selectedRecurringPayment && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">{selectedRecurringPayment.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>Amount: {formatCurrency(selectedRecurringPayment.amount)}</p>
                                        <p>Type: {selectedRecurringPayment.type}</p>
                                        <p>Frequency: {selectedRecurringPayment.frequency}</p>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Transaction Date
                                    </label>
                                    <input
                                        id="transaction-date"
                                        type="date"
                                        value={transactionDate}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => setShowDateEditor(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={generateTransaction}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Dialog>
    );
}

