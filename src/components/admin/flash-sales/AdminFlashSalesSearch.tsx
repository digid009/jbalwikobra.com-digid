import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { IOSInput, IOSButton } from '../../ios/IOSDesignSystemV2';

interface AdminFlashSalesFilters {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'scheduled' | 'expired' | 'inactive';
  sortBy: 'created_desc' | 'end_time_asc' | 'discount_desc' | 'name_asc';
}

interface AdminFlashSalesSearchProps {
  filters: AdminFlashSalesFilters;
  onFiltersChange: (filters: AdminFlashSalesFilters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'expired', label: 'Berakhir' },
  { value: 'inactive', label: 'Tidak Aktif' }
];

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Terbaru' },
  { value: 'end_time_asc', label: 'Berakhir Segera' },
  { value: 'discount_desc', label: 'Diskon Tertinggi' },
  { value: 'name_asc', label: 'Nama A-Z' }
];

export const AdminFlashSalesSearch: React.FC<AdminFlashSalesSearchProps> = ({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      statusFilter: value as AdminFlashSalesFilters['statusFilter']
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as AdminFlashSalesFilters['sortBy']
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <IOSInput
            type="text"
            placeholder="Cari flash sales berdasarkan nama produk..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-black/50 border-gray-600 text-white placeholder-gray-400 pl-10"
          />
        </div>
        <IOSButton
          variant="secondary"
          onClick={onToggleFilters}
          className="px-4"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </IOSButton>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-black/20 backdrop-blur-sm border border-gray-700 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              value={filters.statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Urutkan
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
