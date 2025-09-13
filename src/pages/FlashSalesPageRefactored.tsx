import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductTier } from '../types';
import ProductCard from '../components/ProductCard';
import { 
  Zap, 
  Clock, 
  Flame,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
  Filter,
  Star,
  Heart
} from 'lucide-react';

// --- Sorting helpers extracted outside component to avoid any ESLint false-positives ---
const discountPct = (p: Product) =>
  p.originalPrice && p.isFlashSale
    ? ((p.originalPrice - p.price) / p.originalPrice) * 100
    : 0;

const FLASH_SORT_COMPARATORS: Record<
  'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc',
  (a: Product, b: Product) => number
> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'discount-desc': (a, b) => discountPct(b) - discountPct(a),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

// Pagination configuration
const ITEMS_PER_PAGE = 12;

// Updated grid layouts with mobile-first approach
const GRID_LAYOUTS = {
  '2': 'grid-cols-2 gap-4 sm:gap-6',
  '3': 'grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3',
  '4': 'grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4',
  '6': 'grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6'
} as const;

type GridLayout = keyof typeof GRID_LAYOUTS;

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

interface FlashSalesFilters {
  searchQuery: string;
  sortBy: 'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc';
  gameFilter: string;
}

const FlashSalesPageRefactored: React.FC = () => {
  // State management
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridLayout, setGridLayout] = useState<GridLayout>('4');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FlashSalesFilters>({
    searchQuery: '',
    sortBy: 'discount-desc',
    gameFilter: ''
  });

  // Load flash sale products
  useEffect(() => {
    let mounted = true;

    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        
        // For now, using mock data - replace with actual API call
        if (mounted) {
          const mockProducts = Array.from({ length: 25 }, (_, i) => ({
            id: `flash-${i}`,
            name: `Flash Sale Account ${i + 1}`,
            description: `Akun premium dengan rank tinggi dan item eksklusif. Harga flash sale terbatas!`,
            price: Math.floor(Math.random() * 500000) + 50000,
            originalPrice: Math.floor(Math.random() * 800000) + 200000,
            image: `https://images.unsplash.com/photo-${1542751110 + i}-97427bbecf20?w=400&h=300&fit=crop`,
            images: [`https://images.unsplash.com/photo-${1542751110 + i}-97427bbecf20?w=400&h=300&fit=crop`],
            category: 'gaming-accounts',
            tier: ['reguler', 'pelajar', 'premium'][i % 3] as ProductTier,
            gameTitle: ['Mobile Legends', 'Free Fire', 'PUBG Mobile', 'Genshin Impact', 'Call of Duty'][i % 5],
            isActive: true,
            stock: Math.floor(Math.random() * 10) + 1,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
            hasRental: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setFlashSaleProducts(mockProducts);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSales();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...flashSaleProducts];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.gameTitle?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Apply game filter
    if (filters.gameFilter) {
      filtered = filtered.filter(product => product.gameTitle === filters.gameFilter);
    }

    // Apply sorting
    const compareFn = FLASH_SORT_COMPARATORS[filters.sortBy];
    if (compareFn) {
      filtered.sort(compareFn);
    }

    return filtered;
  }, [flashSaleProducts, filters]);

  // Pagination logic
  const paginationInfo = useMemo<PaginationInfo>(() => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      startIndex,
      endIndex
    };
  }, [filteredProducts.length, currentPage]);

  // Current page products
  const currentProducts = useMemo(() => {
    return filteredProducts.slice(paginationInfo.startIndex, paginationInfo.endIndex);
  }, [filteredProducts, paginationInfo]);

  // Available games for filtering
  const gameOptions = useMemo(() => {
    const games = new Set(flashSaleProducts.map(p => p.gameTitle).filter(Boolean));
    return Array.from(games).sort();
  }, [flashSaleProducts]);

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < paginationInfo.totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, paginationInfo.totalPages, handlePageChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sortBy: FlashSalesFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  }, []);

  const handleGameFilterChange = useCallback((gameFilter: string) => {
    setFilters(prev => ({ ...prev, gameFilter }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ searchQuery: '', sortBy: 'discount-desc', gameFilter: '' });
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Skeleton */}
          <div className="text-center mb-16">
            <div className="h-16 w-64 bg-gray-800/50 rounded-2xl mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-800/50 rounded-xl mx-auto animate-pulse"></div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 animate-pulse">
                <div className="h-32 bg-gray-800/50 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-800/50 rounded mb-2"></div>
                <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-800/50 rounded flex-1"></div>
                  <div className="h-8 bg-gray-800/50 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Enhanced Glassmorphism Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Flash Sale Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl mb-8">
            <Zap className="w-10 h-10 text-pink-400" />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Flash Sale
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Diskon hingga <span className="text-pink-400 font-bold">70%</span> untuk akun game terpilih! 
            <br className="hidden sm:block" />
            Buruan, stok terbatas dan waktu terbatas!
          </p>

          {/* Stats Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-6 lg:gap-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6 text-pink-400 mr-2" />
                  <span className="text-3xl font-bold text-white">{flashSaleProducts.length}</span>
                </div>
                <p className="text-sm text-gray-400">Total Produk</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-3xl font-bold text-white">70%</span>
                </div>
                <p className="text-sm text-gray-400">Diskon Maksimal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Filter & Search Section */}
      <section className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk flash sale..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
              >
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>

              {/* Desktop Sorting */}
              <div className="hidden lg:flex items-center gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as FlashSalesFilters['sortBy'])}
                  className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="discount-desc">Diskon Terbesar</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="name-asc">Nama A-Z</option>
                </select>

                <select
                  value={filters.gameFilter}
                  onChange={(e) => handleGameFilterChange(e.target.value)}
                  className="px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="">Semua Game</option>
                  {gameOptions.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-400 whitespace-nowrap">
                {paginationInfo.totalItems} produk
              </div>
            </div>
          </div>

          {/* Mobile Game Filter Tabs */}
          <div className="mt-4 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleGameFilterChange('')}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  !filters.gameFilter
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Semua
              </button>
              {gameOptions.slice(0, 5).map((game) => (
                <button
                  key={game}
                  onClick={() => handleGameFilterChange(game)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                    filters.gameFilter === game
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {filteredProducts.length > 0 ? (
            <div className="space-y-12">
              {/* Products Grid */}
              <div className={`grid ${GRID_LAYOUTS[gridLayout]}`}>
                {currentProducts.map((product) => (
                  <div key={product.id} className="group">
                    <ProductCard
                      product={product}
                      showFlashSaleTimer={true}
                      className="h-full transform transition-all duration-300 hover:scale-105 hover:z-10"
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced Glassmorphism Pagination */}
              {paginationInfo.totalPages > 1 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-400">
                      Menampilkan <span className="text-white font-medium">{paginationInfo.startIndex + 1}-{paginationInfo.endIndex}</span> dari <span className="text-white font-medium">{paginationInfo.totalItems}</span> produk
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                          let pageNum;
                          if (paginationInfo.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= paginationInfo.totalPages - 2) {
                            pageNum = paginationInfo.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                                pageNum === currentPage
                                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                                  : 'bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === paginationInfo.totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 rounded-3xl mb-8">
                <Zap className="w-12 h-12 text-pink-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {filters.searchQuery || filters.gameFilter ? 'Tidak Ada Hasil' : 'Belum Ada Flash Sale'}
              </h3>
              
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                {filters.searchQuery || filters.gameFilter 
                  ? 'Coba ubah kata kunci pencarian atau filter untuk menemukan produk yang Anda cari.'
                  : 'Flash sale sedang tidak tersedia saat ini. Pantai terus untuk penawaran menarik berikutnya!'
                }
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {(filters.searchQuery || filters.gameFilter) && (
                  <button 
                    onClick={clearFilters}
                    className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Reset Filter
                  </button>
                )}
                <Link
                  to="/products"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200"
                >
                  Lihat Semua Produk
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border-t border-white/10 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Filter & Urutkan</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-6">
              {/* Sorting */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Urutkan Berdasarkan</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as FlashSalesFilters['sortBy'])}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="discount-desc">Diskon Terbesar</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="name-asc">Nama A-Z</option>
                </select>
              </div>

              {/* Game Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Game</label>
                <select
                  value={filters.gameFilter}
                  onChange={(e) => handleGameFilterChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="">Semua Game</option>
                  {gameOptions.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSalesPageRefactored;
