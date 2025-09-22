// src/features/dashboard/hooks/useApplications.ts
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { applicationService } from '../services/applicationService';

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

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => applicationService.getApplications(filters),
    keepPreviousData: true // Important for pagination
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page on filter change
    }));
  };

  return {
    applications: data?.data.items || [],
    pagination: data?.data.pagination,
    isLoading,
    error,
    filters,
    updateFilter
  };
};