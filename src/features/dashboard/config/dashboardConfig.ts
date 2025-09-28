/**
 * Dashboard Configuration
 * 
 * This module contains configuration options for the dashboard,
 * including whether to use mock data or real API data.
 * 
 * To switch between mock data and real API:
 * 1. Option 1: Change the `useMockData` value below to true (for mock) or false (for real API)
 * 2. Option 2: Set the VITE_USE_MOCK environment variable to true or false
 * 3. The dashboard will use mock data when true, and make real API calls when false
 * 4. Remember to restart your development server after making changes
 */

// Configuration option to use mock data instead of real API
// Priority: Environment variable > hardcoded value
// Set environment variable VITE_USE_MOCK to 'true' or 'false' to override the default
const getUseMockData = (): boolean => {
  // Check if environment variable is set and is explicitly 'true'
  const envVar = import.meta.env.VITE_USE_MOCK;
  if (envVar !== undefined) {
    return envVar === 'true';
  }
  
  // Default to true if no environment variable is set
  return true;
};

export const DASHBOARD_CONFIG = {
  useMockData: getUseMockData(), // Toggle this to switch between mock and real data
} as const;

/**
 * Toggle the mock data configuration
 * 
 * This can be useful for runtime configuration,
 * though it will require a page refresh to take effect fully
 */
export const toggleMockData = (): boolean => {
  // In a real implementation, you might store this in localStorage
  // For now, we'll just return the opposite value
  return !DASHBOARD_CONFIG.useMockData;
};

/**
 * Get the current mock data configuration
 * 
 * This can be useful for different parts of the application
 * to determine how to behave based on configuration
 */
export const getMockDataConfig = (): boolean => {
  return DASHBOARD_CONFIG.useMockData;
};