import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
// DS V2 components + new pagination
import { IOSCard, IOSButton } from '../../../../components/ios/IOSDesignSystemV2';
import { IOSPaginationV2 } from '../../../../components/ios/IOSPaginationV2';
import { adminService, Product } from '../../../../services/adminService';
import { ProductService } from '../../../../services/productService';
import { useCategories } from '../../../../hooks/useCategories';
import { Search, Filter, Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import ProductsFilters from './ProductsFilters';
// Removed card/list/grid UI in favor of unified table view
import ProductsTable from './ProductsTable';
import { t } from '../../../../i18n/strings';

interface ProductsManagerProps {
  className?: string;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  className = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProductsState, setFilteredProductsState] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(deferredSearch), 250);
    return () => clearTimeout(id);
  }, [deferredSearch]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState(''); // holds category_id

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const { categories } = useCategories();

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getProducts(1, 100); // Get more products for local filtering
      setProducts(response.data);
  setFilteredProductsState(response.data);
  // categories handled by hook
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
  if (debouncedSearch) {
      filtered = filtered.filter(product =>
    product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    product.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
  (product as any).categoryData?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
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
      filtered = filtered.filter(product => (product as any).category_id === categoryFilter);
    }

    // Always sort by created_at desc (newest first) - no sorting controls
    filtered.sort((a, b) => {
      const aDate = new Date(a.created_at || 0);
      const bDate = new Date(b.created_at || 0);
      return bDate.getTime() - aDate.getTime(); // desc order
    });

    return filtered;
  }, [products, debouncedSearch, statusFilter, categoryFilter]);

  // keep filteredProducts state for existing pagination logic (optional)
  useEffect(() => { setFilteredProductsState(filteredProducts); }, [filteredProducts]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProductsState.slice(startIndex, endIndex));
  }, [filteredProductsState, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('');
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

  const handleQuickUpdate = async (id: string, fields: Partial<Pick<Product,'price'|'stock'|'is_active'>>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p)); // optimistic
    const updated = await adminService.updateProductFields(id, fields);
    if (!updated) {
      // revert on failure
      await loadProducts();
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
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
          <h2 className="text-2xl font-bold text-white mb-2">{t('common.productsManagement')}</h2>
          <p className="text-gray-300">
            {filteredProducts.length} / {products.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <IOSButton
            variant="tertiary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 border',
              showFilters ? 'border-pink-500/60 bg-pink-600/20' : 'border-zinc-700'
            )}
          >
            <Filter className="w-4 h-4" />
            {t('common.filters')}
          </IOSButton>

          <IOSButton
            variant="primary"
            size="sm"
            onClick={handleAddProduct}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('common.addProduct')}
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
          onAddProduct={handleAddProduct}
          onClearFilters={clearAllFilters}
          categories={categories}
        />
      )}

      {/* Products Table */}
      <ProductsTable
        products={paginatedProducts}
        loading={loading}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onQuickUpdate={handleQuickUpdate}
      />

      {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="pt-6 space-y-3">
            {/* External items-per-page selector (replaces legacy built-in) */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
              <span className="text-zinc-400">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e)=>{ setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {[8,12,16,24].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="text-zinc-500">Total {filteredProducts.length}</span>
            </div>
            <IOSPaginationV2
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
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
                size="sm"
                onClick={handleAddProduct}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('common.addProduct')}
              </IOSButton>
            ) : (
              <IOSButton
                variant="tertiary"
                size="sm"
                onClick={clearAllFilters}
                className="border border-pink-500/40"
              >
                {t('common.clearAllFilters')}
              </IOSButton>
            )}
          </div>
        </IOSCard>
      )}
    </div>
  );
};

export default ProductsManager;
