import React, { useState } from 'react';
import { IOSButton, IOSCard } from '../../../../components/ios/IOSDesignSystem';
import { Search, Filter, Plus, SortDesc, SortAsc, X } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface ProductsFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  sortBy: 'name' | 'price' | 'created_at';
  onSortByChange: (sortBy: 'name' | 'price' | 'created_at') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onAddProduct?: () => void;
  onClearFilters: () => void;
  className?: string;
  categories?: { id: string; name: string }[]; // dynamic categories
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onAddProduct,
  onClearFilters,
  className = '',
  categories = []
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <IOSCard className={cn(
      'bg-gradient-to-r from-black/80 via-gray-950/80 to-black/80 backdrop-blur-sm border border-pink-500/20',
      className
    )}>
      <div className="p-6 space-y-6">
        {/* Primary Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-600 rounded-2xl',
                'text-white placeholder-gray-400',
                'focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20',
                'transition-all duration-200'
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <IOSButton
              variant="ghost"
              size="small"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 hover:bg-pink-500/20 border border-pink-500/30"
            >
              <Filter className="w-4 h-4" />
              Filters
            </IOSButton>
            
            {onAddProduct && (
              <IOSButton
                variant="primary"
                size="small"
                onClick={onAddProduct}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </IOSButton>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as 'name' | 'price' | 'created_at')}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="created_at">Date Created</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Order</label>
              <div className="flex gap-2">
                <IOSButton
                  variant={sortOrder === 'asc' ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => onSortOrderChange('asc')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <SortAsc className="w-4 h-4" />
                  Asc
                </IOSButton>
                <IOSButton
                  variant={sortOrder === 'desc' ? 'primary' : 'ghost'}
                  size="small"
                  onClick={() => onSortOrderChange('desc')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <SortDesc className="w-4 h-4" />
                  Desc
                </IOSButton>
              </div>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="filter-footer border-t border-white/10 pt-4">
            <div className="left">
              <span className="fs-sm text-secondary">Filters applied</span>
            </div>
            <div className="right">
              <IOSButton
                variant="ghost"
                size="small"
                onClick={onClearFilters}
                className="flex items-center gap-2 hover:bg-red-500/20 border border-red-500/30 text-red-400"
              >
                <X className="w-4 h-4" />
                Clear All
              </IOSButton>
            </div>
          </div>
        )}
      </div>
    </IOSCard>
  );
};

export default ProductsFilters;
