import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { SortSelect, ActiveFilterChips } from '../products';
import { Tier, GameTitle } from '../../types';
import { IOSButton } from '../ios/IOSDesignSystemV2';
import { useCategories } from '../../hooks/useCategories';

interface PNCatalogToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  activeFilters: Array<{ key: string; label: string; value: string }>;
  onRemoveFilter: (k: string) => void;
  onClearAllFilters: () => void;
  rentalOnly: boolean;
  onToggleRental: () => void;
  tiers?: Tier[];
  selectedTier?: string;
  onTierChange?: (slug: string) => void;
  gameTitles?: GameTitle[];
  selectedGame?: string;
  onGameChange?: (name: string) => void;
  // Categories props
  selectedCategory?: string;
  onCategoryChange?: (name: string) => void;
}

const PNCatalogToolbar: React.FC<PNCatalogToolbarProps> = ({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  rentalOnly,
  onToggleRental,
  tiers,
  selectedTier,
  onTierChange,
  gameTitles,
  selectedGame,
  onGameChange,
  selectedCategory,
  onCategoryChange,
}) => {
  // Debounced search input UX
  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => setLocalSearch(search), [search]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(t);
  }, [localSearch]);

  const [gameDropdownOpen, setGameDropdownOpen] = useState(false);

  // Categories data
  const { categories, loading: categoriesLoading } = useCategories();

  // Close games dropdown when clicking outside
  useEffect(() => {
    if (!gameDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-dropdown="games"]')) {
        setGameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [gameDropdownOpen]);

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/60 bg-black/90">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:gap-4">
        {/* Categories Button Switches - Above search bar */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 sm:gap-3 py-2 min-w-max">
            {categoriesLoading ? (
              // Loading skeleton
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-9 sm:h-10 w-16 sm:w-20 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </>
            ) : (
              <>
                <IOSButton
                  onClick={() => onCategoryChange?.('')}
                  variant={selectedCategory === '' || !selectedCategory ? 'primary' : 'tertiary'}
                  size="sm"
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shadow-sm"
                >
                  Semua
                </IOSButton>
                {categories?.map((c) => {
                  const active = selectedCategory?.toLowerCase() === c.name.toLowerCase();
                  return (
                    <IOSButton
                      key={c.id}
                      onClick={() => onCategoryChange?.(c.name)}
                      variant={active ? 'primary' : 'tertiary'}
                      size="sm"
                      className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shadow-sm"
                      aria-pressed={active}
                    >
                      {c.name}
                    </IOSButton>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 h-9 sm:h-10 min-h-9 sm:min-h-10 max-h-9 sm:max-h-10 focus-within:border-pink-400/40 transition-colors">
          <span className="flex w-4 h-4 items-center justify-center shrink-0">
            <Search size={16} className="w-4 h-4 shrink-0 text-pink-300" style={{ width: 16, height: 16 }} />
          </span>
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearchChange(localSearch); }}
            placeholder="Cari akun game..."
            className="bg-transparent flex-1 h-full leading-none outline-none text-xs sm:text-sm text-white placeholder:text-white/40"
            aria-label="Pencarian produk"
          />
          {localSearch && (
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={() => { setLocalSearch(''); onSearchChange(''); }}
              className="w-7 sm:w-8 h-7 sm:h-8 p-1.5 sm:p-2 rounded-full"
              aria-label="Bersihkan pencarian"
            >
              <X size={14} className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" style={{ width: 14, height: 14 }} />
            </IOSButton>
          )}
        </div>

        {/* Filter Controls - Stack on mobile, horizontal on desktop */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* First Row - Games Dropdown */}
          {gameTitles && gameTitles.length > 0 && (
            <div className="flex-1 sm:flex-none relative" data-dropdown="games">
              <button
                type="button"
                onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
                className="w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm text-white flex items-center justify-between sm:justify-center gap-2 hover:bg-white/10 transition-colors"
                aria-haspopup="listbox"
                aria-expanded={gameDropdownOpen}
              >
                <span className="truncate max-w-full sm:max-w-32">
                  {selectedGame ? gameTitles.find(g => g.name === selectedGame)?.name || 'Semua Game' : 'Semua Game'}
                </span>
                <ChevronDown size={16} className={`w-4 h-4 shrink-0 transition-transform ${gameDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {gameDropdownOpen && (
                <ul
                  role="listbox"
                  className="absolute z-20 mt-1 w-full sm:w-56 max-h-56 overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
                >
                  <li
                    role="option"
                    aria-selected={!selectedGame}
                    onClick={() => { onGameChange?.(''); setGameDropdownOpen(false); }}
                    className={`px-3 py-2 text-xs sm:text-sm cursor-pointer select-none ${!selectedGame ? 'bg-pink-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                  >
                    Semua Game
                  </li>
                  {gameTitles.map(game => {
                    const active = selectedGame === game.name;
                    return (
                      <li
                        key={game.slug}
                        role="option"
                        aria-selected={active}
                        onClick={() => { onGameChange?.(game.name); setGameDropdownOpen(false); }}
                        className={`px-3 py-2 text-xs sm:text-sm cursor-pointer select-none ${active ? 'bg-pink-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                      >
                        {game.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Second Row - Tier Button Filters */}
          {tiers && tiers.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 sm:gap-3 py-1 min-w-max">
                <IOSButton
                  onClick={() => onTierChange?.('')}
                  variant={!selectedTier ? 'primary' : 'tertiary'}
                  size="sm"
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shadow-sm shrink-0"
                  aria-pressed={!selectedTier}
                >
                  Semua Tier
                </IOSButton>
                {tiers
                  .filter(tier => tier.isActive)
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((tier) => {
                    const active = selectedTier === tier.slug;
                    return (
                      <IOSButton
                        key={tier.id}
                        onClick={() => onTierChange?.(tier.slug)}
                        variant={active ? 'primary' : 'tertiary'}
                        size="sm"
                        className="h-9 sm:h-10 px-3 sm:px-4 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shadow-sm shrink-0"
                        aria-pressed={active}
                      >
                        {tier.name}
                      </IOSButton>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Third Row - Sort and Rental */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none">
              <SortSelect value={sortBy} onChange={onSortChange} />
            </div>
            {/* Quick rental toggle */}
            <IOSButton
              variant={rentalOnly ? 'secondary' : 'tertiary'}
              size="sm"
              onClick={onToggleRental}
              className={`h-9 sm:h-10 px-3 sm:px-4 rounded-full border text-xs sm:text-sm ${rentalOnly ? 'border-pink-400 text-white' : 'border-white/10'}`}
              aria-pressed={rentalOnly}
              aria-label="Tampilkan hanya produk rental"
            >
              Rental
            </IOSButton>
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={onRemoveFilter}
          onClearAll={onClearAllFilters}
        />
      </div>
    </div>
  );
};

export default PNCatalogToolbar;
