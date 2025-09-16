/**
 * FlashSalesEmptyState - Empty state component for Flash Sales page
 * 
 * Features:
 * - Different messages for search vs general empty state
 * - Call-to-action buttons
 * - Consistent styling with design system
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { PNHeading, PNText, PNButton } from '../ui/PinkNeonDesignSystem';

interface FlashSalesEmptyStateProps {
  /** Current search term - if provided, shows search-specific empty state */
  searchTerm?: string;
  /** Handler for resetting search/filters */
  onResetSearch?: () => void;
}

const FlashSalesEmptyState: React.FC<FlashSalesEmptyStateProps> = ({
  searchTerm,
  onResetSearch
}) => {
  const isSearchEmpty = !!searchTerm;

  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-4">
          <Zap className="mx-auto h-16 w-16 text-gray-400" />
        </div>
        
        {/* Title */}
        <PNHeading level={3} className="mb-2 text-gray-600 dark:text-gray-300">
          {isSearchEmpty ? 
            'Tidak ada flash sale yang cocok' : 
            'Belum ada flash sale tersedia'
          }
        </PNHeading>
        
        {/* Description */}
        <PNText className="text-gray-500 dark:text-gray-400 mb-6">
          {isSearchEmpty ? 
            'Coba gunakan kata kunci lain atau lihat semua produk.' : 
            'Flash sale akan segera hadir. Pantai terus untuk penawaran terbaik!'
          }
        </PNText>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {isSearchEmpty && onResetSearch && (
            <PNButton
              variant="secondary"
              onClick={onResetSearch}
            >
              Reset Pencarian
            </PNButton>
          )}
          
          <Link to="/products">
            <PNButton variant="primary">
              Lihat Semua Produk
            </PNButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlashSalesEmptyState;
