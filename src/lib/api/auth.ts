import type { AuthToken, User } from './types';

// Storage keys
const TOKEN_KEY = 'kratos_auth_token';
const REFRESH_TOKEN_KEY = 'kratos_refresh_token';
const USER_KEY = 'kratos_user';
const TOKEN_EXPIRY_KEY = 'kratos_token_expiry';
const SUBJECT_KEY = 'kratos_subject';

/**
 * Set authentication token and related data in localStorage
 */
export const setAuthToken = (authData: AuthToken): void => {
  try {
    localStorage.setItem(TOKEN_KEY, authData.access_token);
    
    if (authData.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refresh_token);
    }
    
    // Calculate and store expiry timestamp
    const expiryTime = Date.now() + (authData.expires_in * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
};

/**
 * Get the current authentication token
 */
export const getAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    // Check if token exists and is not expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() < expiryTime) {
        return token;
      } else {
        // Token is expired, clear it
        clearAuthToken();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
};

/**
 * Get the refresh token
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Check if the current token is expired
 */
export const isTokenExpired = (): boolean => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Failed to check token expiry:', error);
    return true;
  }
};

/**
 * Check if the token will expire within the specified minutes
 */
export const willTokenExpireSoon = (minutes: number = 5): boolean => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const warningTime = expiryTime - (minutes * 60 * 1000);
    return Date.now() >= warningTime;
  } catch (error) {
    console.error('Failed to check token expiry warning:', error);
    return true;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
};

/**
 * Store user information
 */
export const setUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

/**
 * Get stored user information
 */
export const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Clear user information
 */
export const clearUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return token !== null && !isTokenExpired();
};

/**
 * Get the time remaining until token expiry in seconds
 */
export const getTokenExpiryTime = (): number => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;
    
    const expiryTime = parseInt(expiry);
    const timeRemaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
    return timeRemaining;
  } catch (error) {
    console.error('Failed to get token expiry time:', error);
    return 0;
  }
};

/**
 * Clear all auth data and redirect to login
 */
export const logout = (): void => {
  clearAuthToken();
  clearUser();
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Initialize auth state from localStorage
 * Useful for app startup to check existing session
 */
export const initializeAuth = (): { token: string | null; user: User | null; isValid: boolean } => {
  const token = getAuthToken();
  const user = getUser();
  const isValid = isAuthenticated();
  
  return {
    token,
    user,
    isValid
  };
};

/**
 * Set the subject ID for API requests
 */
export const setSubject = (subjectId: string): void => {
  try {
    localStorage.setItem(SUBJECT_KEY, subjectId);
  } catch (error) {
    console.error('Failed to store subject ID:', error);
  }
};

/**
 * Get the subject ID for API requests
 */
export const getSubject = (): string | null => {
  try {
    return localStorage.getItem(SUBJECT_KEY);
  } catch (error) {
    console.error('Failed to retrieve subject ID:', error);
    return null;
  }
};

/**
 * Clear the subject ID
 */
export const clearSubject = (): void => {
  try {
    localStorage.removeItem(SUBJECT_KEY);
  } catch (error) {
    console.error('Failed to clear subject ID:', error);
  }
};