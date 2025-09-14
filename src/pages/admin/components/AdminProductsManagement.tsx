import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Package, AlertCircle, Loader2, RefreshCw, CheckCircle2, XCircle, ChevronDown, Trash2 } from 'lucide-react';
import { adminService, Product } from '../../../services/adminService';
import { ProductService } from '../../../services/productService';
import { useCategories } from '../../../hooks/useCategories';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystemV2';
import { IOSPaginationV2 } from '../../../components/ios/IOSPaginationV2';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import { ProductCrudModal } from './ProductCrudModal';
// Table implementation replaces legacy card & list views
import { ProductsTable } from './products/ProductsTable';
import { Tier, GameTitle } from '../../../types';

interface AdminProductsManagementProps {
  initialProducts?: Product[];
}

export const AdminProductsManagement: React.FC<AdminProductsManagementProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference data for filters
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const { categories: availableCategories } = useCategories();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [gameTitleFilter, setGameTitleFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // default 20 per requirement

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Custom page size dropdown state
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  // Delete confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Toast notifications
  const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'error'; message: string }[]>([]);
  const pushToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts(t => t.filter(to => to.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (!initialProducts) {
      loadProducts();
    } else {
      setLoading(false);
    }
    loadReferenceData();
  }, [initialProducts]);

  // Separate effect for client-side filtering - no need to reload data
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
  const response: any = await adminService.getProducts(1, 200); // Get all products
  const list = response && Array.isArray(response.data) ? response.data : (response?.data ? [response.data] : []);
  setProducts(list);
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

  // Quick inline update (price, stock, is_active etc.)
  const handleQuickUpdate = async (id: string, fields: Partial<Product>) => {
    const prevProduct = products.find(p => p.id === id);
    if (!prevProduct) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p)); // optimistic
    try {
      await (adminService as any).updateProductFields(id, fields);
      pushToast('success', 'Perubahan tersimpan');
    } catch (e) {
      console.error('Failed quick update', e);
      // revert
      setProducts(prev => prev.map(p => p.id === id ? prevProduct : p));
      pushToast('error', 'Gagal menyimpan perubahan');
    }
  };

  const handleSort = () => {
    // Removed sorting logic - table always shows newest first
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
  product.name?.toLowerCase().includes(searchLower) ||
  product.description?.toLowerCase().includes(searchLower) ||
  (product as any).categoryData?.name?.toLowerCase().includes(searchLower)
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
        (product as any).categoryData?.id === categoryFilter ||
        (product as any).categoryData?.slug === categoryFilter ||
        (product as any).categoryData?.name?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply tier filter using proper tier data
    if (tierFilter !== 'all') {
      filtered = filtered.filter(product => {
  const tierSlug = (product as any).tiers?.slug || (product as any).tier_slug;
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

    // Always sort by created_at desc (newest first) - no sorting controls
    filtered.sort((a, b) => {
      const aDate = new Date((a as any).created_at || 0);
      const bDate = new Date((b as any).created_at || 0);
      return bDate.getTime() - aDate.getTime(); // desc order
    });

    // Enrich with categoryData if missing, using availableCategories map
    const enriched = filtered.map(p => {
      const anyP: any = p;
      if (!anyP.categoryData) {
        const catId = anyP.category_id || anyP.categoryId || anyP.category;
        if (catId) {
          const cat = availableCategories.find(c => c.id === catId);
          if (cat) {
            return {
              ...p,
              categoryData: { id: cat.id, name: cat.name || cat.slug, slug: cat.slug }
            } as any;
          }
        }
      }
      return p;
    });
    return enriched;
  }, [products, availableCategories, searchTerm, statusFilter, categoryFilter, tierFilter, gameTitleFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const categories = useMemo(() => {
    const set = new Map<string, { id: string; label: string }>();
    for (const p of products) {
      const cd: any = (p as any).categoryData;
      if (cd?.id) set.set(cd.id, { id: cd.id, label: cd.name || cd.slug });
    }
    for (const c of availableCategories) {
      set.set(c.id, { id: c.id, label: c.name || c.slug });
    }
    return Array.from(set.values());
  }, [products, availableCategories]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTierFilter('all');
    setGameTitleFilter('all');
  };

  return (
    <div className="stack-lg min-h-screen">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 stack-sm w-72">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-sm p-md rounded-xl shadow-lg border backdrop-blur-md animate-fade-in-up fs-sm',
              t.type === 'success'
                ? 'surface-tint-emerald text-primary'
                : 'surface-tint-red text-primary'
            )}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <XCircle className="w-4 h-4 mt-0.5" />}
            <div className="flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
              className="fs-xs opacity-60 hover:opacity-100 transition-soft"
            >Tutup</button>
          </div>
        ))}
      </div>
      {/* Modern Header with Glass Effect (refactored to tokens) */}
  <div className="px-lg py-lg">
        <div className="flex items-center justify-between gap-md flex-wrap">
          <div className="space-y-xs">
            <h1 className="heading-section fs-xl md:fs-2xl">
              Manajemen Produk
            </h1>
            <p className="text-secondary fs-sm mt-xs">{filteredProducts.length} dari {products.length} produk</p>
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            {/* Page Size Selector (custom dropdown for readability) */}
            <div className="relative" onBlur={(e)=>{ if(!e.currentTarget.contains(e.relatedTarget as Node)) setPageSizeOpen(false); }}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={pageSizeOpen}
                onClick={()=>setPageSizeOpen(o=>!o)}
                className={cn(
                  'h-11 w-[110px] text-left rounded-lg border text-sm px-3 pt-4 pb-1 relative',
                  'bg-white/5 border-white/12 hover:bg-white/8 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-soft'
                )}
              >
                <span className="absolute left-3 top-1 text-[10px] font-medium tracking-wide text-secondary/70">Tampil</span>
                <span className="font-medium select-none">{itemsPerPage}</span>
                <ChevronDown className={cn('w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-pink-400/70 transition-transform', pageSizeOpen && 'rotate-180')} />
              </button>
              {pageSizeOpen && (
                <ul
                  role="listbox"
                  tabIndex={-1}
                  className="absolute z-20 mt-1 w-[110px] rounded-md overflow-hidden border border-white/15 shadow-xl backdrop-blur-xl bg-neutral-900/90 text-sm">
                  {[20,50,100].map(size => (
                    <li
                      key={size}
                      role="option"
                      aria-selected={itemsPerPage===size}
                      tabIndex={0}
                      onClick={()=>{ setItemsPerPage(size); setCurrentPage(1); setPageSizeOpen(false); }}
                      onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); setItemsPerPage(size); setCurrentPage(1); setPageSizeOpen(false);} if(e.key==='Escape'){ setPageSizeOpen(false);} }}
                      className={cn(
                        'px-3 py-2 cursor-pointer flex items-center gap-2',
                        'hover:bg-pink-500/15 focus:bg-pink-500/20 outline-none',
                        itemsPerPage===size ? 'text-pink-300 font-semibold bg-pink-500/10' : 'text-primary'
                      )}
                    >
                      {size}
                      {itemsPerPage===size && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <IOSButton 
              onClick={loadProducts} 
              className="flex items-center gap-xs px-md py-sm bg-accent-soft ring-accent/20 hover:bg-accent-soft/70 transition-soft" 
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              <span className="fs-sm md:fs-base">Segarkan</span>
            </IOSButton>
            <IOSButton 
              onClick={handleAddProduct}
              className="flex items-center gap-xs px-md py-sm bg-accent-soft hover:bg-accent-soft/70 border-subtle transition-soft"
            >
              <Plus className="w-4 h-4" />
              <span className="fs-sm md:fs-base">Tambah Produk</span>
            </IOSButton>
          </div>
        </div>
      </div>

      {/* Modern Filters Section */}
      <div className="px-lg">
        <div className="filter-panel">
          <div className="filter-panel-header">
            <span className="filter-title">Filters</span>
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="filter-toggle-badge transition-soft hover:brightness-110"
              aria-expanded={filtersOpen}
              aria-controls="product-filters-panel"
              type="button"
            >{filtersOpen ? 'Sembunyikan' : 'Tampilkan'}</button>
          </div>
          <div
            id="product-filters-panel"
            className={`transition-[max-height] duration-500 ease-in-out ${filtersOpen ? 'max-h-[1400px]' : 'max-h-0'} overflow-hidden`}
          >
            <div className="filter-content">
              {/* Search Row */}
              <div className="input-icon-left">
                <Search className="icon" />
                <input
                  type="text"
                  placeholder="Search products (name, description, category)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control control-h-lg"
                />
              </div>

              {/* Fields Grid */}
              <div className="fields-grid">
                {/* Status */}
                <div className="form-field">
                  <label className="form-label fs-xs text-secondary">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="select-control control-h-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {/* Category */}
                <div className="form-field">
                  <label className="form-label fs-xs text-secondary">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="select-control control-h-lg"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                {/* Tier */}
                <div className="form-field">
                  <label className="form-label fs-xs text-secondary">Tier</label>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="select-control control-h-lg"
                  >
                    <option value="all">All Tiers</option>
                    {(tiers || []).map(tier => (
                      <option key={tier.id} value={tier.slug}>{tier.name}</option>
                    ))}
                  </select>
                </div>
                {/* Game */}
                <div className="form-field">
                  <label className="form-label fs-xs text-secondary">Game</label>
                  <select
                    value={gameTitleFilter}
                    onChange={(e) => setGameTitleFilter(e.target.value)}
                    className="select-control control-h-lg"
                  >
                    <option value="all">All Games</option>
                    {(gameTitles || []).map(gameTitle => (
                      <option key={gameTitle.id} value={gameTitle.slug}>{gameTitle.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer (actions + results) */}
              <div className="filter-footer">
                <div className="left">
                  <div className="chip" aria-hidden="true">{filteredProducts.length} Results</div>
                </div>
                <div className="right">
                  <IOSButton
                    onClick={clearAllFilters}
                    className="chip-clear flex items-center gap-xs px-md py-sm"
                    type="button"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="fs-xs">Clear All</span>
                  </IOSButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Products Display */}
      <div className="px-lg">
        <div className="surface-glass-md rounded-2xl border-subtle shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-xl text-center stack-md">
              <div className="relative inline-block">
                <div className="badge-circle lg surface-tint-pink badge-ring mb-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
                <div className="absolute inset-0 badge-circle lg bg-accent-soft animate-pulse opacity-40"></div>
              </div>
              <p className="heading-section fs-lg">Memuat produk...</p>
              <p className="text-secondary fs-sm">Mengambil data produk dari database</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="p-lg stack-lg">
              <ProductsTable
                products={paginatedProducts as any}
                onView={(p: Product) => navigate(`/products/${p.id}`)}
                onEdit={handleEditProduct}
                onDelete={(p: Product) => setProductToDelete(p)}
                loading={loading}
                onQuickUpdate={(id, fields) => handleQuickUpdate(id, fields as any)}
              />
              <div className="pt-lg">
                <IOSPaginationV2
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p)=>setCurrentPage(p)}
                />
              </div>
            </div>
          ) : (
            <div className="p-xl text-center stack-md">
              <div className="relative inline-block">
                <div className="badge-circle lg surface-tint-pink badge-ring mb-sm">
                  <Package className="w-8 h-8 text-accent" />
                </div>
                <div className="absolute inset-0 badge-circle lg bg-accent-soft animate-pulse opacity-40"></div>
              </div>
              <h3 className="heading-section fs-xl">{products.length === 0 ? 'Tidak Ada Produk' : 'Tidak Ada yang Cocok'}</h3>
              <p className="text-secondary fs-sm layout-narrow mx-auto">
                {products.length === 0 
                  ? 'Mulai dengan menambahkan produk pertama Anda.'
                  : 'Coba ubah filter atau kata kunci pencarian untuk menemukan produk.'}
              </p>
              {products.length === 0 ? (
                <IOSButton
                  onClick={handleAddProduct}
                  className="px-lg py-sm surface-tint-emerald hover:bg-emerald-500/25 transition-soft"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </IOSButton>
              ) : (
                <IOSButton
                  onClick={clearAllFilters}
                  className="px-lg py-sm surface-tint-pink hover:bg-pink-500/25 transition-soft"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset Semua Filter
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>!deleting && setProductToDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl surface-glass-md border border-red-500/30 shadow-2xl p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/15 border border-red-500/40">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Hapus Produk?</h3>
                <p className="text-sm text-gray-300 leading-relaxed">Tindakan ini akan menghapus produk <span className="font-semibold text-white">{productToDelete.name}</span> secara permanen dari sistem. Data tidak dapat dikembalikan.</p>
                <p className="text-xs text-red-300/80">Pastikan tidak ada order aktif yang masih bergantung pada produk ini.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={()=> setProductToDelete(null)}
                className="px-4 h-10 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-gray-200"
              >Batal</button>
              <button
                type="button"
                disabled={deleting}
                onClick={async ()=>{
                  if (!productToDelete) return;
                  setDeleting(true);
                  const ok = await (adminService as any).deleteProduct(productToDelete.id);
                  if (ok) {
                    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
                    pushToast('success', 'Produk berhasil dihapus');
                  } else {
                    pushToast('error', 'Gagal menghapus produk');
                  }
                  setDeleting(false);
                  setProductToDelete(null);
                }}
                className="px-5 h-10 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 text-white shadow-lg shadow-red-900/30"
              >{deleting ? 'Menghapus...' : 'Hapus Permanen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
