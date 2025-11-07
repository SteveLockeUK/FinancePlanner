import * as signalR from '@microsoft/signalr';
import { accountService } from './AccountService';
import { transactionService } from './TransactionService';
import { recurringPaymentService } from './RecurringPaymentService';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    async start(): Promise<void> {
        if (this.connection) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/api/hubs/sync', {
                withCredentials: true,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
                        return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                    }
                    return null;
                }
            })
            .build();

        // Set up event handlers
        this.connection.on('AccountsUpdated', async (accounts: any[]) => {
            await accountService.syncFromAPI(accounts);
            window.dispatchEvent(new CustomEvent('accountsUpdated'));
        });

        this.connection.on('TransactionsUpdated', async (transactions: any[]) => {
            await transactionService.syncFromAPI(transactions);
            window.dispatchEvent(new CustomEvent('transactionsUpdated'));
        });

        this.connection.on('RecurringPaymentsUpdated', async (payments: any[]) => {
            await recurringPaymentService.syncFromAPI(payments);
            window.dispatchEvent(new CustomEvent('recurringPaymentsUpdated'));
        });

        this.connection.onreconnecting(() => {
            console.log('SignalR reconnecting...');
        });

        this.connection.onreconnected(() => {
            console.log('SignalR reconnected');
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.log('SignalR connection closed', error);
        });

        try {
            await this.connection.start();
            console.log('SignalR connected');
        } catch (error) {
            console.error('Error starting SignalR connection:', error);
        }
    }

    async stop(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

export const signalRService = new SignalRService();

