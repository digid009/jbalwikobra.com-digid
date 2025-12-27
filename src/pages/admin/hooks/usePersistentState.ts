/**
 * Admin State Persistence Hook
 * Persists admin navigation state, filters, and pagination to localStorage
 * Enables state restoration on page reload
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

interface PersistentState<T> {
  value: T;
  timestamp: number;
  version: string;
}

const STORAGE_VERSION = '1.0';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Hook to persist state to localStorage with automatic expiration
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  cacheDuration: number = CACHE_DURATION
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const storageKey = `admin_state_${key}`;

  // Initialize state from localStorage or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: PersistentState<T> = JSON.parse(stored);
        
        // Check version and expiration
        if (
          parsed.version === STORAGE_VERSION &&
          Date.now() - parsed.timestamp < cacheDuration
        ) {
          return parsed.value;
        }
      }
    } catch (error) {
      console.warn(`Failed to load persistent state for ${key}:`, error);
    }
    return defaultValue;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const persistentState: PersistentState<T> = {
        value: state,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };
      localStorage.setItem(storageKey, JSON.stringify(persistentState));
    } catch (error) {
      console.warn(`Failed to save persistent state for ${key}:`, error);
    }
  }, [state, storageKey, key]);

  // Clear state
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Failed to clear persistent state for ${key}:`, error);
    }
  }, [storageKey, defaultValue, key]);

  return [state, setState, clearState];
}

/**
 * Hook for persisting table filters and pagination
 */
interface TableState {
  page: number;
  limit: number;
  filters: Record<string, any>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export function useTableState(tableKey: string, defaultLimit: number = 10) {
  const defaultState: TableState = {
    page: 1,
    limit: defaultLimit,
    filters: {},
  };

  const [tableState, setTableState, clearTableState] = usePersistentState<TableState>(
    `table_${tableKey}`,
    defaultState,
    60 * 60 * 1000 // 1 hour cache
  );

  const updatePage = useCallback((page: number) => {
    setTableState(prev => ({ ...prev, page }));
  }, [setTableState]);

  const updateLimit = useCallback((limit: number) => {
    setTableState(prev => ({ ...prev, limit, page: 1 }));
  }, [setTableState]);

  const updateFilters = useCallback((filters: Record<string, any>) => {
    setTableState(prev => ({ ...prev, filters, page: 1 }));
  }, [setTableState]);

  const updateSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setTableState(prev => ({ 
      ...prev, 
      sortColumn: column, 
      sortDirection: direction 
    }));
  }, [setTableState]);

  return {
    tableState,
    updatePage,
    updateLimit,
    updateFilters,
    updateSort,
    clearTableState,
  };
}

/**
 * Hook for persisting last visited tab
 */
export function useLastVisitedTab(defaultTab: string = 'dashboard') {
  return usePersistentState('last_visited_tab', defaultTab, 24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Clear all admin persistent state
 */
export function clearAllAdminState() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('admin_state_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear admin state:', error);
  }
}
