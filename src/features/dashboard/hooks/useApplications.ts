// src/features/dashboard/hooks/useApplications.ts
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { applicationService } from '../services/applicationService';
import { mockWorkflowData } from '../data/mockWorkflowData';
import { transformWorkflowsToApplications } from '../utils/workflowTransformer';
import { DASHBOARD_CONFIG } from '../config/dashboardConfig';

/**
 * Custom hook to fetch application data
 * 
 * This hook provides a unified interface for application data, 
 * whether using mock data or real API data based on configuration.
 * 
 * To switch between mock and real data, change the `useMockData` value 
 * in the DASHBOARD_CONFIG file.
 */
export const useApplications = () => {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    stage: 'All Stages',
    status: 'All Status',
    product: 'All Products'
  });

  const queryKey = useMemo(() => 
    ['applications', filters], 
    [filters]
  );

  // Conditionally fetch data based on configuration
  const queryResult = useQuery({
    queryKey,
    queryFn: () => {
      if (DASHBOARD_CONFIG.useMockData) {
        // When using mock data, transform and return mock workflow data
        // Simulate API delay for more realistic experience
        return new Promise((resolve) => {
          setTimeout(() => {
            // Transform mock workflow data to LoanApplication format
            const transformedData = transformWorkflowsToApplications(mockWorkflowData);
            resolve({
              data: {
                items: transformedData,
                pagination: {
                  page: 1,
                  pageSize: 10,
                  total: transformedData.length,
                  totalPages: Math.ceil(transformedData.length / 10)
                }
              }
            });
          }, 300); // Simulate network delay
        }) as Promise<any>;
      } else {
        // When not using mock data, make actual API call
        return applicationService.getApplications(filters);
      }
    },
    keepPreviousData: true, // Important for pagination
    // Disable automatic refetching when using mock data
    enabled: true // Always enable the query, the queryFn handles the choice
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page on filter change
    }));
  };

  return {
    applications: queryResult.data?.data.items || [],
    pagination: queryResult.data?.data.pagination,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    filters,
    updateFilter
  };
};