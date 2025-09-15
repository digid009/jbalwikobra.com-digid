import React from 'react';
import { Search } from 'lucide-react';
import { BannerSearchProps } from './types';

export const BannerSearch: React.FC<BannerSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300">
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search banners by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
        />
      </div>
    </div>
  );
};
