import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_EXPIRY_DAYS = 7;

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
    return !!Cookies.get(AUTH_COOKIE_NAME);
  }

  /**
   * Mock login - accepts any email/password combination
   * In production, this would validate against your backend
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful login for any credentials
    // In production, you would validate credentials here
    const user: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0],
    };

    // Set auth cookie
    Cookies.set(AUTH_COOKIE_NAME, 'mock-auth-token', {
      expires: AUTH_COOKIE_EXPIRY_DAYS,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    return user;
  }

  /**
   * Logout user by removing auth cookie
   */
  logout(): void {
    Cookies.remove(AUTH_COOKIE_NAME);
  }

  /**
   * Get current user from cookie
   * In production, you might decode a JWT token from the cookie
   */
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    // In a real app, you'd decode the token from the cookie
    // For now, we'll return a mock user
    return {
      id: '1',
      email: 'user@example.com',
      name: 'User',
    };
  }
}

export const authService = new AuthService();

