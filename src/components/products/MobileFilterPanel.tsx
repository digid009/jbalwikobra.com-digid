/**
 * MobileFilterPanel - Mobile-optimized filter panel component
 * Features touch-optimized controls and native-like animations
 * Now includes proper cancel functionality
 */

import React, { useState, useEffect, useRef } from 'react';
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
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  showFilters: boolean;
  rentalOnly: boolean;
}

interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onFilterChange: (key: string, value: string | boolean | number | string[] | null) => void;
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
  const gameSelectRef = useRef<HTMLSelectElement | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState({ harga: false, rental: false, game: false, tier: false, sort: false });
  const sortRef = useRef<HTMLDivElement | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  // Sync with external filter state when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        selectedGame: filterState.selectedGame,
        selectedTier: filterState.selectedTier,
        minPrice: filterState.minPrice ?? null,
        maxPrice: filterState.maxPrice ?? null,
        sortBy: filterState.sortBy,
        rentalOnly: filterState.rentalOnly
      });
      // Autofocus first control
      setTimeout(() => gameSelectRef.current?.focus(), 0);
    }
  }, [isOpen, filterState]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  const handleLocalChange = (key: keyof FilterState, value: string | boolean | number | null) => {
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

  // Close custom sort dropdown when clicking outside
  useEffect(() => {
    if (!sortOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [sortOpen]);

  const handleCancel = () => {
    // Reset local state to original values
    setLocalFilters({
      selectedGame: filterState.selectedGame,
      selectedTier: filterState.selectedTier,
      minPrice: filterState.minPrice ?? null,
      maxPrice: filterState.maxPrice ?? null,
      sortBy: filterState.sortBy,
      rentalOnly: filterState.rentalOnly
    });
    onClose();
  };

  const handleReset = () => {
    const resetValues = {
      selectedGame: '',
      selectedTier: '',
      minPrice: null as number | null,
      maxPrice: null as number | null,
      sortBy: 'newest',
      rentalOnly: false
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
    <div className="fixed inset-0 z-[80]">{/* raised z-index to ensure it overlays bottom nav */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:bg-black/40"
        onClick={handleCancel}
      />
      {/* Drawer container: bottom sheet on mobile, right drawer on desktop */}
      <div
        className="fixed inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] top-[25vh] sm:top-[20vh] lg:top-4 lg:bottom-4 lg:right-4 lg:left-auto lg:w-[420px] xl:w-[480px]"
      >
        <IOSCard variant="elevated" padding="none" className="rounded-t-3xl lg:rounded-2xl h-full overflow-hidden flex flex-col shadow-2xl">
          {/* Header - Enhanced for mobile */}
          <div className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-3 border-b border-white/10 bg-black/90 backdrop-blur-md">
            {/* Drag handle for mobile bottom sheet */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20 lg:hidden" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">Filter & Urutkan</h3>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">Sesuaikan hasil pencarian</p>
              </div>
              <IOSButton 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel} 
                className="w-10 h-10 sm:w-11 sm:h-11 p-2 shrink-0 rounded-full"
                aria-label="Tutup filter"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </IOSButton>
            </div>
          </div>

          {/* Content - Enhanced scrolling and spacing */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Price Range - Enhanced mobile layout */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[56px] hover:bg-white/5 transition-colors"
                onClick={() => setSectionsOpen(s => ({ ...s, harga: !s.harga }))}
              >
                <span className="text-sm sm:text-base font-semibold text-white">Harga</span>
                <span className={`text-sm text-white/60 transition-transform duration-200 ${sectionsOpen.harga ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {sectionsOpen.harga && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-4">Rentang Harga</label>
                  {/* Quick chips - Enhanced for mobile */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    {[
                      {label: '< 100K', min: null, max: 100000},
                      {label: '100K - 500K', min: 100000, max: 500000},
                      {label: '> 500K', min: 500000, max: null},
                    ].map((r) => {
                      const active = (localFilters.minPrice ?? null) === (r.min ?? null) && (localFilters.maxPrice ?? null) === (r.max ?? null);
                      return (
                        <button
                          key={r.label}
                          onClick={() => setLocalFilters(prev => ({ ...prev, minPrice: r.min, maxPrice: r.max }))}
                          className={`h-11 sm:h-12 px-4 sm:px-5 rounded-xl text-sm font-semibold border transition-all duration-200 ${active ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-500/25' : 'bg-zinc-900/60 text-zinc-200 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'}`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Harga minimum"
                        value={localFilters.minPrice ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value === '' ? null : Number(e.target.value) }))}
                        className="w-full h-12 sm:h-14 px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Harga maksimum"
                        value={localFilters.maxPrice ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value === '' ? null : Number(e.target.value) }))}
                        className="w-full h-12 sm:h-14 px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Rental Filter - Enhanced layout */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[56px] hover:bg-white/5 transition-colors"
                onClick={() => setSectionsOpen(s => ({ ...s, rental: !s.rental }))}
              >
                <span className="text-sm sm:text-base font-semibold text-white">Rental</span>
                <span className={`text-sm text-white/60 transition-transform duration-200 ${sectionsOpen.rental ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {sectionsOpen.rental && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-4">Opsi Rental</label>
                  <label className="flex items-center gap-4 min-h-[52px] px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white cursor-pointer select-none hover:bg-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(localFilters.rentalOnly)}
                      onChange={(e) => handleLocalChange('rentalOnly', e.target.checked)}
                      className="h-5 w-5 accent-pink-500 rounded"
                    />
                    <span className="text-sm font-medium">Hanya tampilkan produk dengan opsi rental</span>
                  </label>
                </div>
              )}
            </div>
            {/* Game Filter (single-select) - Enhanced layout */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[56px] hover:bg-white/5 transition-colors"
                onClick={() => setSectionsOpen(s => ({ ...s, game: !s.game }))}
              >
                <span className="text-sm sm:text-base font-semibold text-white">Game</span>
                <span className={`text-sm text-white/60 transition-transform duration-200 ${sectionsOpen.game ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {sectionsOpen.game && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-zinc-300">Game</label>
                    {localFilters.selectedGame && (
                      <button 
                        className="text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors" 
                        onClick={() => handleLocalChange('selectedGame', '')}
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 max-h-64 overflow-auto pr-2 -mr-2">
                    <label className="flex items-center gap-4 min-h-[52px] px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white cursor-pointer select-none hover:bg-zinc-800 transition-colors">
                      <input
                        type="radio"
                        name="game-select"
                        checked={!localFilters.selectedGame}
                        onChange={() => handleLocalChange('selectedGame', '')}
                        className="h-5 w-5 accent-pink-500"
                      />
                      <span className="text-sm font-medium">Semua Game</span>
                    </label>
                    {gameTitles.map(game => (
                      <label 
                        key={game.slug} 
                        className="flex items-center gap-4 min-h-[52px] px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white cursor-pointer select-none hover:bg-zinc-800 transition-colors"
                      >
                        <input
                          type="radio"
                          name="game-select"
                          checked={localFilters.selectedGame === game.name}
                          onChange={() => handleLocalChange('selectedGame', game.name)}
                          className="h-5 w-5 accent-pink-500"
                        />
                        <span className="text-sm font-medium">{game.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tier Filter (single-select) - Enhanced layout */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[56px] hover:bg-white/5 transition-colors"
                onClick={() => setSectionsOpen(s => ({ ...s, tier: !s.tier }))}
              >
                <span className="text-sm sm:text-base font-semibold text-white">Tier</span>
                <span className={`text-sm text-white/60 transition-transform duration-200 ${sectionsOpen.tier ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {sectionsOpen.tier && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-zinc-300">Tier</label>
                    {localFilters.selectedTier && (
                      <button 
                        className="text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors" 
                        onClick={() => handleLocalChange('selectedTier', '')}
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 max-h-52 overflow-auto pr-2 -mr-2">
                    <label className="flex items-center gap-4 min-h-[52px] px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white cursor-pointer select-none hover:bg-zinc-800 transition-colors">
                      <input
                        type="radio"
                        name="tier-select"
                        checked={!localFilters.selectedTier}
                        onChange={() => handleLocalChange('selectedTier', '')}
                        className="h-5 w-5 accent-pink-500"
                      />
                      <span className="text-sm font-medium">Semua Tier</span>
                    </label>
                    {tiers
                      .filter(tier => tier.isActive)
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .map(tier => (
                        <label 
                          key={tier.slug} 
                          className="flex items-center gap-4 min-h-[52px] px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white cursor-pointer select-none hover:bg-zinc-800 transition-colors"
                        >
                          <input
                            type="radio"
                            name="tier-select"
                            checked={localFilters.selectedTier === tier.slug}
                            onChange={() => handleLocalChange('selectedTier', tier.slug)}
                            className="h-5 w-5 accent-pink-500"
                          />
                          <span className="text-sm font-medium">{tier.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Options - Enhanced layout */}
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[56px] hover:bg-white/5 transition-colors"
                onClick={() => setSectionsOpen(s => ({ ...s, sort: !s.sort }))}
              >
                <span className="text-sm sm:text-base font-semibold text-white">Urutkan</span>
                <span className={`text-sm text-white/60 transition-transform duration-200 ${sectionsOpen.sort ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {sectionsOpen.sort && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-4">Urutan</label>
                  {/* Custom dark dropdown to ensure readable options */}
                  <div ref={sortRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setSortOpen(o => !o)}
                      className="w-full h-12 sm:h-14 px-4 py-3 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white text-left flex items-center justify-between hover:bg-zinc-800 hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      aria-haspopup="listbox"
                      aria-expanded={sortOpen}
                    >
                      <span className="truncate text-sm font-medium">
                        {sortOptions.find(o => o.value === (localFilters.sortBy || 'newest'))?.label || 'Terbaru'}
                      </span>
                      <span className={`ml-3 text-zinc-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {sortOpen && (
                      <ul
                        role="listbox"
                        className="absolute z-30 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
                      >
                        {sortOptions.map(opt => {
                          const active = (localFilters.sortBy || 'newest') === opt.value;
                          return (
                            <li
                              key={opt.value}
                              role="option"
                              aria-selected={active}
                              onClick={() => { handleLocalChange('sortBy', opt.value); setSortOpen(false); }}
                              className={`px-4 py-3 text-sm font-medium cursor-pointer select-none transition-colors ${active ? 'bg-pink-600/20 text-white border-l-2 border-pink-500' : 'text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              {opt.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Action Bar - Enhanced mobile-first design */}
          <div className="sticky bottom-0 z-10 px-4 sm:px-6 py-4 sm:py-6 border-t border-white/10 bg-black/95 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:gap-4">
              <IOSButton
                variant="tertiary"
                size="md"
                fullWidth
                onClick={handleReset}
                className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 min-h-[48px] sm:min-h-[52px] font-medium"
              >
                Reset Semua Filter
              </IOSButton>
              <div className="flex gap-3 sm:gap-4">
                <IOSButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={handleCancel}
                  className="min-h-[48px] sm:min-h-[52px] font-medium"
                >
                  Batal
                </IOSButton>
                <IOSButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleApply}
                  className="min-h-[48px] sm:min-h-[52px] font-semibold"
                >
                  Terapkan Filter
                </IOSButton>
              </div>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
});

MobileFilterPanel.displayName = 'MobileFilterPanel';
