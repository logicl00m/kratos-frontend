import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiWithFallback } from '@/lib/hooks/useApiWithFallback';

// Mock console.warn to suppress warnings in tests
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('useApiWithFallback', () => {
  afterEach(() => {
    mockConsoleWarn.mockClear();
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
    expect(result.current.data).toEqual(fallbackData);

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