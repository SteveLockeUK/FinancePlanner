import type Account from '@/data/models/Accounts/Account';

const STORAGE_KEY = 'finance-planner-accounts';
const DEFAULT_ACCOUNTS: Account[] = [
    {
        id: 1,
        name: 'Current Account',
        startingBalance: 2000.00,
        type: 'Current',
        currency: 'GBP',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        name: 'Savings Account',
        startingBalance: 1000.00,
        type: 'Savings',
        currency: 'GBP',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

/**
 * AccountStore - Manages account data with LocalStorage persistence
 * Mock API store that persists data across page loads
 */
class AccountStore {
    private accounts: Account[] = [];

    constructor() {
        this.loadAccounts();
    }

    /**
     * Load accounts from LocalStorage, or initialize with default accounts
     */
    private loadAccounts(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.accounts = JSON.parse(stored) as Account[];
            } else {
                // First use - initialize with default accounts
                this.accounts = [...DEFAULT_ACCOUNTS];
                this.saveAccounts();
            }
        } catch (error) {
            console.error('Error loading accounts from LocalStorage:', error);
            // Fallback to default accounts if parsing fails
            this.accounts = [...DEFAULT_ACCOUNTS];
            this.saveAccounts();
        }
    }

    /**
     * Save accounts to LocalStorage
     */
    private saveAccounts(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
        } catch (error) {
            console.error('Error saving accounts to LocalStorage:', error);
        }
    }

    /**
     * Get all accounts
     */
    getAccounts(): Account[] {
        return [...this.accounts];
    }

    /**
     * Add a new account
     */
    addAccount(accountData: Omit<Account, 'id'>): Account {
        // Generate new ID (max existing ID + 1)
        const newId = this.accounts.length > 0 
            ? Math.max(...this.accounts.map(a => a.id)) + 1 
            : 1;

        const newAccount: Account = {
            id: newId,
            ...accountData,
        };

        this.accounts.push(newAccount);
        this.saveAccounts();
        return newAccount;
    }

    /**
     * Get account by ID
     */
    getAccountById(id: number): Account | undefined {
        return this.accounts.find(a => a.id === id);
    }

    /**
     * Update an account (for future use)
     */
    updateAccount(id: number, updates: Partial<Omit<Account, 'id'>>): Account | null {
        const index = this.accounts.findIndex(a => a.id === id);
        if (index === -1) {
            return null;
        }

        this.accounts[index] = { ...this.accounts[index], ...updates };
        this.saveAccounts();
        return this.accounts[index];
    }

    /**
     * Delete an account (for future use)
     */
    deleteAccount(id: number): boolean {
        const index = this.accounts.findIndex(a => a.id === id);
        if (index === -1) {
            return false;
        }

        this.accounts.splice(index, 1);
        this.saveAccounts();
        return true;
    }
}

// Export singleton instance
export const accountStore = new AccountStore();

