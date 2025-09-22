// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};