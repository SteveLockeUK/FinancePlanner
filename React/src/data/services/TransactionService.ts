import type Transaction from "@/data/models/Transactions/Transaction.ts";
import {transactionStore} from "@/data/stores/TransactionStore.ts";

class TransactionService {

    private transformTransaction(transaction: Transaction): Transaction {
        return {
            ...transaction,
            date: new Date(transaction.date),
            createdAt: new Date(transaction.createdAt),
            updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : undefined,
            fromAccountId: transaction.fromAccountId ? Number(transaction.fromAccountId) : undefined,
            toAccountId: transaction.toAccountId ? Number(transaction.toAccountId) : undefined,
            recurrenceId: transaction.recurrenceId ? Number(transaction.recurrenceId) : undefined,
        };
    }
    
    async getTransactions(): Promise<Transaction[]> {
        const response = await fetch('api/transactions', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        let transactions = await response.json();
        transactions = transactions.map((t: any) => this.transformTransaction(t));
        transactionStore.setTransactions(transactions);

        return transactions;
    }

    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
        let request = JSON.stringify(transactionData);
        const response = await fetch('api/transactions', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: request
        });

        if (!response.ok) {
            throw new Error('Failed to create transaction');
        }

        return (await response.json()).value;
    }

    async updateTransaction(id: number, transaction: Transaction): Promise<Transaction> {
        const response = await fetch(`api/transactions/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            throw new Error('Failed to update transaction');
        }

        return await response.json();
    }

    async deleteTransaction(id: number): Promise<void> {
        const response = await fetch(`api/transactions/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }
    }
}

export const transactionService = new TransactionService();

