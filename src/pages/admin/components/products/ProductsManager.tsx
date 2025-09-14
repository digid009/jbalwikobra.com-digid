import React, { useState, useEffect } from 'react';
import { IOSCard, IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { IOSPagination } from '../../../../components/ios/IOSDesignSystem';
import { adminService, Product } from '../../../../services/adminService';
import { Search, Filter, Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import ProductsFilters from './ProductsFilters';
import ProductsGrid from './ProductsGrid';

interface ProductsManagerProps {
  className?: string;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  className = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  const [showFilters, setShowFilters] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getProducts(1, 100); // Get more products for local filtering
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.is_active : !product.is_active
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
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

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Handle product actions
  const handleViewProduct = async (product: Product) => {
    // TODO: Implement view modal or navigation
    console.log('View product:', product.id);
  };

  const handleEditProduct = async (product: Product) => {
    // TODO: Implement edit modal or navigation
    console.log('Edit product:', product.id);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // TODO: Implement delete product
      console.log('Delete product:', product.id);
      await loadProducts(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddProduct = () => {
    // TODO: Implement add product modal or navigation
    console.log('Add new product');
  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-pink-500" />
          <p className="text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <IOSCard className="bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/20">
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="text-xl font-bold text-white">Error Loading Products</h3>
          <p className="text-gray-300">{error}</p>
          <IOSButton
            variant="primary"
            onClick={loadProducts}
            className="bg-gradient-to-r from-pink-500 to-fuchsia-600"
          >
            Retry
          </IOSButton>
        </div>
      </IOSCard>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Products Management</h2>
          <p className="text-gray-300">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <IOSButton
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2',
              showFilters ? 'bg-pink-500/20 border-pink-500/50' : 'border-gray-500/30'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </IOSButton>

          <IOSButton
            variant="primary"
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </IOSButton>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ProductsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onAddProduct={handleAddProduct}
          onClearFilters={clearAllFilters}
        />
      )}

      {/* Products Grid */}
      <ProductsGrid
        products={paginatedProducts}
        loading={loading}
        onProductView={handleViewProduct}
        onProductEdit={handleEditProduct}
        onProductDelete={handleDeleteProduct}
      />

      {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="pt-6">
            <IOSPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              showItemsPerPageSelector
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
              itemsPerPageOptions={[8,12,16,24]}
            />
          </div>
        )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <IOSCard className="bg-gradient-to-r from-black/50 to-gray-900/50 border-gray-500/20">
          <div className="p-12 text-center space-y-6">
            <Package className="w-16 h-16 mx-auto text-gray-500" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {products.length === 0 ? 'No Products Found' : 'No Matching Products'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {products.length === 0 
                  ? 'Get started by adding your first product to the system.'
                  : 'Try adjusting your filters or search terms to find what you\'re looking for.'
                }
              </p>
            </div>
            {products.length === 0 ? (
              <IOSButton
                variant="primary"
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-pink-500 to-fuchsia-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </IOSButton>
            ) : (
              <IOSButton
                variant="ghost"
                onClick={clearAllFilters}
                className="border-pink-500/30 hover:bg-pink-500/20"
              >
                Clear All Filters
              </IOSButton>
            )}
          </div>
        </IOSCard>
      )}
    </div>
  );
};

export default ProductsManager;
