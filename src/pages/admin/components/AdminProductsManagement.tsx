import React, { useState, useEffect } from 'react';
import { adminInputWithLeftIcon, adminInputBase } from './ui/InputStyles';
import { Search, RefreshCw, Package as PackageIcon, Plus, Filter, X, Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSImageUploader } from '../../../components/ios/IOSDesignSystem';
import { IOSToggle } from '../../../components/ios/IOSToggle';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { ProductService } from '../../../services/productService';
import { uploadFiles } from '../../../services/storageService';
import { supabase } from '../../../services/supabase';
import { cn } from '../../../styles/standardClasses';

export const AdminProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Tiers data
  const [tiers, setTiers] = useState<Array<{id: string, name: string}>>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Game titles data
  const [gameTitles, setGameTitles] = useState<Array<{id: string, name: string}>>([]);
  const [gameTitlesLoading, setGameTitlesLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    tier_id: '',
    game_title: '',
    stock: 1,
    images: [] as string[],
    account_level: '',
    account_details: '',
    is_active: true,
    // Rental options
    is_rental: false,
    rental_duration_hours: 24,
    rental_unit: 'Hours',
    rental_price_per_hour: 0,
    rental_deposit: 0
  });

  const emptyForm = {
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    tier_id: '',
    game_title: '',
    stock: 1,
    images: [] as string[],
    account_level: '',
    account_details: '',
    is_active: true,
    // Rental options
    is_rental: false,
    rental_duration_hours: 24,
    rental_unit: 'Hours',
    rental_price_per_hour: 0,
    rental_deposit: 0
  };

  useEffect(() => {
    loadProducts();
    loadTiers();
    loadGameTitles();
  }, [currentPage, tierFilter, statusFilter, priceFilter]);

  const loadTiers = async () => {
    try {
      setTiersLoading(true);
      const { data, error } = await supabase
        .from('tiers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error loading tiers:', error);
      setTiers([]);
    } finally {
      setTiersLoading(false);
    }
  };

  const loadGameTitles = async () => {
    try {
      setGameTitlesLoading(true);
      const { data, error } = await supabase
        .from('game_titles')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setGameTitles(data || []);
    } catch (error) {
      console.error('Error loading game titles:', error);
      setGameTitles([]);
    } finally {
      setGameTitlesLoading(false);
    }
  };

  const getTierName = (tierIdOrCategory: string) => {
    if (!tierIdOrCategory) return '-';
    
    // First try to find by tier ID
    const tier = tiers.find(t => t.id === tierIdOrCategory);
    if (tier) return tier.name;
    
    // Fallback to category name if not found in tiers
    return tierIdOrCategory;
  };

  const getGameTitleName = (gameTitleIdOrName: string) => {
    if (!gameTitleIdOrName) return '-';
    
    // First try to find by game title ID
    const gameTitle = gameTitles.find(g => g.id === gameTitleIdOrName);
    if (gameTitle) return gameTitle.name;
    
    // Fallback to the name itself if not found in game_titles
    return gameTitleIdOrName;
  };

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
        original_price: fullProduct.originalPrice || 0,
        tier_id: (fullProduct as any).tier_id || fullProduct.tierId || fullProduct.category || '',
        game_title: (fullProduct as any).game_title || fullProduct.gameTitle || '',
        stock: fullProduct.stock || 1,
        images: images,
        account_level: fullProduct.accountLevel || '',
        account_details: fullProduct.accountDetails || '',
        is_active: true,
        // Rental fields - Default values for now
        is_rental: false,
        rental_duration_hours: 24,
        rental_unit: 'Hours',
        rental_price_per_hour: 0,
        rental_deposit: 0
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
        original_price: product.original_price || 0,
        tier_id: product.tier_id || product.category || '',
        game_title: product.game_title || '',
        stock: product.stock || 1,
        images: product.images || (product.image ? [product.image] : []),
        account_level: product.account_level || '',
        account_details: product.account_details || '',
        is_active: product.is_active !== false,
        // Rental fields - Default values for now
        is_rental: false,
        rental_duration_hours: 24,
        rental_unit: 'Hours',
        rental_price_per_hour: 0,
        rental_deposit: 0
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
        original_price: form.original_price || null,
        tier_id: form.tier_id,
        game_title: form.game_title || 'General',
        gameTitle: form.game_title || 'General', // For ProductService compatibility
        stock: form.stock,
        image: form.images[0] || '',
        images: form.images,
        account_level: form.account_level || null,
        account_details: form.account_details || null,
        is_active: form.is_active,
        isFlashSale: false,
        hasRental: form.is_rental,
        // Rental fields
        is_rental: form.is_rental,
        rental_duration_hours: form.is_rental ? form.rental_duration_hours : null,
        rental_price_per_hour: form.is_rental ? form.rental_price_per_hour : null,
        rental_deposit: form.is_rental ? form.rental_deposit : null
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-200" />
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={adminInputWithLeftIcon.replace('py-2','py-3').replace('rounded-2xl','rounded-xl') + ' placeholder-ios-text-secondary'}
            />
          </div>

          {/* Second Row - Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <Filter className="w-4 h-4 text-gray-200" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className={adminInputBase.replace('rounded-2xl','rounded-xl').replace('px-3','px-4')}
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
              <span className="text-sm font-medium text-gray-200">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={adminInputBase.replace('rounded-2xl','rounded-xl').replace('px-3','px-4')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-gray-200">Price:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={adminInputBase.replace('rounded-2xl','rounded-xl').replace('px-3','px-4')}
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
                setTierFilter('all');
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
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
              <p className="text-gray-200 font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="w-full">
              <thead className={cn(
                'bg-black border-b border-gray-700'
              )}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-black transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-ios-text/10 rounded-2xl flex items-center justify-center">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded-2xl object-cover"
                            />
                          ) : (
                            <PackageIcon className="w-5 h-5 text-white/60" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-200">
                            {getGameTitleName(product.game_title)} • {product.description.substring(0, 40)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{getTierName(product.tier_id || product.category)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">
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
                      <span className="text-sm text-gray-200">
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
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-200 font-medium">No products found</p>
            </div>
          )}
        </div>
      </IOSCard>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <IOSCard className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={cancelForm}
                  className="text-gray-200 hover:bg-black"
                >
                  <X className="w-5 h-5" />
                </IOSButton>
              </div>

              {/* Form Content - 3 Column Layout with Rental Variations */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column 1: Basic Product Info + Category & Game */}
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl') + ' placeholder-ios-text-secondary'}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl') + ' placeholder-ios-text-secondary'}
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Price *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl') + ' placeholder-ios-text-secondary'}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Original Price</label>
                      <input
                        type="number"
                        value={form.original_price}
                        onChange={(e) => setForm(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                        className={adminInputBase.replace('px-3','px-4').replace('py-2','py-3').replace('rounded-2xl','rounded-xl') + ' placeholder-ios-text-secondary'}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm(prev => ({ ...prev, stock: Math.max(0, Number(e.target.value)) }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                        'text-white placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                      )}
                      placeholder="1"
                      min="0"
                    />
                  </div>
                    </div>

                    {/* Tier & Game Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Tier & Game</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Tier *</label>
                    <select
                      value={form.tier_id}
                      onChange={(e) => setForm(prev => ({ ...prev, tier_id: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                        'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                      )}
                      disabled={tiersLoading}
                    >
                      <option value="">Select Tier</option>
                      {tiers.map(tier => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Game Title</label>
                    <select
                      value={form.game_title}
                      onChange={(e) => setForm(prev => ({ ...prev, game_title: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                        'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                      )}
                      disabled={gameTitlesLoading}
                    >
                      <option value="">
                        {gameTitlesLoading ? 'Loading games...' : 'Select Game'}
                      </option>
                      {gameTitles.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Account Level</label>
                    <input
                      type="text"
                      value={form.account_level}
                      onChange={(e) => setForm(prev => ({ ...prev, account_level: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                        'text-white placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                      )}
                      placeholder="e.g., Level 50, Master Rank, Diamond"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Account Details</label>
                    <textarea
                      value={form.account_details}
                      onChange={(e) => setForm(prev => ({ ...prev, account_details: e.target.value }))}
                      rows={4}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                        'text-white placeholder-ios-text-secondary',
                        'focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                      )}
                      placeholder="Additional account information, items included, etc."
                    />
                  </div>
                    </div>
                  </div>

                  {/* Column 2: Product Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Product Images</h3>
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

                  {/* Column 3: Settings & Rental Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Settings & Options</h3>
                    
                    {/* Toggle Switches */}
                    <div className="space-y-4">
                      <IOSToggle
                        checked={form.is_active}
                        onChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
                        label="Active Product"
                        description="Uncheck to create as draft"
                      />

                      <IOSToggle
                        checked={form.is_rental}
                        onChange={(checked) => setForm(prev => ({ ...prev, is_rental: checked }))}
                        label="Enable Rental Option"
                        description="Allow customers to rent this account temporarily"
                      />
                    </div>

                    {/* Rental Variations - 4 Rows */}
                    {form.is_rental && (
                      <div className="space-y-3 mt-6">
                        <h4 className="text-sm font-semibold text-white">Rental Variations</h4>
                        
                        {/* Variation 1 */}
                        <div className="p-4 bg-black rounded-xl border border-gray-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-white">Variation 1</h5>
                            <span className="text-xs text-gray-200">Primary</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Duration</label>
                              <input
                                type="number"
                                value={form.rental_duration_hours}
                                onChange={(e) => setForm(prev => ({ ...prev, rental_duration_hours: Number(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-ios-primary focus:border-pink-500"
                                placeholder="1"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Unit</label>
                              <select
                                value={form.rental_unit || 'Hours'}
                                onChange={(e) => setForm(prev => ({ ...prev, rental_unit: e.target.value }))}
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-ios-primary focus:border-pink-500"
                              >
                                <option value="Hours">Hours</option>
                                <option value="Day">Day</option>
                                <option value="Week">Week</option>
                                <option value="Month">Month</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Price</label>
                              <input
                                type="number"
                                value={form.rental_price_per_hour}
                                onChange={(e) => setForm(prev => ({ ...prev, rental_price_per_hour: Number(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-black focus:ring-1 focus:ring-ios-primary focus:border-pink-500"
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Variation 2 */}
                        <div className="p-4 bg-black/50 rounded-xl border border-gray-700/50 space-y-3 opacity-60">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-white">Variation 2</h5>
                            <button className="text-xs text-ios-primary hover:text-ios-primary/80">+ Add</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Duration</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Unit</label>
                              <select
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                              >
                                <option value="">--</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Price</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Variation 3 */}
                        <div className="p-4 bg-black/50 rounded-xl border border-gray-700/50 space-y-3 opacity-60">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-white">Variation 3</h5>
                            <button className="text-xs text-ios-primary hover:text-ios-primary/80">+ Add</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Duration</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Unit</label>
                              <select
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                              >
                                <option value="">--</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Price</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Variation 4 */}
                        <div className="p-4 bg-black/50 rounded-xl border border-gray-700/50 space-y-3 opacity-60">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-white">Variation 4</h5>
                            <button className="text-xs text-ios-primary hover:text-ios-primary/80">+ Add</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Duration</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Unit</label>
                              <select
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                              >
                                <option value="">--</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-white mb-1">Price</label>
                              <input
                                type="number"
                                disabled
                                className="w-full px-2 py-1 text-xs rounded-2xl border border-gray-700 bg-gray-900 text-gray-400"
                                placeholder="--"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-700">
                <IOSButton
                  variant="ghost"
                  onClick={cancelForm}
                  disabled={saving}
                  className="text-gray-200 border-gray-700"
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
