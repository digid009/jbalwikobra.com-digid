import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Package, AlertCircle, Loader2, RefreshCw, Grid, List, Edit, Eye } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSPagination } from '../../../components/ios/IOSDesignSystem';
import { cn } from '../../../styles/standardClasses';
import { ProductCrudModal } from './ProductCrudModal';

export const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [gameTitleFilter, setGameTitleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Separate effect for client-side filtering - no need to reload data
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getProducts(1, 100);
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
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

    // Apply tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.tier?.toLowerCase() === tierFilter.toLowerCase()
      );
    }

    // Apply game title filter
    if (gameTitleFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.game_title?.toLowerCase() === gameTitleFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const tiers = useMemo(() => {
    const tierSet = new Set(products.map(p => p.tier).filter(Boolean));
    return Array.from(tierSet);
  }, [products]);

  const gameTitles = useMemo(() => {
    const titleSet = new Set(products.map(p => p.game_title).filter(Boolean));
    return Array.from(titleSet);
  }, [products]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTierFilter('all');
    setGameTitleFilter('all');
    setSortBy('name');
    setSortOrder('asc');
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
                    <option key={tier} value={tier}>{tier}</option>
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
                  {gameTitles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-3 min-w-[140px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'created_at')}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="created_at">Date</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center space-x-3 min-w-[120px]">
                <span className="text-sm font-medium text-pink-200/80 whitespace-nowrap">Order:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
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
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-pink-500/30 transition-all duration-300 group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-700/30 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            product.is_active
                              ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border border-emerald-500/30"
                              : "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200 border border-gray-500/30"
                          )}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white group-hover:text-pink-200 transition-colors duration-300 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {product.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                            Rp {(product.price || 0).toLocaleString()}
                          </span>
                          {product.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                              {product.category}
                            </span>
                          )}
                        </div>
                        
                        {/* Edit Button */}
                        <div className="mt-3">
                          <IOSButton
                            size="small"
                            onClick={() => handleEditProduct(product)}
                            className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-200 hover:text-blue-100 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </IOSButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-pink-200 transition-colors duration-300 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {product.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                            Rp {(product.price || 0).toLocaleString()}
                          </div>
                          {product.category && (
                            <div className="text-xs text-pink-300">{product.category}</div>
                          )}
                        </div>
                        <IOSButton
                          size="small"
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-200 hover:text-blue-100 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </IOSButton>
                        <span className={cn(
                          "inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap",
                          product.is_active
                            ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border border-emerald-500/30"
                            : "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200 border border-gray-500/30"
                        )}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <IOSPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    showItemsPerPageSelector={true}
                    onItemsPerPageChange={setItemsPerPage}
                  />
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
