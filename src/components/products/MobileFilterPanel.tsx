/**
 * MobileFilterPanel - Mobile-optimized filter panel component
 * Features touch-optimized controls and native-like animations
 * Now includes proper cancel functionality
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GameTitle, Tier } from '../../types';
import { IOSCard, IOSButton } from '../ios/IOSDesignSystemV2';

// Mobile-first constants
const MOBILE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44,
} as const;

interface FilterState {
  searchTerm: string;
  selectedGame: string;
  selectedTier: string;
  sortBy: string;
  showFilters: boolean;
}

interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onFilterChange: (key: string, value: string | boolean) => void;
  onApplyFilters?: (filters: Partial<FilterState>) => void;
  gameTitles: GameTitle[];
  tiers: Tier[];
}

export const MobileFilterPanel = React.memo(({ 
  isOpen, 
  onClose, 
  filterState, 
  onFilterChange,
  onApplyFilters,
  gameTitles,
  tiers 
}: MobileFilterPanelProps) => {
  // Local state untuk draft changes
  const [localFilters, setLocalFilters] = useState<Partial<FilterState>>({});

  // Sync with external filter state when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        selectedGame: filterState.selectedGame,
        selectedTier: filterState.selectedTier,
        sortBy: filterState.sortBy
      });
    }
  }, [isOpen, filterState]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  const handleLocalChange = (key: keyof FilterState, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Apply all local changes
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        onFilterChange(key, value);
      }
    });
    
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
    
    onClose();
  };

  const handleCancel = () => {
    // Reset local state to original values
    setLocalFilters({
      selectedGame: filterState.selectedGame,
      selectedTier: filterState.selectedTier,
      sortBy: filterState.sortBy
    });
    onClose();
  };

  const handleReset = () => {
    const resetValues = {
      selectedGame: '',
      selectedTier: '',
      sortBy: 'newest'
    };
    setLocalFilters(resetValues);
    
    // Apply reset immediately
    Object.entries(resetValues).forEach(([key, value]) => {
      onFilterChange(key, value);
    });
    
    // Also reset search term
    onFilterChange('searchTerm', '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:bg-black/40"
        onClick={handleCancel}
      />
      <div className="absolute left-0 right-0 bottom-24 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-96" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <IOSCard variant="elevated" padding="lg" className="rounded-t-3xl lg:rounded-2xl max-h-[80vh] lg:max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Filter & Urutkan</h3>
            <IOSButton variant="ghost" size="sm" onClick={handleCancel} className="w-10 h-10 p-0">
              <X size={18} />
            </IOSButton>
          </div>
          
          <div className="space-y-6">
            {/* Game Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Game</label>
              <div className="relative">
                <select
                  value={localFilters.selectedGame || ''}
                  onChange={(e) => handleLocalChange('selectedGame', e.target.value)}
                  className="w-full p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                  style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
                >
                  <option value="">Semua Game</option>
                  {gameTitles.map(game => (
                    <option key={game.slug} value={game.name}>{game.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">▾</span>
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Tier</label>
              <div className="relative">
                <select
                  value={localFilters.selectedTier || ''}
                  onChange={(e) => handleLocalChange('selectedTier', e.target.value)}
                  className="w-full p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                  style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
                >
                  <option value="">Semua Tier</option>
                  {tiers.map(tier => (
                    <option key={tier.slug} value={tier.slug}>{tier.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">▾</span>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Urutkan</label>
              <div className="relative">
                <select
                  value={localFilters.sortBy || 'newest'}
                  onChange={(e) => handleLocalChange('sortBy', e.target.value)}
                  className="w-full p-4 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                  style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">▾</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mt-8">
            {/* Reset Button */}
            <IOSButton
              variant="tertiary"
              size="md"
              fullWidth
              onClick={handleReset}
              className="border border-zinc-600 text-zinc-300"
            >
              Reset Semua Filter
            </IOSButton>
            
            {/* Action Buttons Row */}
            <div className="flex space-x-3">
              <IOSButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={handleCancel}
              >
                Batal
              </IOSButton>
              <IOSButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleApply}
              >
                Terapkan
              </IOSButton>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
});

MobileFilterPanel.displayName = 'MobileFilterPanel';
