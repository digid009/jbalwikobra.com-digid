import React, { useState, useEffect, useCallback } from 'react';
import { adminInputBase, adminInputWithLeftIcon, adminCheckboxBase } from './ui/InputStyles';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Tag,
  Calendar
} from 'lucide-react';
import { IOSButton, IOSCard, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { useProducts, useCrudOperations, useBulkOperations } from '../../../hooks/useAdminData';
import { enhancedAdminService, Product, CreateProductData } from '../../../services/enhancedAdminService';
import ProductDialog from './ProductDialog';

const ProductsTab: React.FC = () => {
  // State for UI
  const [showFilters, setShowFilters] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Data hooks - Using proper typing
  const {
    data: products,
    loading,
    error,
    totalCount,
    totalPages,
    pagination,
    refresh,
    updatePagination,
    updateFilters,
    changeSorting
  } = useProducts({
    search: searchTerm,
    category: selectedCategory,
    is_active: selectedStatus ? selectedStatus === 'active' : undefined
  });

  const {
    create,
    update,
    remove,
    loading: crudLoading
  } = useCrudOperations<Product>();

  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    executeBulkOperation
  } = useBulkOperations<Product>();

  // Categories data (could be fetched from API)
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Food & Beverages'];

  // Effects
  useEffect(() => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedStatus) filters.is_active = selectedStatus === 'active';
    
    updateFilters(filters);
  }, [searchTerm, selectedCategory, selectedStatus, updateFilters]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const handleSort = useCallback((column: string) => {
    changeSorting(column);
  }, [changeSorting]);

  const handlePageChange = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const handleSelectProduct = useCallback((id: string) => {
    toggleSelection(id);
  }, [toggleSelection]);

  const handleSelectAll = useCallback(() => {
    toggleAll(products.map((p: Product) => p.id));
  }, [toggleAll, products]);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setDialogMode('create');
    setShowProductDialog(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setDialogMode('edit');
    setShowProductDialog(true);
  }, []);

  const handleViewProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setDialogMode('view');
    setShowProductDialog(true);
  }, []);

  const handleDeleteProduct = useCallback(async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await remove(
        () => enhancedAdminService.deleteProduct(product.id),
        () => refresh(),
        () => {} // Error silently logged by hook
      );
    }
  }, [remove, refresh]);

  const handleToggleStatus = useCallback(async (product: Product) => {
    await update(
      () => enhancedAdminService.updateProduct(product.id, { is_active: !product.is_active }),
      () => refresh(),
      () => {} // Error silently logged by hook
    );
  }, [update, refresh]);

  const handleBulkStatusChange = useCallback(async (isActive: boolean) => {
    await executeBulkOperation(
      (ids) => enhancedAdminService.bulkUpdateProducts(ids, { is_active: isActive }),
      () => {
        clearSelection();
        refresh();
      },
      () => {} // Error silently logged by hook
    );
  }, [executeBulkOperation, clearSelection, refresh]);

  const handleBulkDelete = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      await executeBulkOperation(
        (ids) => enhancedAdminService.bulkDeleteProducts(ids),
        () => {
          clearSelection();
          refresh();
        },
        (error) => {} // Error silently logged by hook
      );
    }
  }, [executeBulkOperation, selectedIds.length, clearSelection, refresh]);

  const handleSaveProduct = useCallback(async (productData: Partial<Product>) => {
    if (editingProduct) {
      await update(
        () => enhancedAdminService.updateProduct(editingProduct.id, productData),
        () => {
          setShowProductDialog(false);
          setEditingProduct(null);
          refresh();
        }
      );
    } else {
      // Ensure required fields are present for creation
      const createData: CreateProductData = {
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        category: productData.category || '',
        stock: productData.stock || 0,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        image: productData.image || '',
        images: productData.images || [],
        has_rental: productData.has_rental || false,
        is_flash_sale: productData.is_flash_sale || false,
        original_price: productData.original_price,
        game_title: productData.game_title,
        account_level: productData.account_level,
        account_details: productData.account_details,
        flash_sale_end_time: productData.flash_sale_end_time,
        tier_id: productData.tier_id,
        game_title_id: productData.game_title_id,
        archived_at: productData.archived_at
      };
      
      await create(
        () => enhancedAdminService.createProduct(createData),
        () => {
          setShowProductDialog(false);
          setEditingProduct(null);
          refresh();
        }
      );
    }
  }, [editingProduct, update, create, refresh]);

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSortIcon = (column: string) => {
    if (pagination.sortBy !== column) return null;
    return pagination.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-900 rounded mb-2"></div>
                <div className="h-3 bg-gray-900 rounded w-2/3"></div>
              </div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Products Management</h2>
          <p className="text-gray-200">
            Manage your product catalog ({totalCount} total products)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <IOSButton
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </IOSButton>
          <IOSButton
            onClick={handleAddProduct}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </IOSButton>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <IOSCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={adminInputBase}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={adminInputBase}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={adminInputWithLeftIcon}
                  />
                </div>
              </div>
            </div>
          </div>
        </IOSCard>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <IOSCard>
          <div className="p-4 bg-gray-900 border border-pink-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-pink-300">
                {selectedIds.length} products selected
              </span>
              <div className="flex items-center space-x-2">
                <IOSButton
                  onClick={() => handleBulkStatusChange(true)}
                  variant="secondary"
                  size="small"
                  disabled={crudLoading}
                >
                  Activate
                </IOSButton>
                <IOSButton
                  onClick={() => handleBulkStatusChange(false)}
                  variant="secondary"
                  size="small"
                  disabled={crudLoading}
                >
                  Deactivate
                </IOSButton>
                <IOSButton
                  onClick={handleBulkDelete}
                  variant="secondary"
                  size="small"
                  className="text-red-600"
                  disabled={crudLoading}
                >
                  Delete
                </IOSButton>
                <IOSButton
                  onClick={clearSelection}
                  variant="secondary"
                  size="small"
                >
                  Clear
                </IOSButton>
              </div>
            </div>
          </div>
        </IOSCard>
      )}

      {/* Error Display */}
      {error && (
        <IOSCard>
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-800">{error}</span>
              <button
                onClick={() => refresh()}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </IOSCard>
      )}

      {/* Products Grid */}
      <IOSCard>
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
            <p className="text-gray-300 mb-4">Start by creating your first product</p>
            <IOSButton onClick={handleAddProduct} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </IOSButton>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: Product) => (
                <div key={product.id} className="border border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl shadow-black/50 transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="absolute top-3 left-3 rounded border-gray-700 text-pink-500 focus:ring-pink-500 focus:ring-2 z-10"
                    />
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
                    </div>

                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-pink-500">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-300 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {product.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {product.stock} left
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <Calendar className="w-3 h-3" />
                        {formatDate(product.created_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <IOSButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </IOSButton>
                      <IOSButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </IOSButton>
                      <IOSButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleDeleteProduct(product)}
                        className="flex items-center justify-center gap-2 text-red-600"
                        disabled={crudLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IOSButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
                <div className="text-sm text-gray-100">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalCount)} of {totalCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <IOSButton
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="secondary"
                    size="small"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </IOSButton>
                  <span className="text-sm text-gray-100">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <IOSButton
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                    variant="secondary"
                    size="small"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </IOSButton>
                </div>
              </div>
            )}
          </div>
        )}
      </IOSCard>

      {/* Product Dialog */}
      {showProductDialog && (
        <ProductDialog
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductDialog(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
