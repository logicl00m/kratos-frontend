import { api, setAuthToken as setTokens, getAuthToken, clearAuthToken, setUser as storeUser, getUser as getStoredUser } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: AuthTokens | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

class AuthService {
  private static instance: AuthService;
  private apiClient: ApiClient;
  private refreshPromise: Promise<void> | null = null;

  private constructor() {
    this.apiClient = new ApiClient({
      baseURL: import.meta.env.VITE_AUTH_API_URL || '/api/auth',
    });

    // Add auth interceptor
    this.apiClient.addRequestInterceptor({
      onRequest: (config) => {
        const tokens = this.getTokens();
        if (tokens?.accessToken && config.headers) {
          config.headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
        }
        return config;
      },
    });

    // Add refresh token interceptor
    this.apiClient.addResponseInterceptor({
      onResponseError: async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }

          await this.refreshPromise;
          this.refreshPromise = null;

          // Retry original request
          const config = error.config;
          if (config) {
            const tokens = this.getTokens();
            if (tokens?.accessToken && config.headers) {
              config.headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
            }
            return this.apiClient.get(config.url!, config);
          }
        }
        return Promise.reject(error);
      },
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getTokens(): AuthTokens | null {
    const store = useAuthStore.getState();
    return store.tokens;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.apiClient.post<{
      user: User;
      tokens: AuthTokens;
    }>('/login', credentials);

    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      const tokens = this.getTokens();
      if (tokens?.refreshToken) {
        await this.apiClient.post('/logout', {
          refreshToken: tokens.refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async register(data: RegisterData): Promise<User> {
    const response = await this.apiClient.post<{
      user: User;
      tokens: AuthTokens;
    }>('/register', data);

    return response.data.user;
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.apiClient.post<AuthTokens>('/refresh', {
      refreshToken: tokens.refreshToken,
    });

    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.apiClient.get<User>('/me');
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.apiClient.post('/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/reset-password', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.apiClient.post('/verify-email', { token });
  }
}

// Zustand store for auth state
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokens: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const authService = AuthService.getInstance();
          const response = await authService.login(credentials);

          // Mock tokens for now - replace with actual API response
          const tokens: AuthTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            tokenType: 'Bearer',
          };

          set({
            user: response,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const authService = AuthService.getInstance();
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const authService = AuthService.getInstance();
          const response = await authService.register(data);

          // Mock tokens for now
          const tokens: AuthTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            tokenType: 'Bearer',
          };

          set({
            user: response,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const authService = AuthService.getInstance();
          const tokens = await authService.refreshAccessToken();
          set({ tokens });
        } catch (error) {
          // Token refresh failed, logout user
          get().logout();
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const tokens = get().tokens;
        if (!tokens?.accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const authService = AuthService.getInstance();
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tokens: null,
          });
        }
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        return user?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string) => {
        const user = get().user;
        return user?.roles?.includes(role) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
      }),
    }
  )
);

export default AuthService;