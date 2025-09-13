/**
 * ProductsPage - Mobile-First Refactored Version
 * Modular architecture with separated components for better scalability
 * 
 * Key Improvements:
 * - Modular component architecture
 * - Custom hooks for data management
 * - Better separation of concerns
 * - Improved maintainability and scalability
 * - Touch-optimized filtering and search
 * - Native-like product browsing experience  
 */

import React from 'react';
import { useProductsData } from '../hooks/useProductsData';
import {
  ProductsLoadingSkeleton,
  ProductsErrorState,
  ProductsHero,
  ProductsSearchBar,
  ProductsResultsInfo,
  ProductsGrid,
  MobilePagination,
  MobileFilterPanel,
  ProductsTierFilter
} from '../components/products';

const ProductsPage: React.FC = () => {
  const {
    // State
    loading,
    error,
    filterState,
    currentPage,
    currentProducts,
    totalPages,
    filteredProducts,
    tiers,
    gameTitles,
    
    // Actions
    fetchData,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    toggleFilters,
    closeFilters
  } = useProductsData();

  // Show loading skeleton
  if (loading) {
    return <ProductsLoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <ProductsErrorState 
        error={error} 
        onRetry={fetchData} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <ProductsHero />

      {/* Search & Filter Bar */}
      <ProductsSearchBar
        searchTerm={filterState.searchTerm}
        onSearchChange={(value) => handleFilterChange('searchTerm', value)}
        onFilterOpen={toggleFilters}
      />

      {/* Tier Filter */}
      <ProductsTierFilter
        selectedTier={filterState.selectedTier}
        onTierChange={(tier) => handleFilterChange('selectedTier', tier)}
        tiers={tiers}
      />

      {/* Results Info */}
      <ProductsResultsInfo
        totalProducts={filteredProducts.length}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Products Grid */}
      <ProductsGrid
        products={currentProducts}
        onResetFilters={resetFilters}
      />

      {/* Pagination */}
      <MobilePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Mobile Filter Panel */}
      <MobileFilterPanel
        isOpen={filterState.showFilters}
        onClose={closeFilters}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        gameTitles={gameTitles}
        tiers={tiers}
      />

      {/* Bottom spacing for mobile navigation */}
      <div className="h-6"></div>
    </div>
  );
};

export default ProductsPage;
