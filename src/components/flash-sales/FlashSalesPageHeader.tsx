/**
 * FlashSalesPageHeader - Header section for Flash Sales page
 * 
 * Features:
 * - Page title with animated icons
 * - Subtitle text
 * - Search functionality
 * - Results statistics
 * - Back navigation link
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, Zap } from 'lucide-react';
import { PNContainer, PNHeading, PNText } from '../ui/PinkNeonDesignSystem';

interface FlashSalesPageHeaderProps {
  /** Current search term */
  searchTerm: string;
  /** Search change handler */
  onSearchChange: (term: string) => void;
  /** Total number of filtered products */
  totalProducts: number;
  /** Current page number */
  currentPage?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Show back navigation */
  showBackNav?: boolean;
}

const FlashSalesPageHeader: React.FC<FlashSalesPageHeaderProps> = ({
  searchTerm,
  onSearchChange,
  totalProducts,
  currentPage,
  totalPages,
  showBackNav = true
}) => {
  return (
    <>
      {/* Back Navigation */}
      {showBackNav && (
        <div className="px-4 pt-4 pb-2">
          <PNContainer>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-pink-300 hover:text-pink-200 transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              Kembali ke Beranda
            </Link>
          </PNContainer>
        </div>
      )}

      <div className="px-4">
        <PNContainer>
          {/* Flash Sales Title - Homepage Style */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="text-pink-400 animate-pulse" size={32} />
              <PNHeading level={1} gradient className="!mb-0">
                Flash Sales
              </PNHeading>
              <Zap className="text-pink-400 animate-pulse" size={32} />
            </div>
            <PNText className="text-lg text-gray-600 dark:text-gray-300">
              ⚡ Deals berkualitas dengan harga terbaik - Terbatas! ⚡
            </PNText>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari flash sale..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Results Stats */}
          <div className="mb-6 text-center">
            <PNText className="text-sm text-gray-500 dark:text-gray-400">
              {totalProducts} flash sale tersedia
              {currentPage && totalPages && totalPages > 1 && (
                <span className="ml-2">• Halaman {currentPage} dari {totalPages}</span>
              )}
            </PNText>
          </div>
        </PNContainer>
      </div>
    </>
  );
};

export default FlashSalesPageHeader;
