import React from 'react';
import { Search, Filter, SortAsc, SortDesc, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { adminInputBase, adminSelectBase } from './InputStyles';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface AdminFiltersConfig {
  searchPlaceholder?: string;
  filters: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
  sortOptions: SortOption[];
  showSortOrder?: boolean;
}

interface AdminFiltersProps {
  config: AdminFiltersConfig;
  values: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  totalItems: number;
  filteredItems: number;
  loading?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  config,
  values,
  onFiltersChange,
  totalItems,
  filteredItems,
  loading = false,
  className
  ,
  collapsible = true,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(defaultCollapsed);
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...values,
      [key]: value
    });
  };

  const clearFilters = () => {
    const clearedFilters: Record<string, any> = {
      searchTerm: '',
      sortBy: config.sortOptions[0]?.value || '',
      sortOrder: 'desc'
    };
    
    config.filters.forEach(filter => {
      clearedFilters[filter.key] = filter.options[0]?.value || '';
    });

    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return values.searchTerm || 
           config.filters.some(filter => 
             values[filter.key] && values[filter.key] !== filter.options[0]?.value
           );
  };

  return (
  <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-ds-pink" />
            <h3 className="text-lg font-semibold text-ds-text">Filter & Pencarian</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-ds-text-secondary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-ds-text-tertiary rounded-full animate-pulse" />
                  Memuat...
                </span>
              ) : (
                `${filteredItems} dari ${totalItems} item`
              )}
            </span>
            {hasActiveFilters() && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary btn-sm text-ds-text-secondary hover:text-ds-text flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="btn btn-ghost btn-sm flex items-center gap-1"
                aria-expanded={!isCollapsed}
                aria-controls="admin-filters-content"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", isCollapsed ? "-rotate-90" : "rotate-0")} />
                {isCollapsed ? 'Show' : 'Hide'}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {(!collapsible || !isCollapsed) && (
          <div id="admin-filters-content" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ds-text-tertiary" />
              <input
                type="text"
                placeholder={config.searchPlaceholder || "Cari..."}
                value={values.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className={cn(adminInputBase, "pl-12")}
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    {filter.label}
                  </label>
                  <select
                    value={values[filter.key] || filter.options[0]?.value || ''}
                    onChange={(e) => updateFilter(filter.key, e.target.value)}
                    className={adminSelectBase}
                  >
                    {config.filters.length > 0 && filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 pt-4 border-t border-surface-tint-light">
              <span className="text-sm font-medium text-ds-text-secondary">Urutkan:</span>
              
              <select
                value={values.sortBy || config.sortOptions[0]?.value || ''}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className={cn(adminSelectBase, "flex-1 max-w-xs")}
              >
                {config.sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {config.showSortOrder !== false && (
                <button
                  type="button"
                  onClick={() => updateFilter('sortOrder', values.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  {values.sortOrder === 'asc' ? (
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
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="bg-ds-pink/10 border border-ds-pink/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-ds-pink mb-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter Aktif</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {values.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg">
                      Pencarian: "{values.searchTerm}"
                      <button onClick={() => updateFilter('searchTerm', '')}>×</button>
                    </span>
                  )}
                  {config.filters.map((filter) => {
                    const currentValue = values[filter.key];
                    const isActive = currentValue && currentValue !== filter.options[0]?.value;
                    if (!isActive) return null;

                    const optionLabel = filter.options.find(opt => opt.value === currentValue)?.label;
                    
                    return (
                      <span 
                        key={filter.key}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-ds-pink/20 text-ds-pink text-xs rounded-lg"
                      >
                        {filter.label}: {optionLabel}
                        <button onClick={() => updateFilter(filter.key, filter.options[0]?.value || '')}>×</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
