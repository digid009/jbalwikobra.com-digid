import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { BannerHeaderProps } from './types';

export const BannerHeader: React.FC<BannerHeaderProps> = ({ 
  loading, 
  onRefresh, 
  onCreateBanner 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Banner Management</h2>
        <p className="text-sm text-white/70 mt-1">Manage homepage banners and promotional content</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={onRefresh}
          className="btn btn-secondary btn-sm flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
        <button 
          type="button"
          className="btn btn-primary btn-sm flex items-center gap-2"
          onClick={onCreateBanner}
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>
    </div>
  );
};
