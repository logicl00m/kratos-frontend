/**
 * Simple Authentication Manager
 * Handles token storage and retrieval
 */

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

class AuthManager {
  private readonly ACCESS_TOKEN_KEY = 'kratos_access_token';
  private readonly REFRESH_TOKEN_KEY = 'kratos_refresh_token';
  private readonly EXPIRES_AT_KEY = 'kratos_token_expires_at';
  private readonly SUBJECT_ID_KEY = 'kratos_subject_id';

  /**
   * Get access token from environment or storage
   */
  getAccessToken(): string | null {
    // Check for hardcoded token in environment (dev/test)
    const envToken = import.meta.env.VITE_HARDCODED_ACCESS_TOKEN;
    if (envToken) return envToken;

    // Check if token is expired
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      this.clearTokens();
      return null;
    }

    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get subject ID
   */
  getSubjectId(): string | null {
    // Check for hardcoded subject in environment (dev/test)
    const envSubject = import.meta.env.VITE_HARDCODED_SUBJECT_ID;
    if (envSubject) return envSubject;

    return localStorage.getItem(this.SUBJECT_ID_KEY);
  }

  /**
   * Set authentication tokens
   */
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);

    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    if (tokens.expiresAt) {
      localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
    }
  }

  /**
   * Set subject ID
   */
  setSubjectId(subjectId: string): void {
    localStorage.setItem(this.SUBJECT_ID_KEY, subjectId);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Export singleton instance
export const auth = new AuthManager();