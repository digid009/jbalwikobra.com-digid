/**
 * FlashSalesPage - Mobile-First Flash Sales Display
 * Simplified structure focused on flash sales display and basic search
 * 
 * Key Features:
 * - Flash sale specific data fetching
 * - Basic search functionality
 * - Homepage-style card display
 * - Pagination support
 */

import React from 'react';
import { useFlashSalesData } from '../hooks/useFlashSalesData';
import {
  ProductsLoadingSkeleton,
  ProductsErrorState,
  PaginationBar
} from '../components/products';
import { ProductsResultsInfo } from '../components/products';
import { PNSection, PNContainer, PNHeading, PNText } from '../components/ui/PinkNeonDesignSystem';
import FlashSalePageCard from '../components/flash-sales/FlashSalePageCard';

const FlashSalesPage: React.FC = () => {
  const {
    // State
    loading,
    error,
    currentProducts,
    totalPages,
    filteredFlashSales: filteredProducts,
    currentPage,
    filterState,
    
    // Actions
    handlePageChange,
    handleSearch,
    resetFilters,
    refetch
  } = useFlashSalesData();

  if (loading) {
    return <ProductsLoadingSkeleton />;
  }

  if (error) {
    return (
      <ProductsErrorState
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <PNSection>
        <PNContainer>
          {/* Flash Sales Header */}
          <div className="text-center py-8">
            <PNHeading level={1} gradient className="mb-4">
              ⚡ Flash Sales
            </PNHeading>
            <PNText className="text-lg text-gray-600 dark:text-gray-300">
              Deals berkualitas dengan harga terbaik
            </PNText>
          </div>

          {/* Simple Search Bar */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Cari flash sale..."
                value={filterState.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {filteredProducts.length} flash sale ditemukan
            </p>
          </div>

          <ProductsResultsInfo
            totalProducts={filteredProducts.length}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {/* Flash Sales Grid - Using exact same structure as homepage */}
          <div className="grid gap-3 px-1 pb-2 auto-cols-[190px] grid-flow-col overflow-x-auto snap-x snap-mandatory scrollbar-hide md:auto-cols-auto md:grid-flow-row md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-x-visible md:px-0">
            {currentProducts.map(flashSale => (
              <div key={flashSale.id} className="block snap-center md:snap-auto">
                <FlashSalePageCard
                  product={flashSale.product}
                  flashSale={flashSale}
                />
              </div>
            ))}
          </div>
            
          {/* No Products State */}
          {currentProducts.length === 0 && (
            <div className="text-center py-12">
              <PNText className="text-gray-500 dark:text-gray-400">
                {filterState.searchTerm ? 
                  'Tidak ada flash sale yang cocok dengan pencarian' : 
                  'Belum ada flash sale tersedia'
                }
              </PNText>
              {filterState.searchTerm && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          )}
          
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </PNContainer>
      </PNSection>
    </div>
  );
};

export default FlashSalesPage;
