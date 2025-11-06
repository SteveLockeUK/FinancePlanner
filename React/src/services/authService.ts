import Cookies from 'js-cookie';

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
    const response = await fetch('https://localhost:7084/api/auth/login', {
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


    var user = await response.json() as User;
    localStorage.setItem('FinancePlanner.User', JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    var user = localStorage.getItem('FinancePlanner.User');
    if (user) {
      return JSON.parse(user) as User;
    }
    return null;
  }

  async register(credentials: RegisterCredentials): Promise<any> {
    const response = await fetch('https://localhost:7084/api/auth/register', {
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
    const response = await fetch('https://localhost:7084/api/auth/logout', {
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
