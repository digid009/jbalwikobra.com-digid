import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Product, Tier, GameTitle } from '../../types';
import { ProductService } from '../../services/productService';
import { OptimizedProductService } from '../../services/optimizedProductService';
import { supabase } from '../../services/supabase';
import { uploadFiles } from '../../services/storageService';
import { formatNumberID, parseNumberID } from '../../utils/helpers';
import { useToast } from '../../components/Toast';
import { t } from '../../i18n/strings';
import { scrollToPaginationContent } from '../../utils/scrollUtils';
// Removed AdminLayout import as we now use reusable components directly
import { ProductForm } from './components/products';
import { 
  AdminPageHeaderV2, 
  AdminStatCard, 
  AdminFilters, 
  StatusBadge 
} from './components/ui';
import { AdminDSTable, type DSTableColumn, type DSTableAction } from './components/ui/AdminDSTable';
import type { AdminFiltersConfig } from './components/ui';
import { RefreshCw, Plus, Package, Archive, ShoppingCart, DollarSign, Eye, Edit, Trash2, RotateCcw } from 'lucide-react';

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category?: string;
  gameTitleId?: string;
  tierId?: string;
  images: string[];
  rentals: { id?: string; duration: string; price: number; description?: string }[];
};

const emptyForm: FormState = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  category: 'general',
  gameTitleId: '',
  tierId: '',
  images: [],
  rentals: [],
};

