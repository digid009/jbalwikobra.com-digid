/**
 * ProductsPage - Mobile-First Refactored Version
 * Following iOS Human Interface Guidelines & Android Material Design 3
 * 
 * Key Improvements:
 * - Touch-optimized filtering and search
 * - Native-like product browsing experience  
 * - Improved pagination with gesture-friendly controls
 * - Performance-optimized product loading
 * - Better visual hierarchy for product discovery
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Product, Tier, GameTitle } from '../types';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  X,
  ArrowUpDown
} from 'lucide-react';

// Mobile-first constants
const MOBILE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44,
  PRODUCTS_PER_PAGE: 12, // Optimized for mobile scrolling
  PRODUCTS_PER_PAGE_MOBILE: 8, // Fewer products on mobile for faster loading
  CONTENT_PADDING: 16,
  FILTER_ANIMATION_DURATION: 300,
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

// Mobile-optimized loading skeleton
const ProductsLoadingSkeleton = React.memo(() => (
  <div className="min-h-screen bg-black">
    {/* Header skeleton */}
    <div className="px-4 pt-6 pb-4">
      <div className="h-8 bg-zinc-800 rounded-lg w-48 mb-4 animate-pulse"></div>
      <div className="h-10 bg-zinc-800 rounded-xl mb-4 animate-pulse"></div>
    </div>
    
    {/* Filter bar skeleton */}
    <div className="px-4 mb-6">
      <div className="flex space-x-3">
        <div className="h-10 bg-zinc-800 rounded-xl flex-1 animate-pulse"></div>
        <div className="h-10 w-10 bg-zinc-800 rounded-xl animate-pulse"></div>
      </div>
    </div>
    
    {/* Products grid skeleton */}
    <div className="px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-zinc-900/50 rounded-2xl p-3 animate-pulse">
            <div className="aspect-square bg-zinc-800 rounded-xl mb-3"></div>
            <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-zinc-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

ProductsLoadingSkeleton.displayName = 'ProductsLoadingSkeleton';

// Mobile-optimized filter panel
const MobileFilterPanel = React.memo(({ 
  isOpen, 
  onClose, 
  filterState, 
  onFilterChange,
  gameTitles,
  tiers 
}: {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onFilterChange: (key: string, value: string) => void;
  gameTitles: GameTitle[];
  tiers: Tier[];
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Filter & Urutkan</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center transition-colors hover:bg-zinc-700"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          {/* Game Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Game
            </label>
            <select
              value={filterState.selectedGame}
              onChange={(e) => onFilterChange('selectedGame', e.target.value)}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            >
              <option value="">Semua Game</option>
              {gameTitles.map(game => (
                <option key={game.slug} value={game.name}>{game.name}</option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Tier
            </label>
            <select
              value={filterState.selectedTier}
              onChange={(e) => onFilterChange('selectedTier', e.target.value)}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            >
              <option value="">Semua Tier</option>
              {tiers.map(tier => (
                <option key={tier.slug} value={tier.slug}>{tier.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Urutkan
            </label>
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={() => {
              onFilterChange('searchTerm', '');
              onFilterChange('selectedGame', '');
              onFilterChange('selectedTier', '');
              onFilterChange('sortBy', 'newest');
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
});

MobileFilterPanel.displayName = 'MobileFilterPanel';

// Mobile-optimized pagination
const MobilePagination = React.memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index);
  };

  return (
    <div className="flex items-center justify-center space-x-2 px-4 py-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
          currentPage === 1
            ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2 mx-4">
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-zinc-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-pink-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
          currentPage === totalPages
            ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
});

MobilePagination.displayName = 'MobilePagination';

const ProductsPage: React.FC = () => {
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
          limit: 100
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
        product.gameTitle.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filterState.searchTerm.toLowerCase())
      );
    }

    // Game filter
    if (filterState.selectedGame) {
      filtered = filtered.filter(product => {
        const gameName = product.gameTitleData?.name || product.gameTitle;
        return gameName?.toLowerCase() === filterState.selectedGame.toLowerCase();
      });
    }

    // Tier filter
    if (filterState.selectedTier) {
      filtered = filtered.filter(product => {
        const tierSlug = product.tierData?.slug || product.tier;
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

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(state.filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = state.filteredProducts.slice(startIndex, endIndex);

  if (state.loading) {
    return <ProductsLoadingSkeleton />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Gagal Memuat Produk</h2>
          <p className="text-zinc-400 mb-6 text-sm">{state.error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-1">Katalog Produk</h1>
        <p className="text-zinc-400 text-sm">Temukan akun game impian Anda</p>
      </section>

      {/* Search & Filter Bar */}
      <section className="px-4 mb-6">
        <div className="flex space-x-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              value={filterState.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Cari akun game..."
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setFilterState(prev => ({ ...prev, showFilters: true }))}
            className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center transition-colors hover:bg-zinc-800"
          >
            <Filter size={20} className="text-zinc-300" />
          </button>
        </div>
      </section>

      {/* Results Info */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            {state.filteredProducts.length} produk ditemukan
            {totalPages > 1 && (
              <span className="ml-2">• Halaman {currentPage} dari {totalPages}</span>
            )}
          </span>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4">
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {currentProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard 
                  product={product} 
                  fromCatalogPage={true}
                  className="w-full h-full" 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-zinc-400 mb-6 text-sm">
              Coba ubah kata kunci pencarian atau filter Anda
            </p>
            <button
              onClick={() => {
                handleFilterChange('searchTerm', '');
                handleFilterChange('selectedGame', '');
                handleFilterChange('selectedTier', '');
                handleFilterChange('sortBy', 'newest');
              }}
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* Pagination */}
      <MobilePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Mobile Filter Panel */}
      <MobileFilterPanel
        isOpen={filterState.showFilters}
        onClose={() => setFilterState(prev => ({ ...prev, showFilters: false }))}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        gameTitles={state.gameTitles}
        tiers={state.tiers}
      />

      {/* Bottom spacing for mobile navigation */}
      <div className="h-6"></div>
    </div>
  );
};

export default ProductsPage;
