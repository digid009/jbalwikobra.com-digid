import React from 'react';
import { Search } from 'lucide-react';
import { BannerSearchProps } from './types';

export const BannerSearch: React.FC<BannerSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
        <input
          type="text"
          placeholder="Search banners by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-token rounded-xl \
                     focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 \
                     transition-colors duration-200 text-white placeholder:text-white/50"
        />
      </div>
    </div>
  );
};
