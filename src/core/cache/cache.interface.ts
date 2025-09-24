/**
 * Cache Service Interface
 * Defines the contract for cache implementations
 */

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  invalidate(pattern: string): Promise<number>;
  size(): Promise<number>;
  keys(pattern?: string): Promise<string[]>;
  mget<T>(keys: string[]): Promise<Map<string, T>>;
  mset(entries: Map<string, any>, ttl?: number): Promise<void>;
}

export interface ICacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt?: number;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
  size?: number;
}

export interface ICacheConfig {
  maxSize?: number; // Maximum cache size in bytes
  maxEntries?: number; // Maximum number of entries
  ttl?: number; // Default TTL in milliseconds
  evictionPolicy?: EvictionPolicy;
  persistence?: boolean;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

export enum EvictionPolicy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In First Out
  TTL = 'ttl', // Time To Live based
}

export interface ICacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  entries: number;
  hitRate: number;
}

export interface ICacheAdapter {
  name: string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
}