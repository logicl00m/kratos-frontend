import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }

      // Reset on resetKeys change
      if (resetKeys && this.previousResetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => key !== this.previousResetKeys[idx]
        );

        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    this.previousResetKeys = resetKeys || [];
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorCount } = this.state;

    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({
      errorInfo,
      errorCount: errorCount + 1,
    });

    // Auto-retry after 5 seconds for first error
    if (errorCount === 0 && !this.props.isolate) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI based on level
      return (
        <div className={`error-boundary error-boundary--${level}`}>
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={level === 'page' ? 48 : 32} />
            </div>

            <h2 className="error-title">
              {level === 'page'
                ? 'Something went wrong'
                : 'This component encountered an error'}
            </h2>

            <p className="error-message">
              {error.message || 'An unexpected error occurred'}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{error.stack}</pre>
              </details>
            )}

            <div className="error-actions">
              {errorCount < 3 && (
                <button
                  onClick={this.resetErrorBoundary}
                  className="btn btn-primary"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              )}

              {level === 'page' && (
                <>
                  <button
                    onClick={this.handleGoHome}
                    className="btn btn-secondary"
                  >
                    <Home size={16} />
                    Go Home
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="btn btn-outline"
                  >
                    Reload Page
                  </button>
                </>
              )}
            </div>

            {errorCount >= 3 && (
              <p className="error-persistent">
                This error persists. Please contact support if the problem continues.
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error) => {
    throw error; // This will be caught by the nearest error boundary
  };
}