import React from 'react';
import { RefreshCw, Plus, Download, Upload, Filter, BarChart3 } from 'lucide-react';

interface ProductActionsProps {
  loading: boolean;
  showFilters: boolean;
  showStats: boolean;
  onRefresh: () => void;
  onAddProduct: () => void;
  onToggleFilters: () => void;
  onToggleStats: () => void;
  onExport?: () => void;
  onImport?: () => void;
  totalProducts?: number;
  filteredProducts?: number;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  loading,
  showFilters,
  showStats,
  onRefresh,
  onAddProduct,
  onToggleFilters,
  onToggleStats,
  onExport,
  onImport,
  totalProducts = 0,
  filteredProducts = 0,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-cluster-md">
      {/* Left side - Main actions */}
      <div className="flex items-center gap-cluster-sm">
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="btn btn-ghost btn-sm inline-flex items-center gap-cluster-xs"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        
        <button 
          onClick={onAddProduct}
          className="btn btn-primary btn-sm inline-flex items-center gap-cluster-xs"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Center - Toggle controls */}
      <div className="flex items-center gap-cluster-xs">
        <button
          onClick={onToggleFilters}
          className={`btn btn-sm inline-flex items-center gap-cluster-xs ${showFilters ? 'btn-secondary' : 'btn-ghost'}`}
        >
          <Filter size={14} />
          Filters
        </button>
        
        <button
          onClick={onToggleStats}
          className={`btn btn-sm inline-flex items-center gap-cluster-xs ${showStats ? 'btn-secondary' : 'btn-ghost'}`}
        >
          <BarChart3 size={14} />
          Stats
        </button>
      </div>

      {/* Right side - Secondary actions & info */}
      <div className="flex items-center gap-cluster-sm">
        {/* Product count info */}
        <div className="hidden sm:block text-sm text-ds-text-secondary">
          {filteredProducts !== totalProducts ? (
            <span>{filteredProducts} of {totalProducts} products</span>
          ) : (
            <span>{totalProducts} products</span>
          )}
        </div>

        {/* Export/Import actions */}
        <div className="flex items-center gap-cluster-xs">
          {onExport && (
            <button
              onClick={onExport}
              className="btn btn-ghost btn-sm inline-flex items-center gap-cluster-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          
          {onImport && (
            <button
              onClick={onImport}
              className="btn btn-ghost btn-sm inline-flex items-center gap-cluster-xs"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Import</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
