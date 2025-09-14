/**
 * ProductDetailPageNew - Modular refactored version
 * Mobile-first design with separated components for better maintainability
 * 
 * Key Improvements:
 * - Modular component architecture
 * - Custom hook for data management  
 * - Better separation of concerns
 * - Mobile-optimized UI components
 * - Improved accessibility and touch targets
 */

import React from 'react';
// Removed legacy standardClasses helper – using direct utilities
import { useProductDetail } from '../hooks/useProductDetail';
import {
  ProductDetailLoadingSkeleton,
  ProductBreadcrumb,
  ProductImageGallery,
  ProductInfo,
  ProductRentalOptions,
  ProductActions,
  ProductDescription
} from '../components/product-detail';

const ProductDetailPageNew: React.FC = () => {
  const {
    // Product data
    product,
    loading,
    error,
    effectivePrice,
    isFlashSaleActive,
    timeRemaining,
    
    // Gallery state
    galleryState,
    handleImageSelect,
    
    // Navigation
    cameFromFlashSaleCard,
    handleBackToCatalog,
    
    // Rental state
    rentalState,
    handleRentalSelect,
    
    // Actions
    handlePurchase,
    handleRental,
    handleWishlistToggle,
    handleShare,
    
    // Wishlist
    isInWishlist
  } = useProductDetail();

  // Loading state
  if (loading || !product) {
    return <ProductDetailLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={handleBackToCatalog}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
  <div className="w-full max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <ProductBreadcrumb
          productName={product.name}
          onBackToCatalog={handleBackToCatalog}
        />

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery
              images={galleryState.images}
              productName={product.name}
              selectedImage={galleryState.selectedImage}
              onImageSelect={handleImageSelect}
              isFlashSaleActive={isFlashSaleActive}
            />
          </div>

          {/* Product Information */}
          <div>
            <ProductInfo
              product={product}
              effectivePrice={effectivePrice}
              isFlashSaleActive={isFlashSaleActive}
              timeRemaining={timeRemaining}
            />

            {/* Rental Options */}
            <ProductRentalOptions
              rentalOptions={product.rentalOptions || []}
              selectedRental={rentalState.selectedRental}
              onRentalSelect={handleRentalSelect}
              cameFromFlashSaleCard={cameFromFlashSaleCard}
              hasRental={product.hasRental || false}
            />

            {/* Actions */}
            <ProductActions
              stock={product.stock}
              isInWishlist={isInWishlist}
              cameFromFlashSaleCard={cameFromFlashSaleCard}
              hasRental={product.hasRental || false}
              selectedRental={rentalState.selectedRental}
              onPurchase={handlePurchase}
              onRental={handleRental}
              onWishlistToggle={handleWishlistToggle}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Product Description */}
        <ProductDescription 
          description={product.description || 'Tidak ada deskripsi tersedia.'}
        />
      </div>
    </div>
  );
};

export default ProductDetailPageNew;
