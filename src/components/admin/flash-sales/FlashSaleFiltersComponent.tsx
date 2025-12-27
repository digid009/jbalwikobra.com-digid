import React from 'react';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { FlashSaleFilters } from '../../../types/flashSales';

interface FlashSaleFiltersComponentProps {
  filters: FlashSaleFilters;
  onFiltersChange: (filters: FlashSaleFilters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  resultCount?: number;
}

export const FlashSaleFiltersComponent: React.FC<FlashSaleFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  resultCount
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleFilterChange = (key: keyof FlashSaleFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      statusFilter: 'all',
      discountFilter: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.statusFilter !== 'all' || 
    filters.discountFilter !== 'all' ||
    filters.sortBy !== 'created_at' ||
    filters.sortOrder !== 'desc';

  const toggleSortOrder = () => {
    onFiltersChange({ 
      ...filters, 
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="bg-black border border-gray-800 rounded-2xl p-6 space-y-6">
      {/* Search Bar and Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search flash sales, products, or descriptions..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
          />
          {filters.searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              showFilters
                ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                {[
                  filters.searchTerm && 'search',
                  filters.statusFilter !== 'all' && 'status',
                  filters.discountFilter !== 'all' && 'discount'
                ].filter(Boolean).length}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 border border-gray-700 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Discount Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Discount Range
              </label>
              <select
                value={filters.discountFilter}
                onChange={(e) => handleFilterChange('discountFilter', e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              >
                <option value="all">All Discounts</option>
                <option value="low">1% - 25%</option>
                <option value="medium">26% - 50%</option>
                <option value="high">51% - 75%</option>
                <option value="super">76%+ Off</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              >
                <option value="created_at">Date Created</option>
                <option value="start_time">Start Time</option>
                <option value="end_time">End Time</option>
                <option value="discount_percentage">Discount Percentage</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Order
              </label>
              <button
                onClick={toggleSortOrder}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 border border-gray-700 transition-all duration-200"
              >
                {filters.sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="w-4 h-4" />
                    A-Z / Oldest First
                  </>
                ) : (
                  <>
                    <SortDesc className="w-4 h-4" />
                    Z-A / Newest First
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Count */}
          {typeof resultCount === 'number' && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {resultCount === 0 ? (
                  'No flash sales match the current filters'
                ) : (
                  `Found ${resultCount} flash sales`
                )}
              </div>
              
              {/* Quick Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {filters.searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">
                    Search: "{filters.searchTerm}"
                    <button onClick={() => handleSearchChange('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    Status: {filters.statusFilter}
                    <button onClick={() => handleFilterChange('statusFilter', 'all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.discountFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                    Discount: {filters.discountFilter}
                    <button onClick={() => handleFilterChange('discountFilter', 'all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
