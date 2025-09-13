import React from 'react';
import { Search } from 'lucide-react';
import { IOSCard } from '../../../../components/ios/IOSDesignSystem';
import { BannerSearchProps } from './types';

export const BannerSearch: React.FC<BannerSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <IOSCard variant="elevated" padding="medium">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
        <input
          type="text"
          placeholder="Search banners by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-ios-background border border-gray-700 rounded-xl 
                     focus:ring-2 focus:ring-ios-primary focus:border-pink-500 
                     transition-colors duration-200 text-white placeholder-ios-text/60"
        />
      </div>
    </IOSCard>
  );
};
