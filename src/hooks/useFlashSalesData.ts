/**
 * useFlashSalesData - Flash Sales Data Management Hook
 * Specifically designed for managing flash sale products data
 * Similar to useProductsData but focused on flash sales
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductService } from '../services/productService';
import { FlashSale, Product } from '../types';

interface FlashSaleWithProduct extends FlashSale {
  product: Product;
}

interface FlashSalesFilters {
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price' | 'name' | 'discount' | 'endTime';
  sortOrder: 'asc' | 'desc';
}

interface UseFlashSalesDataReturn {
  // State
  loading: boolean;
  error: string | null;
  flashSales: FlashSaleWithProduct[];
  filteredFlashSales: FlashSaleWithProduct[];
  currentProducts: FlashSaleWithProduct[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  
  // Filter state
  filterState: FlashSalesFilters;
  
  // Actions
  handleFilterChange: (filters: Partial<FlashSalesFilters>) => void;
  handlePageChange: (page: number) => void;
  handleSearch: (searchTerm: string) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

const DEFAULT_FILTERS: FlashSalesFilters = {
  searchTerm: '',
  minPrice: 0,
  maxPrice: 0,
  sortBy: 'endTime',
  sortOrder: 'asc'
};

const ITEMS_PER_PAGE = 20;

export const useFlashSalesData = (): UseFlashSalesDataReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashSales, setFlashSales] = useState<FlashSaleWithProduct[]>([]);
  const [filterState, setFilterState] = useState<FlashSalesFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch flash sales data
  const fetchFlashSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ProductService.getFlashSales();
      
      // Transform the data to match our interface
      const flashSalesWithProduct: FlashSaleWithProduct[] = data.map(sale => ({
        id: sale.id,
        productId: sale.productId,
        salePrice: sale.salePrice,
        originalPrice: sale.originalPrice,
        startTime: sale.startTime,
        endTime: sale.endTime,
        stock: sale.stock,
        isActive: sale.isActive,
        product: sale.product
      }));
      
      setFlashSales(flashSalesWithProduct);
    } catch (err) {
      console.error('Error fetching flash sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort flash sales
  const filteredFlashSales = useMemo(() => {
    let filtered = [...flashSales];

    // Search filter
    if (filterState.searchTerm) {
      const searchTerm = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.product?.name?.toLowerCase().includes(searchTerm) ||
        sale.product?.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Price filters
    if (filterState.minPrice > 0) {
      filtered = filtered.filter(sale => sale.salePrice >= filterState.minPrice);
    }
    if (filterState.maxPrice > 0) {
      filtered = filtered.filter(sale => sale.salePrice <= filterState.maxPrice);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filterState.sortBy) {
        case 'price':
          aValue = a.salePrice;
          bValue = b.salePrice;
          break;
        case 'name':
          aValue = a.product?.name || '';
          bValue = b.product?.name || '';
          break;
        case 'discount':
          aValue = ((a.originalPrice - a.salePrice) / a.originalPrice) * 100;
          bValue = ((b.originalPrice - b.salePrice) / b.originalPrice) * 100;
          break;
        case 'endTime':
          aValue = new Date(a.endTime).getTime();
          bValue = new Date(b.endTime).getTime();
          break;
        default:
          return 0;
      }
      
      if (filterState.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [flashSales, filterState]);

  // Pagination
  const totalPages = Math.ceil(filteredFlashSales.length / ITEMS_PER_PAGE);
  
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFlashSales.slice(startIndex, endIndex);
  }, [filteredFlashSales, currentPage]);

  // Filter change handler
  const handleFilterChange = useCallback((newFilters: Partial<FlashSalesFilters>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of flash sales grid
    const gridElement = document.getElementById('flash-sales-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Search handler
  const handleSearch = useCallback((searchTerm: string) => {
    handleFilterChange({ searchTerm });
  }, [handleFilterChange]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFlashSales();
  }, [fetchFlashSales]);

  return {
    // State
    loading,
    error,
    flashSales,
    filteredFlashSales,
    currentProducts,
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    
    // Filter state
    filterState,
    
    // Actions
    handleFilterChange,
    handlePageChange,
    handleSearch,
    resetFilters,
    refetch: fetchFlashSales
  };
};
