import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  isTokenExpired,
  willTokenExpireSoon,
  clearAuthToken,
  setUser,
  getUser,
  clearUser,
  isAuthenticated,
  getTokenExpiryTime,
  logout,
  initializeAuth,
  setSubject,
  getSubject,
  clearSubject,
} from '@/lib/api/auth';
import type { AuthToken, User } from '@/lib/api/types';

describe('Auth Module', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should set and get auth token correctly', () => {
      const authData: AuthToken = {
        access_token: 'test-token-123',
        refresh_token: 'refresh-token-456',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      setAuthToken(authData);

      expect(localStorage.setItem).toHaveBeenCalledWith('kratos_auth_token', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('kratos_refresh_token', 'refresh-token-456');
      expect(localStorage.setItem).toHaveBeenCalledTimes(3); // token, refresh, expiry
    });

    it('should return null for expired token', () => {
      const pastTime = Date.now() - 10000;
      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'kratos_auth_token') return 'expired-token';
        if (key === 'kratos_token_expiry') return pastTime.toString();
        return null;
      });

      const token = getAuthToken();
      expect(token).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should return valid token when not expired', () => {
      const futureTime = Date.now() + 10000;
      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'kratos_auth_token') return 'valid-token';
        if (key === 'kratos_token_expiry') return futureTime.toString();
        return null;
      });

      const token = getAuthToken();
      expect(token).toBe('valid-token');
    });

    it('should check if token is expired correctly', () => {
      const pastTime = Date.now() - 10000;
      localStorage.getItem = vi.fn().mockReturnValue(pastTime.toString());
      expect(isTokenExpired()).toBe(true);

      const futureTime = Date.now() + 10000;
      localStorage.getItem = vi.fn().mockReturnValue(futureTime.toString());
      expect(isTokenExpired()).toBe(false);
    });

    it('should check if token will expire soon', () => {
      // Token expires in 3 minutes
      const expiryTime = Date.now() + (3 * 60 * 1000);
      localStorage.getItem = vi.fn().mockReturnValue(expiryTime.toString());

      expect(willTokenExpireSoon(5)).toBe(true); // Will expire within 5 minutes
      expect(willTokenExpireSoon(2)).toBe(false); // Won't expire within 2 minutes
    });

    it('should clear all auth data', () => {
      clearAuthToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_token_expiry');
    });

    it('should get refresh token', () => {
      localStorage.getItem = vi.fn().mockReturnValue('refresh-token-123');
      const token = getRefreshToken();
      expect(token).toBe('refresh-token-123');
      expect(localStorage.getItem).toHaveBeenCalledWith('kratos_refresh_token');
    });
  });

  describe('User Management', () => {
    const testUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['admin']
    };

    it('should store and retrieve user data', () => {
      setUser(testUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('kratos_user', JSON.stringify(testUser));

      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(testUser));
      const user = getUser();
      expect(user).toEqual(testUser);
    });

    it('should clear user data', () => {
      clearUser();
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_user');
    });

    it('should return null for invalid user data', () => {
      localStorage.getItem = vi.fn().mockReturnValue('invalid-json');
      const user = getUser();
      expect(user).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should correctly determine authentication status', () => {
      // Not authenticated - no token
      localStorage.getItem = vi.fn().mockReturnValue(null);
      expect(isAuthenticated()).toBe(false);

      // Not authenticated - expired token
      const pastTime = Date.now() - 10000;
      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'kratos_auth_token') return 'token';
        if (key === 'kratos_token_expiry') return pastTime.toString();
        return null;
      });
      expect(isAuthenticated()).toBe(false);

      // Authenticated - valid token
      const futureTime = Date.now() + 10000;
      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'kratos_auth_token') return 'valid-token';
        if (key === 'kratos_token_expiry') return futureTime.toString();
        return null;
      });
      expect(isAuthenticated()).toBe(true);
    });

    it('should get remaining token expiry time', () => {
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      localStorage.getItem = vi.fn().mockReturnValue(expiryTime.toString());

      const remaining = getTokenExpiryTime();
      expect(remaining).toBeGreaterThan(3590); // Close to 3600 seconds
      expect(remaining).toBeLessThanOrEqual(3600);
    });

    it('should return 0 for expired token', () => {
      const pastTime = Date.now() - 10000;
      localStorage.getItem = vi.fn().mockReturnValue(pastTime.toString());
      expect(getTokenExpiryTime()).toBe(0);
    });
  });

  describe('Logout', () => {
    it('should clear all data and redirect on logout', () => {
      // Mock window.location.href setter
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_user');
      expect(window.location.href).toBe('/login');
    });
  });

  describe('Initialize Auth', () => {
    it('should initialize auth state from localStorage', () => {
      const futureTime = Date.now() + 10000;
      const testUser = { id: '123', email: 'test@example.com' };

      localStorage.getItem = vi.fn().mockImplementation((key) => {
        if (key === 'kratos_auth_token') return 'valid-token';
        if (key === 'kratos_token_expiry') return futureTime.toString();
        if (key === 'kratos_user') return JSON.stringify(testUser);
        return null;
      });

      const authState = initializeAuth();

      expect(authState.token).toBe('valid-token');
      expect(authState.user).toEqual(testUser);
      expect(authState.isValid).toBe(true);
    });
  });

  describe('Subject Management', () => {
    it('should set and get subject ID', () => {
      setSubject('subject-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('kratos_subject', 'subject-123');

      localStorage.getItem = vi.fn().mockReturnValue('subject-123');
      expect(getSubject()).toBe('subject-123');
    });

    it('should clear subject ID', () => {
      clearSubject();
      expect(localStorage.removeItem).toHaveBeenCalledWith('kratos_subject');
    });
  });
});