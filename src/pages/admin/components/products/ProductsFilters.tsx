import React from 'react';
import { Search, Filter, SortAsc, SortDesc, Package, Archive, Eye, AlertCircle } from 'lucide-react';
import { IOSCard, IOSButton } from '../../../../components/ios/IOSDesignSystemV2';
import { cn } from '../../../../utils/cn';
import { adminInputBase, adminSelectBase } from '../ui/InputStyles';
import { t } from '../../../../i18n/strings';

// Use centralized InputStyles for consistency across admin

export interface ProductFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'archived' | 'draft';
  categoryFilter: string;
  priceRangeFilter: 'all' | 'under-50k' | '50k-100k' | '100k-500k' | 'over-500k';
  stockFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy: 'name' | 'price' | 'stock' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: { id: string; name: string; }[];
  totalProducts: number;
  filteredProducts: number;
  loading?: boolean;
}

const ProductsFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  totalProducts,
  filteredProducts,
  loading = false
}) => {
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      statusFilter: 'all',
      categoryFilter: '',
      priceRangeFilter: 'all',
      stockFilter: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.statusFilter !== 'all' || 
    filters.categoryFilter || 
    filters.priceRangeFilter !== 'all' || 
    filters.stockFilter !== 'all';

  return (
    <IOSCard className="bg-surface-glass-light border border-surface-tint-light">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-ds-pink" />
            <h3 className="text-lg font-semibold text-ds-text">Filter Produk</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ds-text-secondary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-ds-text-tertiary rounded-full animate-pulse" />
                  Memuat...
                </span>
              ) : (
                `${filteredProducts} dari ${totalProducts} produk`
              )}
            </span>
            {hasActiveFilters && (
              <IOSButton
                onClick={clearFilters}
                variant="secondary"
                size="sm"
                className="text-ds-text-secondary hover:text-ds-text"
              >
                Reset Filter
              </IOSButton>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ds-text-tertiary" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama, SKU, atau deskripsi..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className={cn(adminInputBase, "pl-12")}
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-2">
              Status
            </label>
            <select
              value={filters.statusFilter}
              onChange={(e) => updateFilter('statusFilter', e.target.value)}
              className={adminSelectBase}
            >
              <option value="all">Semua Status</option>
              <option value="active">
                <Eye className="w-4 h-4 inline mr-2" />
                Aktif
              </option>
              <option value="draft">
                <Package className="w-4 h-4 inline mr-2" />
                Draft
              </option>
              <option value="archived">
                <Archive className="w-4 h-4 inline mr-2" />
                Diarsipkan
              </option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-2">
              Kategori
            </label>
            <select
              value={filters.categoryFilter}
              onChange={(e) => updateFilter('categoryFilter', e.target.value)}
              className={adminSelectBase}
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-2">
              Range Harga
            </label>
            <select
              value={filters.priceRangeFilter}
              onChange={(e) => updateFilter('priceRangeFilter', e.target.value)}
              className={adminSelectBase}
            >
              <option value="all">Semua Harga</option>
              <option value="under-50k">Di bawah Rp 50.000</option>
              <option value="50k-100k">Rp 50.000 - 100.000</option>
              <option value="100k-500k">Rp 100.000 - 500.000</option>
              <option value="over-500k">Di atas Rp 500.000</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-ds-text-secondary mb-2">
              Status Stok
            </label>
            <select
              value={filters.stockFilter}
              onChange={(e) => updateFilter('stockFilter', e.target.value)}
              className={adminSelectBase}
            >
              <option value="all">Semua Stok</option>
              <option value="in-stock">Tersedia</option>
              <option value="low-stock">Stok Menipis</option>
              <option value="out-of-stock">Habis</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 pt-4 border-t border-surface-tint-light">
          <span className="text-sm font-medium text-ds-text-secondary">Urutkan:</span>
          
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className={cn(adminSelectBase, "flex-1 max-w-xs")}
          >
            <option value="created_at">Tanggal Dibuat</option>
            <option value="updated_at">Terakhir Diupdate</option>
            <option value="name">Nama Produk</option>
            <option value="price">Harga</option>
            <option value="stock">Jumlah Stok</option>
          </select>

          <IOSButton
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            {filters.sortOrder === 'asc' ? (
              <>
                <SortAsc className="w-4 h-4" />
                A-Z
              </>
            ) : (
              <>
                <SortDesc className="w-4 h-4" />
                Z-A
              </>
            )}
          </IOSButton>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-ds-pink/10 border border-ds-pink/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-ds-pink mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Filter Aktif</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                  Pencarian: "{filters.searchTerm}"
                  <button onClick={() => updateFilter('searchTerm', '')}>×</button>
                </span>
              )}
              {filters.statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                  Status: {filters.statusFilter}
                  <button onClick={() => updateFilter('statusFilter', 'all')}>×</button>
                </span>
              )}
              {filters.categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                  Kategori: {categories.find(c => c.id === filters.categoryFilter)?.name}
                  <button onClick={() => updateFilter('categoryFilter', '')}>×</button>
                </span>
              )}
              {filters.priceRangeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                  Harga: {filters.priceRangeFilter}
                  <button onClick={() => updateFilter('priceRangeFilter', 'all')}>×</button>
                </span>
              )}
              {filters.stockFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                  Stok: {filters.stockFilter}
                  <button onClick={() => updateFilter('stockFilter', 'all')}>×</button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </IOSCard>
  );
};

export default ProductsFilters;