const AdminProducts: React.FC = () => {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [games, setGames] = useState<GameTitle[]>([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Filter state using our reusable pattern
  const [filterValues, setFilterValues] = useState({
    searchTerm: '',
    gameTitle: '',
    tier: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // UI state for toggles
  // Removed showFilters and showStats as we now always show them in the new design

  // Filter configuration for our AdminFilters component
  const filtersConfig: AdminFiltersConfig = {
    searchPlaceholder: 'Search products by name or description...',
    filters: [
      {
        key: 'gameTitle',
        label: 'Game Title',
        options: [
          { value: '', label: 'All Games' },
          ...games.map(game => ({ value: game.id, label: game.name }))
        ]
      },
      {
        key: 'tier',
        label: 'Tier',
        options: [
          { value: '', label: 'All Tiers' },
          ...tiers.map(tier => ({ value: tier.id, label: tier.name }))
        ]
      },
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' }
        ]
      }
    ],
    sortOptions: [
      { value: 'created_at', label: 'Date Created' },
      { value: 'name', label: 'Product Name' },
      { value: 'price', label: 'Price' }
    ],
    showSortOrder: true
  };

  // Handle page change with scroll
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToPaginationContent();
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filterValues.searchTerm), 500);
    return () => clearTimeout(timer);
  }, [filterValues.searchTerm]);

  // Products are already filtered/paginated by database
  const filteredProducts = products;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, filterValues.gameTitle, filterValues.tier, filterValues.status, itemsPerPage]);

  // Optimized data loading with database-level filtering and pagination
  const loadProducts = useCallback(async () => {
    try {
      console.log('🔄 Loading products with filters:', { 
        status: filterValues.status, 
        gameTitle: filterValues.gameTitle, 
        tier: filterValues.tier, 
        currentPage, 
        debouncedSearch 
      });
      setLoading(true);
      setHasErrors(false);
      setErrorMessage('');
      
      if (!supabase) {
        // Fallback: Use OptimizedProductService
        const [paginatedResponse, tList, gList] = await Promise.all([
          OptimizedProductService.getProductsPaginated(
            { includeArchived: true },
            { limit: 1000 }
          ),
          ProductService.getTiers(),
          ProductService.getGameTitles()
        ]);
        setProducts(paginatedResponse.data);
        setTiers(tList);
        setGames(gList);
        setTotalProducts(paginatedResponse.data.length);
        setLoading(false);
        return;
      }

      // Build query with database-level filtering
    let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price,
      is_active, archived_at, created_at, images, game_title_id, tier_id, category_id,
      tiers (id, name, slug, color, background_gradient),
      game_titles (id, name, slug, icon),
      categories (id, name, slug)
        `, { count: 'exact' });

      // Apply filters at DATABASE level
      if (filterValues.status === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (filterValues.status === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      if (debouncedSearch.trim()) {
        query = query.or(`name.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%`);
      }

      if (filterValues.gameTitle !== 'all' && filterValues.gameTitle) {
        query = query.eq('game_title_id', filterValues.gameTitle);
      }

      if (filterValues.tier !== 'all' && filterValues.tier) {
        query = query.eq('tier_id', filterValues.tier);
      }

      // Database-level pagination
      const offset = (currentPage - 1) * itemsPerPage;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      const { data: productData, error: productError, count } = await query;

      if (productError) throw productError;

      // Load filter options separately
      const [tList, gList] = await Promise.all([
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);

      // Map data to existing format
      const mappedProducts: Product[] = (productData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.original_price,
        image: product.images?.[0] || '',
        images: product.images || [],
        categoryId: (product as any).category_id || (product as any).categoryId || undefined,
        tierId: product.tier_id,
        gameTitleId: product.game_title_id,
        tierData: product.tiers?.[0] as any,
        gameTitleData: product.game_titles?.[0] as any,
        // Enrich category for rendering
        // Note: Supabase relational select may return object or array depending on FK; handle both
        ...(product as any).categories ? { categoryData: Array.isArray((product as any).categories) ? (product as any).categories[0] : (product as any).categories } : {},
        isFlashSale: false,
        hasRental: false,
        stock: 1,
        isActive: product.is_active !== false,
        archivedAt: product.archived_at,
        createdAt: product.created_at,
        updatedAt: product.created_at,
        rentalOptions: []
      }));

      setProducts(mappedProducts);
      setTiers(tList);
      setGames(gList);
      setTotalProducts(count || 0);
      
      console.log('✅ Products loaded successfully:', { 
        count: mappedProducts.length, 
        total: count, 
        firstProduct: mappedProducts[0]?.name,
      });
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      setHasErrors(true);
      setErrorMessage(error.message || 'Unknown error occurred');
      push(`Error loading products: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, filterValues.gameTitle, filterValues.tier, filterValues.status, push]);

  // Load data on mount and filter changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle filter changes
  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues({
      searchTerm: filters.searchTerm || '',
      gameTitle: filters.gameTitle || '',
      tier: filters.tier || '',
      status: filters.status || 'all',
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'desc'
    });
  };

  // Calculate statistics for AdminStatCard
  const stats = {
    total: products.length,
    active: products.filter(p => (p as any).isActive !== false && !(p as any).archivedAt).length,
    archived: products.filter(p => (p as any).isActive === false || (p as any).archivedAt).length,
    totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length : 0
  };

  // Table columns configuration
  const columns: DSTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Produk',
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center space-x-3">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-medium text-ds-text">{product.name}</div>
            <div className="text-sm text-ds-text-secondary truncate max-w-[200px]">
              {product.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
  header: 'Harga',
      sortable: true,
      render: (value, product) => (
        <div className="text-right">
          <div className="font-semibold text-ds-text">
            Rp {product.price?.toLocaleString('id-ID') || '0'}
          </div>
          {product.originalPrice && product.originalPrice > (product.price || 0) && (
            <div className="text-sm text-ds-text-secondary line-through">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'gameTitleData',
      header: 'Game',
      sortable: false,
      render: (value, product) => (
        product.gameTitleData?.name ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {product.gameTitleData.name}
          </span>
        ) : (
          <span className="text-ds-text-tertiary text-sm">No game</span>
        )
      )
    },
    {
      key: 'categoryData',
      header: 'Kategori',
      sortable: false,
      render: (value, product) => (
        (product as any).categoryData?.name ? (
          <span className="text-sm text-ds-text-secondary">{(product as any).categoryData.name}</span>
        ) : (
          <span className="text-ds-text-tertiary text-sm">Tidak ada</span>
        )
      )
    },
    {
      key: 'tierData',
    header: 'Tier',
      sortable: false,
      render: (value, product) => (
        product.tierData?.name ? (
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: product.tierData.color + '20',
              color: product.tierData.color
            }}
          >
            {product.tierData.name}
          </span>
        ) : (
          <span className="text-ds-text-tertiary text-sm">No tier</span>
        )
      )
    },
    {
      key: 'isActive',
  header: 'Status',
      sortable: true,
      render: (value, product) => {
        const isArchived = !!(product as any).archivedAt;
        const isActive = (product as any).isActive !== false;
        
        if (isArchived) {
          return <StatusBadge status="archived" customLabel="Archived" />;
        } else if (isActive) {
          return <StatusBadge status="active" customLabel="Active" />;
        } else {
          return <StatusBadge status="inactive" customLabel="Inactive" />;
        }
      }
    },
    {
      key: 'createdAt',
  header: 'Tanggal Posting',
      sortable: true,
      render: (value, product) => (
        <div className="text-sm text-ds-text-secondary">
          {new Date(product.createdAt || '').toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    }
  ];

  // Table actions
  const actions: DSTableAction<Product>[] = [
    {
    key: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (product) => {
        push(`Viewing product: ${product.name}`, 'info');
      },
      variant: 'primary'
    },
    {
    key: 'edit',
      label: 'Edit Product',
      icon: Edit,
      onClick: (product) => {
        startEdit(product);
      },
      variant: 'primary'
    },
    {
    key: 'archive',
      label: 'Archive',
    icon: Archive,
      onClick: (product) => {
        handleArchive(product);
      },
      variant: 'danger',
      disabled: (product) => !!(product as any).archivedAt
    },
    {
    key: 'restore',
      label: 'Restore',
    icon: RotateCcw,
      onClick: (product) => {
        handleRestore(product);
      },
      variant: 'primary',
      disabled: (product) => !(product as any).archivedAt
    }
  ];

  const startEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price || 0,
      originalPrice: product.originalPrice,
      category: product.categoryId,
      gameTitleId: product.gameTitleId,
      tierId: product.tierId,
      images: product.images || [],
      rentals: product.rentalOptions || [],
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.price <= 0) {
      push('Nama produk dan harga harus diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        originalPrice: form.originalPrice,
        categoryId: form.category || 'general',
        gameTitleId: form.gameTitleId || null,
        tierId: form.tierId || null,
        images: form.images,
        rentalOptions: form.rentals || [],
      };

      let saved: Product | null = null;
      const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const canUpdate = form.id && isUuid(form.id);

      if (canUpdate) {
        saved = await ProductService.updateProduct(form.id!, payload as any);
      } else {
        if (form.id && !isUuid(form.id)) {
          push('Produk contoh tidak bisa diubah, membuat salinan baru...', 'info');
        }
        saved = await ProductService.createProduct(payload as any);
      }

      if (saved) {
        // Save rentals if provided
        if (form.rentals?.length && supabase) {
          try {
            const productId = saved.id;
            if (canUpdate) {
              const { error: deleteError } = await supabase.from('rental_options').delete().eq('product_id', productId);
              if (deleteError) {
                console.warn('Failed to delete existing rentals:', deleteError);
              }
            }
            
            const validRentals = form.rentals.filter(r => r.duration?.trim() && r.price > 0);
            if (validRentals.length > 0) {
              const inserts = validRentals.map(r => ({
                product_id: productId,
                duration: r.duration.trim(),
                price: Number(r.price) || 0,
                description: r.description?.trim() || null
              }));

              const { error: rentalError } = await supabase.from('rental_options').insert(inserts);
              if (rentalError) {
                push('Produk disimpan, tetapi gagal menyimpan opsi rental', 'info');
              }
            }
          } catch (rentalErr) {
            push('Produk disimpan, tetapi gagal memproses opsi rental', 'info');
          }
        }
        await loadProducts();
        setShowForm(false);
        setForm(emptyForm);
        console.log('✅ Product saved, data reloaded');
        push('Produk disimpan', 'success');
      } else {
        push('Gagal menyimpan produk', 'error');
      }
    } catch (e: any) {
      push(`Error: ${e?.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Hapus produk ini?')) return;
    const allImages = product.images && product.images.length ? product.images : (product.image ? [product.image] : []);
    const ok = await ProductService.deleteProduct(product.id, { images: allImages });
    if (ok) {
      await loadProducts();
      push('Produk dihapus', 'success');
    } else {
      push('Gagal menghapus produk', 'error');
    }
  };

  const handleArchive = async (product: Product) => {
    if (!confirm('Arsipkan produk ini?')) return;
    if (!supabase) return;
    
    try {
      await supabase.from('products').update({ 
        is_active: false, 
        archived_at: new Date().toISOString() 
      }).eq('id', product.id);
      await loadProducts();
      push('Produk diarsipkan', 'success');
    } catch (e: any) {
      push(`Gagal mengarsipkan produk: ${e.message}`, 'error');
    }
  };

  const handleRestore = async (product: Product) => {
    if (!supabase) return;
    
    try {
      await supabase.from('products').update({ 
        is_active: true, 
        archived_at: null 
      }).eq('id', product.id);
      await loadProducts();
      push('Produk dipulihkan dari arsip', 'success');
    } catch (e: any) {
      push(`Gagal memulihkan produk: ${e.message}`, 'error');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Force reloading products...');
    loadProducts();
  };

  return (
    <div className="space-y-6">
  {/* Diagnostics banner removed as part of DS migration */}

      {/* Page Header */}
      <AdminPageHeaderV2
        title={t('common.productsManagement')}
        subtitle={t('common.manageCatalog')}
        icon={Package}
        actions={[
          {
            key: 'refresh',
            label: 'Refresh',
            onClick: handleRefresh,
            variant: 'secondary',
            icon: RefreshCw,
            loading: loading
          },
          {
            key: 'add',
            label: 'Add Product',
            onClick: () => setShowForm(true),
            variant: 'primary',
            icon: Plus
          }
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
          loading={loading}
        />
        <AdminStatCard
          title="Active Products"
          value={stats.active}
          icon={ShoppingCart}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
          loading={loading}
        />
        <AdminStatCard
          title="Archived Products"
          value={stats.archived}
          icon={Archive}
          iconColor="text-yellow-400"
          iconBgColor="bg-yellow-500/20"
          loading={loading}
        />
        <AdminStatCard
          title="Average Price"
          value={`Rp ${stats.averagePrice.toLocaleString('id-ID')}`}
          icon={DollarSign}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-500/20"
          subtitle={`Total Value: Rp ${stats.totalValue.toLocaleString('id-ID')}`}
          loading={loading}
        />
      </div>

      {/* Filters */}
      <AdminFilters
        config={filtersConfig}
        values={filterValues}
        onFiltersChange={handleFilterChange}
        totalItems={totalProducts}
        filteredItems={filteredProducts.length}
  loading={loading}
  defaultCollapsed={true}
      />

      {/* Products Table */}
      <AdminDSTable
        data={filteredProducts}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No products found"
        currentPage={currentPage}
        pageSize={itemsPerPage}
        totalItems={totalProducts}
        onPageChange={handlePageChange}
        footerStart={(
          <div className="flex items-center gap-2">
            <select
              className="input input-sm"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[20, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
        statusTextRenderer={({ total, pageSize }) => (
          <>Melihat {Math.min(pageSize, total)} / {total}</>
        )}
        previousLabel="Sebelumnya"
        nextLabel="Sesudah"
        pageLabel={({ currentPage, totalPages }) => (
          <>Halaman {currentPage} dari {totalPages}</>
        )}
      />

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              form={form}
              games={games}
              tiers={tiers}
              saving={saving}
              onFormChange={setForm}
              onSave={handleSave}
              onCancel={cancelForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
