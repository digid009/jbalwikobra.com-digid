/**
 * useProductsData - Custom hook for products data management
 * Handles data fetching, filtering, sorting, and pagination logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Product, Tier, GameTitle } from '../types';
import { scrollToPaginationContent } from '../utils/scrollUtils';

// Mobile-first constants
const MOBILE_CONSTANTS = {
  PRODUCTS_PER_PAGE: 16, // Increased for desktop to show more products
  PRODUCTS_PER_PAGE_MOBILE: 12, // Increased for mobile to show more products (was 8)
} as const;

interface ProductsPageState {
  products: Product[];
  filteredProducts: Product[];
  tiers: Tier[];
  gameTitles: GameTitle[];
  loading: boolean;
  error: string | null;
}

interface FilterState {
  searchTerm: string;
  selectedGame: string;
  selectedTier: string;
  sortBy: string;
  showFilters: boolean;
}

export const useProductsData = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [state, setState] = useState<ProductsPageState>({
    products: [],
    filteredProducts: [],
    tiers: [],
    gameTitles: [],
    loading: true,
    error: null
  });

  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: searchParams.get('search') || '',
    selectedGame: searchParams.get('game') || '',
    selectedTier: searchParams.get('tier') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    showFilters: false
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const savedState = sessionStorage.getItem('productsPageState');
    if (savedState && location.state?.fromProductDetail) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.currentPage || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  // Determine products per page based on screen size
  const productsPerPage = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 
        ? MOBILE_CONSTANTS.PRODUCTS_PER_PAGE_MOBILE 
        : MOBILE_CONSTANTS.PRODUCTS_PER_PAGE;
    }
    return MOBILE_CONSTANTS.PRODUCTS_PER_PAGE;
  }, []);

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        { ProductService },
        { OptimizedProductService }
      ] = await Promise.all([
        import('../services/productService'),
        import('../services/optimizedProductService')
      ]);

      const [productsResponse, tiersData, gameTitlesData] = await Promise.all([
        OptimizedProductService.getProductsPaginated({
          status: 'active'
        }, {
          page: 1,
          limit: 200 // Increased to get all products
        }),
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);

      // Sort tiers: Pelajar → Reguler → Premium
      const sortedTiers = [...tiersData].sort((a, b) => {
        const order = { 'pelajar': 1, 'reguler': 2, 'premium': 3 };
        const aOrder = order[a.slug] || 999;
        const bOrder = order[b.slug] || 999;
        return aOrder - bOrder;
      });

      setState({
        products: productsResponse.data,
        filteredProducts: productsResponse.data,
        tiers: sortedTiers,
        gameTitles: gameTitlesData,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat produk. Silakan coba lagi.'
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter products
  useEffect(() => {
    let filtered = [...state.products];

    // Search filter
    if (filterState.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
  product.gameTitleData?.name?.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filterState.searchTerm.toLowerCase())
      );
    }

    // Game filter
    if (filterState.selectedGame) {
      filtered = filtered.filter(product => {
  const gameName = product.gameTitleData?.name;
        return gameName?.toLowerCase() === filterState.selectedGame.toLowerCase();
      });
    }

    // Tier filter
    if (filterState.selectedTier) {
      filtered = filtered.filter(product => {
        const tierSlug = product.tierData?.slug;
        return tierSlug?.toLowerCase() === filterState.selectedTier.toLowerCase();
      });
    }

    // Sort
    switch (filterState.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setState(prev => ({ ...prev, filteredProducts: filtered }));
    setCurrentPage(1); // Reset to first page when filters change
  }, [state.products, filterState.searchTerm, filterState.selectedGame, filterState.selectedTier, filterState.sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterState.searchTerm) params.set('search', filterState.searchTerm);
    if (filterState.selectedGame) params.set('game', filterState.selectedGame);
    if (filterState.selectedTier) params.set('tier', filterState.selectedTier);
    if (filterState.sortBy !== 'newest') params.set('sortBy', filterState.sortBy);
    setSearchParams(params);
  }, [filterState, setSearchParams]);

  // Save state for navigation back
  useEffect(() => {
    const stateToSave = {
      currentPage,
      ...filterState
    };
    sessionStorage.setItem('productsPageState', JSON.stringify(stateToSave));
  }, [currentPage, filterState]);

  const handleFilterChange = useCallback((key: string, value: string | boolean) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleFilters = useCallback(() => {
    setFilterState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  const closeFilters = useCallback(() => {
    setFilterState(prev => ({ ...prev, showFilters: false }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    scrollToPaginationContent();
  }, []);

  const resetFilters = useCallback(() => {
    handleFilterChange('searchTerm', '');
    handleFilterChange('selectedGame', '');
    handleFilterChange('selectedTier', '');
    handleFilterChange('sortBy', 'newest');
  }, [handleFilterChange]);

  // Pagination calculations
  const totalPages = Math.ceil(state.filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = state.filteredProducts.slice(startIndex, endIndex);

  return {
    // State
    ...state,
    filterState,
    currentPage,
    currentProducts,
    totalPages,
    
    // Actions
    fetchData,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    toggleFilters,
    closeFilters
  };
};
