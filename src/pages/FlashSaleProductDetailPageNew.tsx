/**
 * FlashSaleProductDetailPage - Modular refactored version
 * Mobile-first design with separated components for better maintainability
 * 
 * Key Improvements:
 * - Modular component architecture
 * - Custom hook for flash sale data management  
 * - Better separation of concerns
 * - Mobile-optimized UI components
 * - Improved accessibility and touch targets
 */

import React from 'react';
import { useFlashSaleProductDetail } from '../hooks/useFlashSaleProductDetail';
import {
  ProductImageGallery,
  ProductRentalOptions,
  ProductDescription
} from '../components/product-detail';
import { FlashSaleProductDetailLoadingSkeleton } from '../components/product-detail/FlashSaleProductDetailLoadingSkeleton';
import CheckoutModal from '../components/public/product-detail/CheckoutModal';
import { 
  PNHeading, 
  PNText,
  PNButton,
  PNCard,
  PNSection,
  PNContainer
} from '../components/ui/PinkNeonDesignSystem';
import { FlashSaleHeader } from '../features/flash-sale/components/FlashSaleHeader';
import { PriceAndTimer } from '../features/flash-sale/components/PriceAndTimer';
import { BottomActions } from '../features/flash-sale/components/BottomActions';

const FlashSaleProductDetailPage: React.FC = () => {
  const {
    // Product data
    product,
    loading,
    error,
    effectivePrice,
    originalPrice,
    discountPercentage,
    isFlashSaleActive,
    timeRemaining,
    
    // Gallery state
    galleryState,
    handleImageSelect,
    
    // Navigation
    handleBackToFlashSales,
    handleBackToCatalog,
    
    // Rental state
    rentalState,
    handleRentalSelect,
    
    // Checkout state
    checkoutState,
    closeCheckout,
    setCheckoutState,
    
    // WhatsApp
    whatsappNumber,
    
    // Actions
    handlePurchase,
    handleRental,
    handleCheckout,
    handleWhatsAppRental,
    handleWishlistToggle,
    handleShare,
    
    // Wishlist
    isInWishlist,
    
    // Constants
    MOBILE_CONSTANTS
  } = useFlashSaleProductDetail();

  // Loading state
  if (loading || !product) {
    return <FlashSaleProductDetailLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <PNSection padding="lg" className="min-h-screen flex items-center justify-center">
        <PNContainer>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Produk Flash Sale Tidak Ditemukan</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <PNButton
              onClick={handleBackToFlashSales}
              variant="primary"
              className="mr-4"
            >
              Kembali ke Flash Sales
            </PNButton>
            <PNButton
              onClick={handleBackToCatalog}
              variant="secondary"
            >
              Kembali ke Katalog
            </PNButton>
          </div>
        </PNContainer>
      </PNSection>
    );
  }

  return (
    <div className="min-h-screen bg-app-dark text-white overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <FlashSaleHeader
        onBack={handleBackToFlashSales}
        onWishlistToggle={handleWishlistToggle}
        onShare={handleShare}
        inWishlist={isInWishlist(product.id)}
      />

      {/* Product Content - Mobile Optimized */}
      <div
        // Reserve space for bottom nav (variable) + fixed action bar (140px) + safe area
        style={{ paddingBottom: 'calc(var(--bottom-nav-height, 72px) + 140px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Gallery */}
        <div className="px-4 pt-4">
          <ProductImageGallery
            images={galleryState.images}
            selectedImage={galleryState.selectedImage}
            onImageSelect={handleImageSelect}
            productName={product.name}
            isFlashSaleActive={isFlashSaleActive}
          />
        </div>

        {/* Product Info - Mobile-First Spacing */}
        <div className="px-4 py-6 space-y-6">
          {/* Product Name - Mobile Typography */}
          <div className="space-y-2">
            <PNHeading level={1} className="text-white text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight break-words">
              {product.name}
            </PNHeading>
          </div>

          {/* Price & Timer */}
          <PriceAndTimer
            productName={product.name}
            isActive={isFlashSaleActive}
            endTime={product.flashSaleEndTime || null}
            effectivePrice={effectivePrice}
            originalPrice={originalPrice}
            discountPercentage={discountPercentage}
          />

          {/* Product Description - Reuse component */}
          {product.description && (
            <ProductDescription description={product.description} />
          )}

          {/* Rental Options - Mobile Optimized */}
          {product.rentalOptions && product.rentalOptions.length > 0 && (
            <PNCard className="bg-gray-900 border-gray-700 rounded-2xl">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <PNHeading level={3} className="text-white text-lg sm:text-xl font-semibold">
                  Opsi Sewa
                </PNHeading>
                <div className="overflow-hidden">
                  <ProductRentalOptions
                    rentalOptions={product.rentalOptions}
                    selectedRental={rentalState.selectedRental}
                    onRentalSelect={handleRentalSelect}
                    cameFromFlashSaleCard={true}
                    hasRental={true}
                    isFlashSaleActive={isFlashSaleActive}
                  />
                </div>
              </div>
            </PNCard>
          )}
        </div>
      </div>

      {/* Action Buttons - Mobile-First Fixed Bottom */}
      <BottomActions
        onPurchase={handlePurchase}
        onRental={handleRental}
        onWhatsAppRental={handleWhatsAppRental}
        showRental={Boolean(product.rentalOptions && product.rentalOptions.length > 0)}
        isFlashSaleActive={isFlashSaleActive}
      />

      {/* Checkout Modal */}
      {checkoutState.showCheckoutForm && (
        <CheckoutModal
          visible={checkoutState.showCheckoutForm}
          onClose={closeCheckout}
          checkoutType={checkoutState.checkoutType}
          productName={product.name}
          effectivePrice={effectivePrice}
          selectedRental={rentalState.selectedRental}
          customer={checkoutState.customer}
          setCustomer={(customer) => setCheckoutState(prev => ({ ...prev, customer }))}
          isPhoneValid={checkoutState.isPhoneValid}
          setIsPhoneValid={(isPhoneValid) => setCheckoutState(prev => ({ ...prev, isPhoneValid }))}
          acceptedTerms={checkoutState.acceptedTerms}
          setAcceptedTerms={(acceptedTerms) => setCheckoutState(prev => ({ ...prev, acceptedTerms }))}
          creatingInvoice={checkoutState.creatingInvoice}
          onCheckout={handleCheckout}
          onWhatsAppRental={handleWhatsAppRental}
        />
      )}
    </div>
  );
};

export default FlashSaleProductDetailPage;
