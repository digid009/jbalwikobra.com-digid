import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Package, AlertCircle, Loader2, RefreshCw, Grid, List, Edit, Eye } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { ProductService } from '../../../services/productService';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystemV2';
import { cn } from '../../../styles/standardClasses';
import { ProductCrudModal } from './ProductCrudModal';
import { ProductCard } from './products/ProductCard';
import { ProductCardList } from './products/ProductCardList';
import { Tier, GameTitle } from '../../../types';

export const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference data for filters
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [gameTitleFilter, setGameTitleFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadReferenceData();
  }, []);

  // Separate effect for client-side filtering - no need to reload data
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getProducts(1, 200); // Get all products
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [tiersData, gameTitlesData] = await Promise.all([
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);
      setTiers(tiersData);
      setGameTitles(gameTitlesData);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  // Modal handlers
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSaved = () => {
    loadProducts(); // Refresh products after save
    handleCloseModal();
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.is_active : !product.is_active
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply tier filter using proper tier data
    if (tierFilter !== 'all') {
      filtered = filtered.filter(product => {
        const tierSlug = (product as any).tiers?.slug || (product as any).tier_slug || product.tier;
        const tierName = (product as any).tiers?.name || (product as any).tier_name;
        return tierSlug?.toLowerCase() === tierFilter.toLowerCase() ||
               tierName?.toLowerCase() === tierFilter.toLowerCase();
      });
    }

    // Apply game title filter using proper game title data  
    if (gameTitleFilter !== 'all') {
      filtered = filtered.filter(product => {
        const gameTitleSlug = (product as any).game_titles?.slug || (product as any).game_title_slug;
        const gameTitleName = (product as any).game_titles?.name || (product as any).game_title_name || product.game_title;
        return gameTitleSlug?.toLowerCase() === gameTitleFilter.toLowerCase() ||
               gameTitleName?.toLowerCase() === gameTitleFilter.toLowerCase();
      });
    }

    // Default sort by name ascending
    filtered.sort((a, b) => {
      const aValue = a.name?.toLowerCase() || '';
      const bValue = b.name?.toLowerCase() || '';
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTierFilter('all');
    setGameTitleFilter('all');
  };

  return (
    <div className="space-y-8 min-h-screen">
      {/* Modern Header with Glass Effect */}
      <div className="bg-gradient-to-r from-black via-gray-950 to-black backdrop-blur-xl border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-gray-400 mt-1">{filteredProducts.length} of {products.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <IOSButton 
              onClick={loadProducts} 
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 hover:from-pink-500/30 hover:to-fuchsia-500/30" 
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </IOSButton>
            <IOSButton 
              onClick={handleAddProduct}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </IOSButton>
          </div>
        </div>
      </div>

      {/* Modern Filters Section */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="space-y-6">
            {/* First Row - Search and View Mode */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400/60" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-black/60 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={cn(
                    'px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={cn(
                    'px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            {/* Second Row - Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-3 min-w-[140px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-3 min-w-[160px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tier Filter */}
              <div className="flex items-center space-x-3 min-w-[140px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="all">All Tiers</option>
                  {tiers.map(tier => (
                    <option key={tier.id} value={tier.slug}>{tier.name}</option>
                  ))}
                </select>
              </div>

              {/* Game Title Filter */}
              <div className="flex items-center space-x-3 min-w-[160px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Game:</span>
                <select
                  value={gameTitleFilter}
                  onChange={(e) => setGameTitleFilter(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="all">All Games</option>
                  {gameTitles.map(gameTitle => (
                    <option key={gameTitle.id} value={gameTitle.slug}>{gameTitle.name}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <IOSButton 
                onClick={clearAllFilters}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20 hover:from-red-500/20 hover:to-pink-500/20 whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Products Display */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse"></div>
              </div>
              <p className="text-white font-medium">Loading products...</p>
              <p className="text-gray-400 text-sm mt-1">Fetching product data from database</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="p-6">
              {viewMode === 'grid' ? (
                /* Grid View - Using ProductCard component with tier styling */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      tiers={tiers}
                      gameTitles={gameTitles}
                      onEdit={() => handleEditProduct(product)}
                      onView={() => {
                        // Add view functionality if needed
                        console.log('View product:', product);
                      }}
                      onDelete={() => {
                        // Add delete functionality if needed
                        console.log('Delete product:', product);
                      }}
                    />
                  ))}
                </div>
              ) : (
                /* List View - Using ProductCardList component with tier styling */
                <div className="space-y-3">
                  {paginatedProducts.map((product) => (
                    <ProductCardList
                      key={product.id}
                      product={product}
                      tiers={tiers}
                      gameTitles={gameTitles}
                      onEdit={() => handleEditProduct(product)}
                      onView={() => {
                        // Add view functionality if needed
                        console.log('View product:', product);
                      }}
                      onDelete={() => {
                        // Add delete functionality if needed
                        console.log('Delete product:', product);
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                    </span>
                    <div className="flex gap-2">
                      <IOSButton
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2"
                      >
                        Previous
                      </IOSButton>
                      <span className="px-4 py-2 bg-pink-500/20 text-pink-200 rounded-lg border border-pink-500/30 text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <IOSButton
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2"
                      >
                        Next
                      </IOSButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-pink-400/60" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/5 animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {products.length === 0 ? 'No Products Found' : 'No Matching Products'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {products.length === 0 
                  ? 'Get started by adding your first product to the system.'
                  : 'Try adjusting your filters or search terms to find what you\'re looking for.'
                }
              </p>
              {products.length === 0 ? (
                <IOSButton
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </IOSButton>
              ) : (
                <IOSButton
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 border-pink-500/20 hover:from-pink-500/20 hover:to-fuchsia-500/20"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear All Filters
                </IOSButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product CRUD Modal */}
      <ProductCrudModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSuccess={handleProductSaved}
      />
    </div>
  );
};
