import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Package as PackageIcon, Plus, Filter, X, Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSImageUploader } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { ProductService } from '../../../services/productService';
import { uploadFiles } from '../../../services/storageService';
import { cn } from '../../../styles/standardClasses';

export const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 1,
    images: [] as string[],
    accountLevel: '',
    accountDetails: ''
  });

  const emptyForm = {
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 1,
    images: [] as string[],
    accountLevel: '',
    accountDetails: ''
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, categoryFilter, statusFilter, priceFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await adminService.getProducts(currentPage, itemsPerPage, searchTerm);
      setProducts(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form actions
  const startCreate = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setShowForm(true);
  };

  const startEdit = async (product: Product) => {
    // Load full product data including images
    try {
      const fullProduct = await ProductService.getProductById(product.id);
      
      if (!fullProduct) {
        throw new Error('Product not found');
      }
      
      // Build images array properly - ProductService returns Product with camelCase
      let images: string[] = [];
      if (fullProduct.images && Array.isArray(fullProduct.images)) {
        images = fullProduct.images;
      } else if (fullProduct.image && fullProduct.image.trim()) {
        images = [fullProduct.image];
      }
      
      setForm({
        name: fullProduct.name || '',
        description: fullProduct.description || '',
        price: fullProduct.price || 0,
        originalPrice: fullProduct.originalPrice || 0,
        category: fullProduct.category || '',
        stock: fullProduct.stock || 1,
        images: images,
        accountLevel: fullProduct.accountLevel || '',
        accountDetails: fullProduct.accountDetails || ''
      });
      // Cast to admin Product type for state
      setEditingProduct(product);
      setShowForm(true);
    } catch (error) {
      console.error('Error loading product details:', error);
      // Fallback to basic data from adminService Product (snake_case)
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.original_price || 0,
        category: product.category || '',
        stock: product.stock || 1,
        images: product.images || (product.image ? [product.image] : []),
        accountLevel: product.account_level || '',
        accountDetails: product.account_details || ''
      });
      setEditingProduct(product);
      setShowForm(true);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim() || form.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        original_price: form.originalPrice || null,
        category: form.category,
        stock: form.stock,
        image: form.images[0] || '',
        images: form.images,
        account_level: form.accountLevel || null,
        account_details: form.accountDetails || null,
        gameTitle: 'General',
        isFlashSale: false,
        hasRental: false
      };

      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, payload);
      } else {
        await ProductService.createProduct(payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    try {
      const images = product.images || (product.image ? [product.image] : []);
      await ProductService.deleteProduct(product.id, { images });
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleArchive = async (product: Product, archive: boolean) => {
    try {
      await ProductService.updateProduct(product.id, { 
        is_active: !archive,
        archived_at: archive ? new Date().toISOString() : null
      });
      await loadProducts();
    } catch (error) {
      console.error('Error archiving product:', error);
      alert('Failed to archive product');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={false}
        errorMessage={''}
        statsLoaded={!loading}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Products Management"
          subtitle="Manage your product catalog"
        />
        <div className="flex items-center space-x-2">
          <IOSButton onClick={loadProducts} className="flex items-center space-x-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton variant="primary" onClick={startCreate} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </IOSButton>
        </div>
      </div>

      {/* Filters */}
      <IOSCard variant="elevated" padding="medium">
        <div className="space-y-4">
          {/* First Row - Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text-secondary" />
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-xl transition-colors duration-200',
                'bg-ios-surface border border-ios-border text-ios-text placeholder-ios-text-secondary',
                'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
              )}
            />
          </div>

          {/* Second Row - Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <Filter className="w-4 h-4 text-ios-text-secondary" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-2 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="books">Books</option>
                <option value="beauty">Beauty</option>
                <option value="toys">Toys</option>
                <option value="automotive">Automotive</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-ios-text-secondary">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-2 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-ios-text-secondary">Price:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-2 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Prices</option>
                <option value="low">Under Rp 50,000</option>
                <option value="medium">Rp 50,000 - 200,000</option>
                <option value="high">Rp 200,000 - 500,000</option>
                <option value="premium">Over Rp 500,000</option>
              </select>
            </div>

            {/* Clear Filters */}
            <IOSButton 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setPriceFilter('all');
              }}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      <IOSCard variant="elevated" padding="none">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-accent" />
              <p className="text-ios-text-secondary font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="w-full">
              <thead className={cn(
                'bg-ios-surface border-b border-ios-border'
              )}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ios-text/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-ios-surface transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-ios-text/10 rounded-lg flex items-center justify-center">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <PackageIcon className="w-5 h-5 text-ios-text/60" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-ios-text">{product.name}</div>
                          <div className="text-sm text-ios-text-secondary">{product.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-ios-text">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-ios-text">
                        Rp {product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${product.stock > 0 ? 'text-ios-success' : 'text-ios-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active 
                          ? 'bg-ios-success/10 text-ios-success border border-ios-success/20' 
                          : 'bg-ios-error/10 text-ios-error border border-ios-error/20'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-ios-text-secondary">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <IOSButton
                          variant="ghost"
                          size="small"
                          onClick={() => startEdit(product)}
                          className="text-ios-primary border-ios-primary/30 hover:bg-ios-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </IOSButton>
                        
                        {product.is_active ? (
                          <IOSButton
                            variant="ghost"
                            size="small"
                            onClick={() => handleArchive(product, true)}
                            className="text-ios-warning border-ios-warning/30 hover:bg-ios-warning/10"
                          >
                            <Archive className="w-4 h-4" />
                          </IOSButton>
                        ) : (
                          <IOSButton
                            variant="ghost"
                            size="small"
                            onClick={() => handleArchive(product, false)}
                            className="text-ios-success border-ios-success/30 hover:bg-ios-success/10"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </IOSButton>
                        )}
                        
                        <IOSButton
                          variant="ghost"
                          size="small"
                          onClick={() => handleDelete(product)}
                          className="text-ios-error border-ios-error/30 hover:bg-ios-error/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-ios-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="w-8 h-8 text-ios-text-secondary" />
              </div>
              <p className="text-ios-text-secondary font-medium">No products found</p>
            </div>
          )}
        </div>
      </IOSCard>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <IOSCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-ios-text">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={cancelForm}
                  className="text-ios-text-secondary hover:bg-ios-surface"
                >
                  <X className="w-5 h-5" />
                </IOSButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ios-text mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                        'text-ios-text placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                      )}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-text mb-2">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                        'text-ios-text placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                      )}
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ios-text mb-2">Price *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                          'text-ios-text placeholder-ios-text-secondary',
                          'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                        )}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ios-text mb-2">Original Price</label>
                      <input
                        type="number"
                        value={form.originalPrice}
                        onChange={(e) => setForm(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                          'text-ios-text placeholder-ios-text-secondary',
                          'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                        )}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ios-text mb-2">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                          'text-ios-text focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                        )}
                      >
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Garden</option>
                        <option value="sports">Sports</option>
                        <option value="books">Books</option>
                        <option value="beauty">Beauty</option>
                        <option value="toys">Toys</option>
                        <option value="automotive">Automotive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ios-text mb-2">Stock</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                          'text-ios-text placeholder-ios-text-secondary',
                          'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                        )}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Images & Additional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ios-text mb-2">Product Images (Max 15)</label>
                    <IOSImageUploader
                      images={form.images}
                      onChange={(images) => setForm(prev => ({ ...prev, images }))}
                      onUpload={async (files, onProgress) => {
                        try {
                          const uploadedUrls = await uploadFiles(files, 'products', onProgress);
                          return uploadedUrls;
                        } catch (error) {
                          console.error('Error uploading images:', error);
                          throw error;
                        }
                      }}
                      max={15}
                      label="Product Images"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-text mb-2">Account Level</label>
                    <input
                      type="text"
                      value={form.accountLevel}
                      onChange={(e) => setForm(prev => ({ ...prev, accountLevel: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                        'text-ios-text placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                      )}
                      placeholder="e.g., Beginner, Advanced, Master"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ios-text mb-2">Account Details</label>
                    <textarea
                      value={form.accountDetails}
                      onChange={(e) => setForm(prev => ({ ...prev, accountDetails: e.target.value }))}
                      rows={3}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-ios-border bg-ios-surface',
                        'text-ios-text placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                      )}
                      placeholder="Additional account information..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-ios-border">
                <IOSButton
                  variant="ghost"
                  onClick={cancelForm}
                  disabled={saving}
                  className="text-ios-text-secondary border-ios-border"
                >
                  Cancel
                </IOSButton>
                <IOSButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[120px]"
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </IOSButton>
              </div>
            </div>
          </IOSCard>
        </div>
      )}
    </div>
  );
};
