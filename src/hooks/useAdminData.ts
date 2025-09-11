import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedAdminService, PaginationParams, FilterParams, PaginatedResponse, ApiResponse } from '../services/enhancedAdminService';

// Generic hook for paginated data fetching with advanced features
export function useAdminData<T>(
  fetchFunction: (pagination: PaginationParams, filters: FilterParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialFilters: FilterParams = {},
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    cacheKey?: string;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await fetchFunction(pagination, filters);
      
      if (response.success && response.data) {
        setData(response.data.data);
        setTotalCount(response.data.count);
        setTotalPages(response.data.totalPages);
        setHasNext(response.data.hasNext);
        setHasPrev(response.data.hasPrev);
      } else {
        setError(response.error || 'Failed to fetch data');
        setData([]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
        setData([]);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [fetchFunction, pagination, filters]);

  // Auto-refresh setup
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(false);
      }, options.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [fetchData, options.autoRefresh, options.refreshInterval]);

  // Initial fetch and fetch on dependency changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  const updatePagination = useCallback((updates: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFilters = useCallback((updates: FilterParams | ((prev: FilterParams) => FilterParams)) => {
    if (typeof updates === 'function') {
      setFilters(updates);
    } else {
      setFilters(prev => ({ ...prev, ...updates }));
    }
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasNext]);

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [hasPrev]);

  const changeSorting = useCallback((sortBy: string, sortOrder?: 'asc' | 'desc') => {
    setPagination(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'),
      page: 1 // Reset to first page when sorting changes
    }));
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    isRefreshing,
    
    // Pagination
    pagination,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    
    // Filters
    filters,
    
    // Actions
    refresh,
    updatePagination,
    updateFilters,
    goToPage,
    goToNext,
    goToPrev,
    changeSorting,
    
    // Utilities
    isEmpty: data.length === 0 && !loading,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page === totalPages
  };
}

// Specific hooks for different admin entities
export function useProducts(initialFilters?: FilterParams) {
  return useAdminData(
    enhancedAdminService.getProducts.bind(enhancedAdminService),
    initialFilters,
    { autoRefresh: true, refreshInterval: 60000 } // Auto-refresh every minute
  );
}

// Hook for CRUD operations with optimistic updates
export function useCrudOperations<T extends { id: string }>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = useCallback(async <R>(
    operation: () => Promise<ApiResponse<R>>,
    onSuccess?: (result: R) => void,
    onError?: (error: string) => void
  ): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await operation();
      
      if (response.success && response.data !== undefined) {
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'Operation failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async <R>(
    createFn: () => Promise<ApiResponse<R>>,
    onSuccess?: (result: R) => void,
    onError?: (error: string) => void
  ) => {
    return executeOperation(createFn, onSuccess, onError);
  }, [executeOperation]);

  const update = useCallback(async <R>(
    updateFn: () => Promise<ApiResponse<R>>,
    onSuccess?: (result: R) => void,
    onError?: (error: string) => void
  ) => {
    return executeOperation(updateFn, onSuccess, onError);
  }, [executeOperation]);

  const remove = useCallback(async (
    deleteFn: () => Promise<ApiResponse<void>>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    return executeOperation(deleteFn, onSuccess, onError);
  }, [executeOperation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    create,
    update,
    remove,
    clearError
  };
}

// Hook for bulk operations
export function useBulkOperations<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback((allIds: string[]) => {
    setSelectedIds(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const executeBulkOperation = useCallback(async <R>(
    operation: (ids: string[]) => Promise<ApiResponse<R>>,
    onSuccess?: (result: R) => void,
    onError?: (error: string) => void
  ) => {
    if (selectedIds.length === 0) {
      onError?.('No items selected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await operation(selectedIds);
      
      if (response.success && response.data !== undefined) {
        onSuccess?.(response.data);
        setSelectedIds([]); // Clear selection after successful operation
        return response.data;
      } else {
        const errorMessage = response.error || 'Bulk operation failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    loading,
    error,
    toggleSelection,
    toggleAll,
    clearSelection,
    executeBulkOperation,
    hasSelection: selectedIds.length > 0
  };
}

// Hook for real-time notifications and updates
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
}
