const API_BASE_URL = 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface AuthError {
  success: false;
  message: string;
}

const USER_STORAGE_KEY = 'gitflow_user';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    // Save user to localStorage
    if (result.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }

    return result;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for HttpOnly cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    // Save user to localStorage
    if (result.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }

    return result;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // First check localStorage
      const storedUser = this.getUserFromStorage();
      if (!storedUser) {
        return null;
      }

      // Try to verify with backend - attempt /api/auth/me endpoint
      // If it doesn't exist (404), we'll fall back to assuming cookie is valid
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        // If endpoint exists and returns 401, user is not authenticated
        if (response.status === 401) {
          this.logout();
          return null;
        }

        // If endpoint exists and returns user data, use that
        if (response.ok) {
          const result = await response.json();
          if (result.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
            return result.user;
          }
        }
      } catch (error) {
        // Endpoint might not exist (404) or network error
        // If it's a 404, the endpoint doesn't exist, so we'll trust localStorage
        // For other errors, we'll still use stored user since cookie might be valid
      }

      // If no verification endpoint or verification passed, return stored user
      // The cookie will be validated when making actual protected requests
      return storedUser;
    } catch (error) {
      // On error, clear invalid data
      this.logout();
      return null;
    }
  },

  getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      // Invalid data in localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    return null;
  },

  logout(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
