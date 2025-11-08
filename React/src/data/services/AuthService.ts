import { registerServiceWorker } from '@/utils/serviceWorkerRegistration';
import { signalRService } from './SignalRService';
import { performInitialSync } from '@/utils/initialSync';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Mock authentication service
 * In a real app, this would make API calls to your backend
 */
class AuthService {
  private signalRInitialized = false;

  /**
   * Initialize SignalR and sync if user is already authenticated
   * This is called on app load to handle page refreshes
   */
  async initializeIfAuthenticated(): Promise<void> {
    if (this.isAuthenticated() && !this.signalRInitialized) {
      registerServiceWorker();
      await this.startSignalRAndSync();
    }
  }

  /**
   * Start SignalR connection and perform initial sync
   */
  private async startSignalRAndSync(): Promise<void> {
    try {
      await performInitialSync();
      await signalRService.start();
      // Only mark as initialized if start was successful
      // SignalRService.start() doesn't throw if connection already exists, so this is safe
      this.signalRInitialized = true;
    } catch (error) {
      console.error('Error starting SignalR and sync:', error);
      this.signalRInitialized = false;
    }
  }

  /**
   * Check if user is authenticated by checking for auth cookie
   */

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Mock login - accepts any email/password combination
   * In production, this would validate against your backend
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    const response = await fetch('api/auth/login', {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }


    const user = await response.json() as User;
    localStorage.setItem('FinancePlanner.User', JSON.stringify(user));
    
    // Start SignalR and perform initial sync after successful login
    await this.startSignalRAndSync();
    
    return user;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('FinancePlanner.User');
    if (user) {
      return JSON.parse(user) as User;
    }
    return null;
  }

  async register(credentials: RegisterCredentials): Promise<any> {
    const response = await fetch('api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Failed to register');
    }
  }
  
  async logout(): Promise<any> {
    // Stop SignalR connection before logging out
    if (this.signalRInitialized) {
      try {
        await signalRService.stop();
        this.signalRInitialized = false;
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
    
    const response = await fetch('api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    localStorage.removeItem('FinancePlanner.User');
  }
}

export const authService = new AuthService();
