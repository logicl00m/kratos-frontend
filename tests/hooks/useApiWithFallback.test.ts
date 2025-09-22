import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiWithFallback, useDashboardApplications, useDashboardStats } from '@/lib/hooks/useApiWithFallback';
import { dashboardApi } from '@/lib/api';
import { mockWorkflowData } from '@features/dashboard/data/mockWorkflowData';

// Mock the dashboard API
vi.mock('@/lib/api', () => ({
  dashboardApi: {
    getApplications: vi.fn(),
    getStats: vi.fn()
  },
  workflowInstanceApi: {
    get: vi.fn()
  },
  formApi: {
    list: vi.fn()
  },
  templateApi: {
    list: vi.fn()
  },
  runningWorkflowApi: {
    list: vi.fn()
  },
  ApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  }
}));

describe('useApiWithFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use real data when API call succeeds', async () => {
    const mockData = { message: 'Real data' };
    const mockApiCall = vi.fn().mockResolvedValue(mockData);
    const fallbackData = { message: 'Fallback data' };

    const { result } = renderHook(() => 
      useApiWithFallback(mockApiCall, fallbackData)
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isUsingFallback).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('should use fallback data when API call fails', async () => {
    const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
    const fallbackData = { message: 'Fallback data' };

    const { result } = renderHook(() => 
      useApiWithFallback(mockApiCall, fallbackData)
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(fallbackData);
    expect(result.current.isUsingFallback).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('should retry API call when retry function is called', async () => {
    const mockApiCall = vi.fn()
      .mockRejectedValueOnce(new Error('First API Error'))
      .mockResolvedValueOnce({ message: 'Retry success' });
    const fallbackData = { message: 'Fallback data' };

    const { result } = renderHook(() => 
      useApiWithFallback(mockApiCall, fallbackData)
    );

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isUsingFallback).toBe(true);

    // Retry
    await waitFor(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ message: 'Retry success' });
    expect(result.current.isUsingFallback).toBe(false);
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });
});

describe('useDashboardApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use real data when API call succeeds', async () => {
    const mockApplications = {
      data: [
        {
          id: 'real-1',
          workflowId: 'wf-1',
          currentState: 'Review',
          status: 'pending',
          assignee: 'John Doe',
          data: {},
          history: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slaStatus: 'on-time',
            priority: 'medium'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1
      }
    };

    (dashboardApi.getApplications as vi.Mock).mockResolvedValue({
      data: mockApplications
    });

    const { result } = renderHook(() => useDashboardApplications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockApplications);
    expect(result.current.isUsingFallback).toBe(false);
    expect(dashboardApi.getApplications).toHaveBeenCalledTimes(1);
  });

  it('should use fallback data when API call fails', async () => {
    (dashboardApi.getApplications as vi.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDashboardApplications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use mock workflow data as fallback
    expect(result.current.data.data).toHaveLength(mockWorkflowData.length);
    expect(result.current.isUsingFallback).toBe(true);
    expect(dashboardApi.getApplications).toHaveBeenCalledTimes(1);
  });
});

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use real data when API call succeeds', async () => {
    const mockStats = {
      totalApplications: 10,
      pendingApplications: 5,
      approvedApplications: 3,
      rejectedApplications: 2,
      slaMetrics: {
        onTime: 7,
        due: 2,
        overdue: 1,
        completed: 3
      }
    };

    (dashboardApi.getStats as vi.Mock).mockResolvedValue({
      data: mockStats
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(result.current.isUsingFallback).toBe(false);
    expect(dashboardApi.getStats).toHaveBeenCalledTimes(1);
  });

  it('should use fallback data when API call fails', async () => {
    (dashboardApi.getStats as vi.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use mock workflow data to generate fallback stats
    expect(result.current.data.totalApplications).toBe(mockWorkflowData.length);
    expect(result.current.isUsingFallback).toBe(true);
    expect(dashboardApi.getStats).toHaveBeenCalledTimes(1);
  });
});