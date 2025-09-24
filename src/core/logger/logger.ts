/**
 * Comprehensive Logging System
 * Provides structured logging with different levels, contexts, and outputs
 */

import { getConfig } from '../config/app.config';
import { isFeatureEnabled, FEATURE_FLAGS } from '../config/feature-flags.config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  outputs: LogOutput[];
  maxBufferSize: number;
  flushInterval: number;
}

export interface LogOutput {
  name: string;
  enabled: boolean;
  log: (entry: LogEntry) => void | Promise<void>;
}

/**
 * Console output implementation
 */
class ConsoleOutput implements LogOutput {
  name = 'console';
  enabled = true;

  log(entry: LogEntry): void {
    const config = getConfig();
    if (!config.logging.enabled) return;

    const logMethod = this.getConsoleMethod(entry.level);
    const formattedMessage = this.formatMessage(entry);
    const style = this.getConsoleStyle(entry.level);

    if (entry.level === LogLevel.DEBUG && isFeatureEnabled(FEATURE_FLAGS.DEBUG_MODE)) {
      console.groupCollapsed(`%c${formattedMessage}`, style);
      if (entry.data) {
        console.log('Data:', entry.data);
      }
      if (entry.metadata) {
        console.log('Metadata:', entry.metadata);
      }
      if (entry.stackTrace) {
        console.log('Stack Trace:', entry.stackTrace);
      }
      console.groupEnd();
    } else {
      logMethod(`%c${formattedMessage}`, style, entry.data || '');
      if (entry.stackTrace && config.logging.includeStackTrace) {
        console.error(entry.stackTrace);
      }
    }
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #888; font-style: italic;';
      case LogLevel.INFO:
        return 'color: #2196F3;';
      case LogLevel.WARN:
        return 'color: #FF9800; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #F44336; font-weight: bold;';
      case LogLevel.FATAL:
        return 'color: #B71C1C; font-weight: bold; text-decoration: underline;';
      default:
        return '';
    }
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    return `[${entry.timestamp}] [${levelName}] [${entry.context}] ${entry.message}`;
  }
}

/**
 * Remote logging output implementation
 */
class RemoteOutput implements LogOutput {
  name = 'remote';
  enabled = false;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    const config = getConfig();
    this.enabled = config.logging.remoteLogging;

    if (this.enabled) {
      this.startFlushTimer();
    }
  }

  async log(entry: LogEntry): Promise<void> {
    const config = getConfig();
    if (!config.logging.remoteLogging || !config.logging.remoteEndpoint) return;

    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.buffer.length >= 100) {
      await this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const config = getConfig();
    const endpoint = config.logging.remoteEndpoint;
    if (!endpoint) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: entries }),
      });
    } catch (error) {
      // Put entries back in buffer if send failed
      this.buffer.unshift(...entries);
      console.error('Failed to send logs to remote endpoint', error);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

/**
 * Local storage output implementation
 */
class StorageOutput implements LogOutput {
  name = 'storage';
  enabled = false;
  private readonly maxEntries = 1000;
  private readonly storageKey = 'app_logs';

  constructor() {
    const config = getConfig();
    this.enabled = config.logging.persistence;
  }

  log(entry: LogEntry): void {
    if (!this.enabled) return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      let logs: LogEntry[] = stored ? JSON.parse(stored) : [];

      logs.push(entry);

      // Keep only the latest entries
      if (logs.length > this.maxEntries) {
        logs = logs.slice(-this.maxEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to persist log entry', error);
    }
  }

  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve logs', error);
      return [];
    }
  }

  clearLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear logs', error);
    }
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private context: string;
  private outputs: LogOutput[];
  private minLevel: LogLevel;
  private metadata: Record<string, any> = {};

  constructor(context: string) {
    this.context = context;
    this.outputs = [];

    const config = getConfig();
    this.minLevel = this.parseLogLevel(config.logging.level);

    // Initialize outputs
    this.outputs.push(new ConsoleOutput());
    this.outputs.push(new RemoteOutput());
    this.outputs.push(new StorageOutput());
  }

  /**
   * Set metadata that will be included with all log entries
   */
  setMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Clear metadata
   */
  clearMetadata(): void {
    this.metadata = {};
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    const stackTrace = error?.stack || new Error().stack;
    this.log(LogLevel.ERROR, message, data || error, stackTrace);
  }

  /**
   * Log fatal error
   */
  fatal(message: string, error?: Error | any, data?: any): void {
    const stackTrace = error?.stack || new Error().stack;
    this.log(LogLevel.FATAL, message, data || error, stackTrace);
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, metadata?: any): void {
    if (isFeatureEnabled(FEATURE_FLAGS.PERFORMANCE_MONITORING)) {
      this.info(`Performance: ${operation}`, {
        duration,
        unit: 'ms',
        ...metadata,
      });
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (isFeatureEnabled(FEATURE_FLAGS.DEBUG_MODE)) {
      this.debug(`API Request: ${method} ${url}`, data);
    }
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (isFeatureEnabled(FEATURE_FLAGS.DEBUG_MODE)) {
      const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
      this.log(level, `API Response: ${method} ${url} - ${status}`, data);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childLogger = new Logger(`${this.context}.${context}`);
    childLogger.metadata = { ...this.metadata };
    return childLogger;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any, stackTrace?: string): void {
    // Check if logging is enabled and level is appropriate
    const config = getConfig();
    if (!config.logging.enabled || level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
      stackTrace,
      metadata: { ...this.metadata },
    };

    // Add user and session info if available
    try {
      const user = localStorage.getItem('kratos_user');
      if (user) {
        const userData = JSON.parse(user);
        entry.userId = userData.id;
      }
    } catch {}

    // Send to all enabled outputs
    for (const output of this.outputs) {
      if (output.enabled) {
        try {
          const result = output.log(entry);
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Failed to log to ${output.name}:`, error);
            });
          }
        } catch (error) {
          console.error(`Failed to log to ${output.name}:`, error);
        }
      }
    }
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      case 'fatal':
        return LogLevel.FATAL;
      default:
        return LogLevel.INFO;
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Global logger instance
 */
export const logger = createLogger('App');