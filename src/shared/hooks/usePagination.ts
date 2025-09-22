import { useState, useCallback, useMemo } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (count: number) => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state
 * @param options - Pagination configuration options
 * @returns Pagination state and actions
 */
export function usePagination(
  options: PaginationOptions = {}
): [PaginationState, PaginationActions] {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItemsState] = useState(0);

  // Calculate derived state
  const state: PaginationState = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = Math.min((currentPage - 1) * pageSize, totalItems - 1);
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    return {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startIndex: Math.max(0, startIndex),
      endIndex: Math.max(0, endIndex),
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }, [currentPage, pageSize, totalItems]);

  // Actions
  const goToPage = useCallback(
    (page: number) => {
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalItems, pageSize]
  );

  const nextPage = useCallback(() => {
    if (state.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [state.hasNext]);

  const previousPage = useCallback(() => {
    if (state.hasPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [state.hasPrevious]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(state.totalPages);
  }, [state.totalPages]);

  const setPageSize = useCallback(
    (size: number) => {
      // Validate page size
      const validSize = pageSizeOptions.includes(size)
        ? size
        : pageSizeOptions[0] || 10;

      // Calculate new page to maintain position
      const currentFirstItem = (currentPage - 1) * pageSize + 1;
      const newPage = Math.max(1, Math.ceil(currentFirstItem / validSize));

      setPageSizeState(validSize);
      setCurrentPage(newPage);
    },
    [currentPage, pageSize, pageSizeOptions]
  );

  const setTotalItems = useCallback(
    (count: number) => {
      setTotalItemsState(Math.max(0, count));

      // Adjust current page if necessary
      const newTotalPages = Math.max(1, Math.ceil(count / pageSize));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    },
    [currentPage, pageSize]
  );

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItemsState(0);
  }, [initialPage, initialPageSize]);

  const actions: PaginationActions = {
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    setTotalItems,
    reset,
  };

  return [state, actions];
}

/**
 * Utility function to paginate an array
 * @param items - Array to paginate
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated items
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
}

/**
 * Utility function to calculate pagination range
 * @param currentPage - Current page
 * @param totalPages - Total pages
 * @param displayRange - Number of pages to display
 * @returns Array of page numbers to display
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  displayRange: number = 5
): (number | 'ellipsis')[] {
  const range: (number | 'ellipsis')[] = [];

  if (totalPages <= displayRange + 2) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  // Always show first page
  range.push(1);

  const halfRange = Math.floor(displayRange / 2);
  let startPage = Math.max(2, currentPage - halfRange);
  let endPage = Math.min(totalPages - 1, currentPage + halfRange);

  // Adjust range if at the beginning or end
  if (currentPage <= halfRange + 1) {
    endPage = displayRange;
  } else if (currentPage >= totalPages - halfRange) {
    startPage = totalPages - displayRange + 1;
  }

  // Add ellipsis if needed
  if (startPage > 2) {
    range.push('ellipsis');
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  // Add ellipsis if needed
  if (endPage < totalPages - 1) {
    range.push('ellipsis');
  }

  // Always show last page
  range.push(totalPages);

  return range;
}