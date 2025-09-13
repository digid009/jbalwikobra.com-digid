import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { IOSInput, IOSButton } from '../ios/IOSDesignSystemV2';

interface FlashSalesFilters {
  searchQuery: string;
  sortBy: 'discount-desc' | 'price-asc' | 'price-desc' | 'time-asc' | 'name-asc';
  gameFilter: string;
}

interface FlashSalesSearchBarProps {
  filters: FlashSalesFilters;
  onFiltersChange: (filters: FlashSalesFilters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const SORT_OPTIONS = [
  { value: 'discount-desc', label: 'Diskon Tertinggi' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'time-asc', label: 'Berakhir Segera' },
  { value: 'name-asc', label: 'Nama A-Z' }
];

const GAME_CATEGORIES = [
  { value: '', label: 'Semua Game' },
  { value: 'mobile-legends', label: 'Mobile Legends' },
  { value: 'free-fire', label: 'Free Fire' },
  { value: 'pubg-mobile', label: 'PUBG Mobile' },
  { value: 'genshin-impact', label: 'Genshin Impact' }
];

export const FlashSalesSearchBar: React.FC<FlashSalesSearchBarProps> = ({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as FlashSalesFilters['sortBy']
    });
  };

  const handleGameFilterChange = (value: string) => {
    onFiltersChange({ ...filters, gameFilter: value });
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
            placeholder="Cari produk flash sales..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-black/50 border-pink-500/30 text-white placeholder-gray-400 pl-10"
          />
        </div>
        <IOSButton
          variant="secondary"
          onClick={onToggleFilters}
          className="px-4 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </IOSButton>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-black/30 backdrop-blur-sm border border-pink-500/20 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Urutkan
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Filter Game
            </label>
            <select
              value={filters.gameFilter}
              onChange={(e) => handleGameFilterChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {GAME_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
