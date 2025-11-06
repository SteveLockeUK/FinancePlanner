import type Account from "@/data/models/Accounts/Account.ts";

class AccountService {
    async getAccounts(): Promise<Account[]> {
        const response = await fetch('api/accounts', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if(!response.ok){
            throw new Error('Failed to fetch accounts');
        }

        return await response.json();
    }
    
    async createAccount(account: Partial<Account>): Promise<Account> {
        let request = JSON.stringify(account);
        debugger;
        const response = await fetch('api/accounts', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: request
        });
        
        if(!response.ok){
            throw new Error('Failed to create account');
        }
        
        return await response.json();
    }
    
    async updateAccount(id: number, account: Account): Promise<Account> {
        const response = await fetch(`api/accounts/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(account)
        });
        
        if(!response.ok){
            throw new Error('Failed to update account');
        }
        
        return await response.json();
    }

    async deleteAccount(id: number): Promise<void> {
        const response = await fetch(`api/accounts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if(!response.ok){
            throw new Error('Failed to delete account');
        }
    }
}

export const accountService = new AccountService();