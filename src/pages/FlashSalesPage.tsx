/**
 * FlashSalesPage - Complete Rewrite with Homepage Design Consistency
 * 
 * Features:
 * - Identical grid layout and styling as homepage flash sales section
 * - Enhanced flash sale header with stats and branding
 * - Mobile-first responsive design
 * - Clean search and filtering interface
 * - Consistent product card styling
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Zap, 
  Clock, 
  Flame, 
  TrendingDown,
  Filter,
  X,
  ChevronRight 
} from 'lucide-react';
import { useFlashSalesData } from '../hooks/useFlashSalesData';
import {
  ProductsLoadingSkeleton,
  ProductsErrorState,
  PaginationBar
} from '../components/products';
import { 
  PNSection, 
  PNContainer, 
  PNCard, 
  PNButton, 
  PNHeading, 
  PNText 
} from '../components/ui/PinkNeonDesignSystem';
import FlashSaleTimer from '../components/FlashSaleTimer';

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

  const [searchVisible, setSearchVisible] = useState(false);

  // Calculate stats from current flash sales
  const totalFlashSales = filteredProducts.length;
  const maxDiscount = Math.max(
    ...filteredProducts.map(fs => 
      fs.originalPrice && fs.salePrice 
        ? Math.round(((fs.originalPrice - fs.salePrice) / fs.originalPrice) * 100)
        : 0
    ),
    0
  );

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
    <div className="min-h-screen bg-black">
      {/* Enhanced Flash Sale Header - Black Background */}
      <PNSection padding="lg">
        <PNContainer>
          <div className="text-center mb-8">
            {/* Flash Sale Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl mb-6">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Flash Sale</h3>
                <p className="text-pink-300 text-sm">Penawaran Terbatas!</p>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-600 bg-clip-text text-transparent">
                Flash Sale
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Diskon hingga {maxDiscount}% untuk akun game terpilih! 
              <br />
              <span className="text-pink-400 font-semibold">Buruan, stok dan waktu terbatas!</span>
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <PNCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex items-center gap-2 justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">Waktu Terbatas</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Countdown aktif</p>
              </PNCard>
              
              <PNCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex items-center gap-2 justify-center">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Diskon Besar</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Hingga {maxDiscount}% off</p>
              </PNCard>
              
              <PNCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex items-center gap-2 justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Stok Terbatas</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{totalFlashSales} produk</p>
              </PNCard>
            </div>
          </div>
        </PNContainer>
      </PNSection>

      {/* Search and Stats Section - Black Background */}
      <PNSection>
        <PNContainer>
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <PNCard className="p-6 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 backdrop-blur-sm border-pink-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalFlashSales}</div>
                  <div className="text-sm text-pink-300">Produk Tersedia</div>
                </div>
              </div>
            </PNCard>
            
            <PNCard className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{maxDiscount}%</div>
                  <div className="text-sm text-orange-300">Diskon Maksimal</div>
                </div>
              </div>
            </PNCard>
          </div>

          {/* Search Interface */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              {/* Search Toggle Button */}
              <button
                onClick={() => setSearchVisible(!searchVisible)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
              >
                {searchVisible ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                <span>{searchVisible ? 'Tutup' : 'Cari'}</span>
              </button>

              {/* Results Count */}
              <div className="text-gray-400 text-sm">
                {filteredProducts.length} flash sale ditemukan
              </div>
            </div>

            {/* Collapsible Search Bar */}
            {searchVisible && (
              <div className="mt-4 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari flash sale..."
                    value={filterState.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {filterState.searchTerm && (
                    <button
                      onClick={resetFilters}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </PNContainer>
      </PNSection>

      {/* Flash Sales Grid - Identical to Homepage with Black Background */}
      <PNSection>
        <PNContainer>
          {currentProducts.length > 0 ? (
            <>
              {/* Grid with exact homepage styling */}
              <div className="grid gap-3 px-1 pb-2 auto-cols-[190px] grid-flow-col overflow-x-auto snap-x snap-mandatory scrollbar-hide md:auto-cols-auto md:grid-flow-row md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-x-visible md:px-0">
                {currentProducts.map(flashSale => (
                  <Link key={flashSale.id} to={`/products/${flashSale.product.id}`} className="block snap-center md:snap-auto">
                    <PNCard className="p-3 md:p-4 hover:bg-white/10 transition-colors h-full min-w-[190px] md:min-w-0">
                      {/* Image Container - Identical to Homepage */}
                      <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30 mb-2 md:mb-3 overflow-hidden">
                        {flashSale.product.image && (
                          <img 
                            src={flashSale.product.image} 
                            alt={flashSale.product.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                          />
                        )}
                      </div>
                      
                      {/* Product Name - Identical to Homepage */}
                      <div className="text-sm font-semibold text-white line-clamp-2 mb-2 md:mb-2 md:min-h-10">
                        {flashSale.product.name}
                      </div>
                      
                      {/* Pricing Section - Identical to Homepage */}
                      <div className="flex items-end justify-between gap-3 mb-2">
                        <div className="flex flex-col leading-tight">
                          {flashSale.originalPrice && flashSale.originalPrice > flashSale.salePrice && (
                            <div className="text-[11px] md:text-[12px] text-gray-400 line-through">
                              Rp {flashSale.originalPrice.toLocaleString('id-ID')}
                            </div>
                          )}
                          <div className="text-pink-300 font-extrabold text-[15px] md:text-[16px]">
                            Rp {(flashSale.salePrice || flashSale.product.price).toLocaleString('id-ID')}
                          </div>
                        </div>
                        {flashSale.originalPrice && flashSale.originalPrice > flashSale.salePrice && (
                          <div className="shrink-0 px-2 py-1 rounded-md bg-pink-600/20 border border-pink-500/40 text-pink-300 text-[11px] md:text-[12px] font-bold">
                            -{Math.round(((flashSale.originalPrice - flashSale.salePrice) / flashSale.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      {/* Flash Sale Timer - Identical to Homepage */}
                      {flashSale.endTime && (
                        <div className="mb-2 md:mb-3">
                          <FlashSaleTimer endTime={flashSale.endTime} variant="card" />
                        </div>
                      )}
                      
                      {/* CTA Button - Identical to Homepage */}
                      <PNButton variant="primary" size="sm" fullWidth>
                        Beli
                      </PNButton>
                    </PNCard>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {filterState.searchTerm ? 
                  'Tidak ada flash sale ditemukan' : 
                  'Belum ada flash sale tersedia'
                }
              </h3>
              <p className="text-gray-400 mb-6">
                {filterState.searchTerm ? 
                  'Coba kata kunci lain atau reset pencarian' : 
                  'Flash sale baru akan segera hadir!'
                }
              </p>
              {filterState.searchTerm && (
                <PNButton 
                  onClick={resetFilters}
                  variant="primary"
                >
                  Reset Pencarian
                </PNButton>
              )}
            </div>
          )}
        </PNContainer>
      </PNSection>
    </div>
  );
};

export default FlashSalesPage;
