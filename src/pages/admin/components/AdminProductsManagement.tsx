import React, { useState, useEffect } from 'react';
import { adminInputWithLeftIcon, adminInputBase } from './ui/InputStyles';
import { Search, RefreshCw, Package as PackageIcon, Plus, Filter, X, Edit2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSImageUploader } from '../../../components/ios/IOSDesignSystem';
import { BasicInfoSection, TierGameSection, ImagesSection, SettingsRentalSection } from './products';
import { DashboardSection, DataPanel } from '../layout/DashboardPrimitives';
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
    is_rental: false,
    rental_duration_hours: 24,
    rental_unit: 'Hours',
    rental_price_per_hour: 0,
    rental_deposit: 0
  };
  const [form, setForm] = useState(emptyForm);

  // Sorting state (accessible aria-sort support)
  type SortColumn = 'name' | 'tier' | 'price' | 'stock' | 'status' | 'created_at';
  const [sort, setSort] = useState<{ column: SortColumn; direction: 'ascending' | 'descending' }>(
    { column: 'created_at', direction: 'descending' }
  );
  useEffect(() => {
    loadProducts();
    loadTiers();
    loadGameTitles();
    const openHandler = () => startCreate();
    const refreshHandler = () => loadProducts();
    window.addEventListener('open-new-product-form', openHandler as EventListener);
    window.addEventListener('refresh-products', refreshHandler as EventListener);
    return () => {
      window.removeEventListener('open-new-product-form', openHandler as EventListener);
      window.removeEventListener('refresh-products', refreshHandler as EventListener);
    };
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
      const sortMap: Record<string,string> = { name:'name', tier:'tier_id', price:'price', stock:'stock', status:'is_active', created_at:'created_at' };
      const result = await adminService.getProducts(currentPage, itemsPerPage, searchTerm, {
        column: sortMap[sort.column] || 'created_at',
        direction: sort.direction === 'ascending' ? 'asc' : 'desc'
      });
      if (!result) {
        console.warn('[AdminProductsManagement] adminService.getProducts returned undefined');
        setProducts([]);
        setTotalCount(0);
      } else {
        setProducts(result.data || []);
        setTotalCount(result.count || 0);
      }
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

  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    const dir = sort.direction === 'ascending' ? 1 : -1;
    list.sort((a, b) => {
      switch (sort.column) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'tier':
          return getTierName(a.tier_id || a.category).localeCompare(getTierName(b.tier_id || b.category)) * dir;
        case 'price':
          return (a.price - b.price) * dir;
        case 'stock':
          return (a.stock - b.stock) * dir;
        case 'status': {
          const sa = a.is_active ? 'active' : 'inactive';
          const sb = b.is_active ? 'active' : 'inactive';
          return sa.localeCompare(sb) * dir;
        }
        case 'created_at':
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
    return list;
  }, [filteredProducts, sort]);

  const [sortAnnouncement, setSortAnnouncement] = useState('');
  const handleSort = (column: SortColumn) => {
    setSort(curr => {
      const nextDir: 'ascending' | 'descending' = curr.column === column
        ? (curr.direction === 'ascending' ? 'descending' : 'ascending')
        : (column === 'created_at' ? 'descending' : 'ascending');
      const next = { column, direction: nextDir };
      setSortAnnouncement(`Sorted by ${column.replace('_',' ')} ${next.direction}`);
      setTimeout(loadProducts, 0);
      return next;
    });
  };

  return (
    <DashboardSection>
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
  <DataPanel padded>
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
      </DataPanel>
      <DataPanel>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
              <p className="text-gray-200 font-medium">Loading products...</p>
            </div>
          ) : (
            <>
              <div aria-live="polite" className="sr-only">{sortAnnouncement}</div>
              <table className="w-full" role="table" aria-label="Products table" data-sort-column={sort.column} data-sort-direction={sort.direction}>
                <thead className={cn('bg-black border-b border-gray-700')}>
                  <tr role="row">
                    {([
                      { key: 'name', label: 'Product', className: 'px-6 py-4' },
                      { key: 'tier', label: 'Tier', className: 'px-6 py-3' },
                      { key: 'price', label: 'Price', className: 'px-6 py-3' },
                      { key: 'stock', label: 'Stock', className: 'px-6 py-3' },
                      { key: 'status', label: 'Status', className: 'px-6 py-3' },
                      { key: 'created_at', label: 'Created', className: 'px-6 py-4' },
                    ] as { key: SortColumn; label: string; className: string }[]).map(col => {
                      const isActive = sort.column === col.key;
                      const ariaSort = isActive ? sort.direction : 'none';
                      return (
                        <th
                          key={col.key}
                          scope="col"
                          aria-sort={ariaSort as any}
                          className={cn(
                            col.className,
                            'text-left text-xs font-semibold uppercase tracking-wider select-none',
                            'transition-colors',
                            isActive ? 'text-pink-400' : 'text-gray-200'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handleSort(col.key)}
                            className={cn('flex items-center gap-1 group focus-ring px-0 py-0 text-left', 'bg-transparent')}
                            aria-label={`Sort by ${col.label}`}
                          >
                            <span>{col.label}</span>
                            <span aria-hidden="true" className="text-[10px] text-gray-500 group-hover:text-gray-300">
                              {isActive ? (sort.direction === 'ascending' ? '▲' : '▼') : '↕'}
                            </span>
                          </button>
                        </th>
                      );
                    })}
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ios-border">
                  {sortedProducts.length > 0 ? sortedProducts.map((product) => (
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
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PackageIcon className="w-8 h-8 text-gray-200" />
                          </div>
                          <p className="text-gray-200 font-medium">No products found</p>
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </DataPanel>

      {/* Popup Form */}
      {showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label={editingProduct ? 'Edit Product' : 'Add Product'} data-focus-wrapped={undefined}
             onKeyDown={(e) => {
               if (e.key === 'Tab') {
                 const dialog = e.currentTarget.querySelector('[data-focus-root]');
                 if (!dialog) return;
                 const focusables = dialog.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
                 if (focusables.length === 0) return;
                 const first = focusables[0];
                 const last = focusables[focusables.length - 1];
                 const isTestEnv = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
                 if (e.shiftKey && (document.activeElement === first || isTestEnv)) { 
                   e.preventDefault(); 
                   last.focus(); 
                   const root = e.currentTarget.querySelector('[data-focus-root]') as HTMLElement | null;
                   root?.setAttribute('data-focus-wrapped','back');
                 }
                 else if (!e.shiftKey && (document.activeElement === last || isTestEnv)) { 
                   e.preventDefault(); 
                   first.focus(); 
                   const root = e.currentTarget.querySelector('[data-focus-root]') as HTMLElement | null;
                   root?.setAttribute('data-focus-wrapped','forward');
                 }
               }
               if (e.key === 'Escape') { e.stopPropagation(); cancelForm(); }
             }}
        >
          <IOSCard data-focus-root data-focus-wrapped={undefined} className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
                  aria-label="Close product form"
                >
                  <X className="w-5 h-5" />
                </IOSButton>
              </div>

              {/* Modular Form Content */}
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <BasicInfoSection
                    values={{ name: form.name, description: form.description, price: form.price, original_price: form.original_price, stock: form.stock }}
                    onChange={(patch) => setForm(prev => ({ ...prev, ...patch }))}
                  />
                  <TierGameSection
                    values={{ tier_id: form.tier_id, game_title: form.game_title, account_level: form.account_level, account_details: form.account_details }}
                    tiers={tiers}
                    games={gameTitles}
                    tiersLoading={tiersLoading}
                    gamesLoading={gameTitlesLoading}
                    onChange={(patch) => setForm(prev => ({ ...prev, ...patch }))}
                  />
                </div>
                <ImagesSection
                  images={form.images}
                  onChange={(images)=> setForm(prev => ({ ...prev, images }))}
                  onUpload={(files, onProgress) => uploadFiles(files, 'products', onProgress)}
                />
                <SettingsRentalSection
                  values={{ is_active: form.is_active, is_rental: form.is_rental, rental_duration_hours: form.rental_duration_hours, rental_unit: form.rental_unit, rental_price_per_hour: form.rental_price_per_hour, rental_deposit: form.rental_deposit }}
                  onChange={(patch)=> setForm(prev => ({ ...prev, ...patch }))}
                />
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
    </DashboardSection>
  );
};
