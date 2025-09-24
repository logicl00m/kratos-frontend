/**
 * Authentication Service Interface
 * Defines the contract for authentication services
 */

export interface IAuthService {
  // Authentication operations
  login(credentials: ILoginCredentials): Promise<IAuthResult>;
  logout(): Promise<void>;
  refreshToken(): Promise<IAuthToken>;

  // Token management
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: IAuthToken): Promise<void>;
  clearTokens(): Promise<void>;
  isTokenExpired(): Promise<boolean>;
  willTokenExpireSoon(minutes?: number): Promise<boolean>;
  getTokenExpiryTime(): Promise<number>;

  // User management
  getCurrentUser(): Promise<IUser | null>;
  setCurrentUser(user: IUser): Promise<void>;
  clearCurrentUser(): Promise<void>;
  updateUserProfile(updates: Partial<IUser>): Promise<IUser>;

  // Session management
  isAuthenticated(): Promise<boolean>;
  getSession(): Promise<ISession | null>;
  extendSession(): Promise<void>;
  validateSession(): Promise<boolean>;

  // Subject/Tenant management
  getSubject(): Promise<string | null>;
  setSubject(subject: string): Promise<void>;
  clearSubject(): Promise<void>;

  // SSO operations (if enabled)
  initiateSSOLogin?(provider: string): Promise<void>;
  handleSSOCallback?(code: string, state?: string): Promise<IAuthResult>;

  // Biometric authentication (if enabled)
  enrollBiometric?(): Promise<void>;
  authenticateWithBiometric?(): Promise<IAuthResult>;

  // Events
  onAuthStateChange(callback: (state: IAuthState) => void): () => void;
  onTokenRefresh(callback: (token: IAuthToken) => void): () => void;
  onSessionExpire(callback: () => void): () => void;
}

export interface ILoginCredentials {
  username?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface IAuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface IAuthResult {
  success: boolean;
  user?: IUser;
  tokens?: IAuthToken;
  requiresMFA?: boolean;
  error?: string;
  redirectUrl?: string;
}

export interface IUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  mfaEnabled?: boolean;
}

export interface ISession {
  id: string;
  userId: string;
  startedAt: Date | string;
  expiresAt: Date | string;
  lastActivityAt: Date | string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  isActive: boolean;
}

export enum AuthState {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error',
  MFA_REQUIRED = 'mfa_required',
  SESSION_EXPIRED = 'session_expired',
}

export interface IAuthState {
  state: AuthState;
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface IAuthConfig {
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  expiryKey: string;
  subjectKey: string;
  loginPath: string;
  logoutPath: string;
  unauthorizedRedirectPath: string;
  tokenRefreshThreshold: number;
  rememberMeDuration: number;
  sessionTimeout: number;
  enableBiometric: boolean;
  enableSSO: boolean;
  ssoProviders?: string[];
}

export interface ITokenManager {
  getToken(): Promise<string | null>;
  setToken(token: string, expiry?: number): Promise<void>;
  removeToken(): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  removeRefreshToken(): Promise<void>;
  isExpired(): Promise<boolean>;
  getExpiry(): Promise<number | null>;
  willExpireSoon(threshold: number): Promise<boolean>;
}

export interface IAuthProvider {
  name: string;
  type: 'local' | 'oauth' | 'saml' | 'ldap';
  enabled: boolean;
  config?: Record<string, any>;
  authenticate(credentials: any): Promise<IAuthResult>;
  validate?(token: string): Promise<boolean>;
  refresh?(refreshToken: string): Promise<IAuthToken>;
}