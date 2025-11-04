import type Transaction from '@/data/models/Transactions/Transaction';

const STORAGE_KEY = 'finance-planner-transactions';

class TransactionStore {
    private transactions: Transaction[] = [];

    constructor() {
        this.loadTransactions();
    }

    private loadTransactions(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if(stored) {
                let parsed = stored ? JSON.parse(stored) : [];
                this.transactions = parsed.map((t: Transaction) => ({
                    ...t,
                    date: new Date(t.date),
                    createdAt: new Date(t.createdAt),
                    updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
                    fromAccountId: t.fromAccountId ? Number(t.fromAccountId) : undefined,
                    toAccountId: t.toAccountId ? Number(t.toAccountId) : undefined,
                    categoryId: t.categoryId ? Number(t.categoryId) : undefined,
                    recurrenceId: t.recurrenceId ? Number(t.recurrenceId) : undefined,
                }));
            }
        } catch (error) {
            console.error('Error loading transactions from LocalStorage:', error);
        }
    }

    private saveTransactions(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving transactions to LocalStorage:', error);
        }
    }

    getTransactions(): Transaction[] {
        return [...this.transactions];
    }

    addTransaction(transaction: Omit<Transaction, "id">): Transaction {
        const newId = this.transactions.length > 0
        ? Math.max(...this.transactions.map(t => t.id)) + 1
        : 1;

        const newTransaction: Transaction = {
            id: newId,
            ...transaction,
        };

        this.transactions.push(newTransaction);
        this.saveTransactions();
        return newTransaction;
    }

    updateTransaction(id: number, updatedTransaction: Partial<Omit<Transaction, "id">>): Transaction | null {
        const index = this.transactions.findIndex(t => t.id === id);
        
        if(index === -1) {
            return null;
        }

        this.transactions[index] = {
            ...this.transactions[index],
            ...updatedTransaction,
        };
        this.saveTransactions();
        return this.transactions[index];
    }

    deleteTransaction(id: number): boolean {
        const index = this.transactions.findIndex(t => t.id === id);
        if(index !== -1) {
            this.transactions.splice(index, 1);
            this.saveTransactions();
            return true;
        }
        return false;
    }
}

export const transactionStore = new TransactionStore();

