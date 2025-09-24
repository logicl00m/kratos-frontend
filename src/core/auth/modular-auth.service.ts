/**
 * Modular Authentication Service
 * Provides comprehensive authentication functionality with feature flag support
 */

import {
  IAuthService,
  ILoginCredentials,
  IAuthResult,
  IAuthToken,
  IUser,
  ISession,
  IAuthState,
  AuthState,
  ITokenManager
} from './auth.interface';
import { Service, Inject } from '../di/container';
import { createLogger } from '../logger/logger';
import { getConfig } from '../config/app.config';
import { isFeatureEnabled, FEATURE_FLAGS } from '../config/feature-flags.config';
import { IApiClient } from '../api/api-client.interface';
import { EventEmitter } from '../events/event-emitter';

const logger = createLogger('ModularAuthService');

@Service('AuthService')
export class ModularAuthService implements IAuthService {
  private authStateEmitter = new EventEmitter<IAuthState>();
  private tokenRefreshEmitter = new EventEmitter<IAuthToken>();
  private sessionExpireEmitter = new EventEmitter<void>();
  private refreshTimer?: NodeJS.Timeout;
  private sessionTimer?: NodeJS.Timeout;
  private currentUser: IUser | null = null;
  private currentSession: ISession | null = null;

  constructor(
    @Inject('ApiClient') private apiClient: IApiClient,
    @Inject('TokenManager') private tokenManager: ITokenManager
  ) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Check existing authentication
      const token = await this.getAccessToken();
      if (token && !(await this.isTokenExpired())) {
        await this.loadCurrentUser();
        this.startTokenRefreshTimer();
        this.startSessionTimer();
        this.emitAuthState(AuthState.AUTHENTICATED);
      } else {
        this.emitAuthState(AuthState.UNAUTHENTICATED);
      }
    } catch (error) {
      logger.error('Failed to initialize auth service', error);
      this.emitAuthState(AuthState.ERROR);
    }
  }

  async login(credentials: ILoginCredentials): Promise<IAuthResult> {
    try {
      this.emitAuthState(AuthState.LOADING);
      logger.info('Attempting login', { username: credentials.username || credentials.email });

      // Perform login request
      const response = await this.apiClient.post<any>('/auth/login', {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe
      });

      // Handle MFA if required
      if (response.requiresMFA) {
        this.emitAuthState(AuthState.MFA_REQUIRED);
        return {
          success: false,
          requiresMFA: true
        };
      }

      // Store tokens
      if (response.tokens) {
        await this.setTokens(response.tokens);
      }

      // Store user
      if (response.user) {
        await this.setCurrentUser(response.user);
      }

      // Start timers
      this.startTokenRefreshTimer();
      this.startSessionTimer();

      // Update auth state
      this.emitAuthState(AuthState.AUTHENTICATED);

      logger.info('Login successful', { userId: response.user?.id });

      return {
        success: true,
        user: response.user,
        tokens: response.tokens
      };
    } catch (error: any) {
      logger.error('Login failed', error);
      this.emitAuthState(AuthState.ERROR);

      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      logger.info('Logging out user', { userId: this.currentUser?.id });

      // Call logout endpoint
      try {
        await this.apiClient.post('/auth/logout');
      } catch (error) {
        logger.warn('Failed to call logout endpoint', error);
      }

      // Clear local data
      await this.clearTokens();
      await this.clearCurrentUser();
      await this.clearSubject();

      // Clear timers
      this.clearTimers();

      // Reset session
      this.currentSession = null;

      // Update auth state
      this.emitAuthState(AuthState.UNAUTHENTICATED);

      // Redirect to login
      const config = getConfig();
      window.location.href = config.auth.loginPath;
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  }

  async refreshToken(): Promise<IAuthToken> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      logger.info('Refreshing access token');

      const response = await this.apiClient.post<any>('/auth/refresh', {
        refresh_token: refreshToken
      });

      const tokens: IAuthToken = response.tokens || response;
      await this.setTokens(tokens);

      // Emit token refresh event
      this.tokenRefreshEmitter.emit(tokens);

      logger.info('Token refreshed successfully');
      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', error);

      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    return this.tokenManager.getToken();
  }

  async getRefreshToken(): Promise<string | null> {
    return this.tokenManager.getRefreshToken();
  }

  async setTokens(tokens: IAuthToken): Promise<void> {
    await this.tokenManager.setToken(tokens.access_token, tokens.expires_in);

    if (tokens.refresh_token) {
      await this.tokenManager.setRefreshToken(tokens.refresh_token);
    }

    // Restart refresh timer
    this.startTokenRefreshTimer();
  }

  async clearTokens(): Promise<void> {
    await this.tokenManager.removeToken();
    await this.tokenManager.removeRefreshToken();
  }

  async isTokenExpired(): Promise<boolean> {
    return this.tokenManager.isExpired();
  }

  async willTokenExpireSoon(minutes: number = 5): Promise<boolean> {
    return this.tokenManager.willExpireSoon(minutes * 60 * 1000);
  }

  async getTokenExpiryTime(): Promise<number> {
    const expiry = await this.tokenManager.getExpiry();
    if (!expiry) return 0;

    const remaining = Math.max(0, expiry - Date.now());
    return Math.floor(remaining / 1000);
  }

  async getCurrentUser(): Promise<IUser | null> {
    if (!this.currentUser) {
      await this.loadCurrentUser();
    }
    return this.currentUser;
  }

  async setCurrentUser(user: IUser): Promise<void> {
    this.currentUser = user;

    try {
      const config = getConfig();
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));
    } catch (error) {
      logger.error('Failed to persist user', error);
    }
  }

  async clearCurrentUser(): Promise<void> {
    this.currentUser = null;

    try {
      const config = getConfig();
      localStorage.removeItem(config.auth.userKey);
    } catch (error) {
      logger.error('Failed to clear user', error);
    }
  }

  async updateUserProfile(updates: Partial<IUser>): Promise<IUser> {
    try {
      const response = await this.apiClient.put<IUser>('/auth/profile', updates);

      const updatedUser = response;
      await this.setCurrentUser(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    const isExpired = await this.isTokenExpired();

    return token !== null && !isExpired;
  }

  async getSession(): Promise<ISession | null> {
    if (!this.currentSession && await this.isAuthenticated()) {
      await this.loadSession();
    }
    return this.currentSession;
  }

  async extendSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const response = await this.apiClient.post<ISession>('/auth/session/extend');
      this.currentSession = response;

      // Restart session timer
      this.startSessionTimer();
    } catch (error) {
      logger.error('Failed to extend session', error);
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const response = await this.apiClient.get<{ valid: boolean }>('/auth/session/validate');
      return response.valid;
    } catch (error) {
      logger.error('Failed to validate session', error);
      return false;
    }
  }

  async getSubject(): Promise<string | null> {
    try {
      const config = getConfig();
      const hardcodedSubject = import.meta.env.VITE_HARDCODED_SUBJECT_ID;
      if (hardcodedSubject) {
        return hardcodedSubject;
      }

      return localStorage.getItem(config.auth.subjectKey);
    } catch (error) {
      logger.error('Failed to get subject', error);
      return null;
    }
  }

  async setSubject(subject: string): Promise<void> {
    try {
      const config = getConfig();
      localStorage.setItem(config.auth.subjectKey, subject);
    } catch (error) {
      logger.error('Failed to set subject', error);
    }
  }

  async clearSubject(): Promise<void> {
    try {
      const config = getConfig();
      localStorage.removeItem(config.auth.subjectKey);
    } catch (error) {
      logger.error('Failed to clear subject', error);
    }
  }

  // SSO methods (if enabled)
  async initiateSSOLogin(provider: string): Promise<void> {
    if (!isFeatureEnabled(FEATURE_FLAGS.AUTH_SSO)) {
      throw new Error('SSO is not enabled');
    }

    const response = await this.apiClient.get<{ authUrl: string }>(`/auth/sso/${provider}/init`);
    window.location.href = response.authUrl;
  }

  async handleSSOCallback(code: string, state?: string): Promise<IAuthResult> {
    if (!isFeatureEnabled(FEATURE_FLAGS.AUTH_SSO)) {
      throw new Error('SSO is not enabled');
    }

    try {
      const response = await this.apiClient.post<any>('/auth/sso/callback', {
        code,
        state
      });

      if (response.tokens) {
        await this.setTokens(response.tokens);
      }

      if (response.user) {
        await this.setCurrentUser(response.user);
      }

      this.emitAuthState(AuthState.AUTHENTICATED);

      return {
        success: true,
        user: response.user,
        tokens: response.tokens
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Biometric methods (if enabled)
  async enrollBiometric(): Promise<void> {
    if (!isFeatureEnabled(FEATURE_FLAGS.AUTH_BIOMETRIC)) {
      throw new Error('Biometric authentication is not enabled');
    }

    // Implementation would depend on WebAuthn API
    throw new Error('Biometric enrollment not implemented');
  }

  async authenticateWithBiometric(): Promise<IAuthResult> {
    if (!isFeatureEnabled(FEATURE_FLAGS.AUTH_BIOMETRIC)) {
      throw new Error('Biometric authentication is not enabled');
    }

    // Implementation would depend on WebAuthn API
    throw new Error('Biometric authentication not implemented');
  }

  // Event handlers
  onAuthStateChange(callback: (state: IAuthState) => void): () => void {
    return this.authStateEmitter.on(callback);
  }

  onTokenRefresh(callback: (token: IAuthToken) => void): () => void {
    return this.tokenRefreshEmitter.on(callback);
  }

  onSessionExpire(callback: () => void): () => void {
    return this.sessionExpireEmitter.on(callback);
  }

  // Private methods
  private async loadCurrentUser(): Promise<void> {
    try {
      // Try to load from localStorage first
      const config = getConfig();
      const storedUser = localStorage.getItem(config.auth.userKey);

      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }

      // Fetch latest user data from server
      const response = await this.apiClient.get<IUser>('/auth/me');
      this.currentUser = response;
      await this.setCurrentUser(response);
    } catch (error) {
      logger.error('Failed to load current user', error);
    }
  }

  private async loadSession(): Promise<void> {
    try {
      const response = await this.apiClient.get<ISession>('/auth/session');
      this.currentSession = response;
    } catch (error) {
      logger.error('Failed to load session', error);
    }
  }

  private startTokenRefreshTimer(): void {
    this.clearTokenRefreshTimer();

    if (!isFeatureEnabled(FEATURE_FLAGS.AUTH_REFRESH_TOKEN)) {
      return;
    }

    const config = getConfig();
    const checkInterval = 60000; // Check every minute

    this.refreshTimer = setInterval(async () => {
      const willExpire = await this.willTokenExpireSoon(config.auth.tokenRefreshThreshold);

      if (willExpire) {
        try {
          await this.refreshToken();
        } catch (error) {
          logger.error('Auto token refresh failed', error);
        }
      }
    }, checkInterval);
  }

  private clearTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private startSessionTimer(): void {
    this.clearSessionTimer();

    const config = getConfig();
    const sessionTimeout = config.auth.sessionTimeout * 60 * 1000; // Convert to milliseconds

    this.sessionTimer = setTimeout(() => {
      logger.info('Session expired');
      this.sessionExpireEmitter.emit();
      this.logout();
    }, sessionTimeout);
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = undefined;
    }
  }

  private clearTimers(): void {
    this.clearTokenRefreshTimer();
    this.clearSessionTimer();
  }

  private emitAuthState(state: AuthState): void {
    const authState: IAuthState = {
      state,
      user: this.currentUser,
      isAuthenticated: state === AuthState.AUTHENTICATED,
      isLoading: state === AuthState.LOADING,
      error: state === AuthState.ERROR ? 'Authentication error' : null
    };

    this.authStateEmitter.emit(authState);
  }
}