/**
 * useProductDetail - Custom hook for product detail page
 * Handles product data fetching, gallery state, checkout flow, and wishlist integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Product, Customer, RentalOption } from '../types';
import { ProductService } from '../services/productService';
import { SettingsService } from '../services/settingsService';
import { calculateTimeRemaining, formatCurrency } from '../utils/helpers';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../components/Toast';

// Mobile-first constants
const MOBILE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44,
  GALLERY_PLACEHOLDER_COUNT: 5,
  MAX_GALLERY_IMAGES: 15,
} as const;

interface ProductDetailState {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

interface GalleryState {
  selectedImage: number;
  images: string[];
}

interface CheckoutState {
  showCheckoutForm: boolean;
  checkoutType: 'purchase' | 'rental';
  acceptedTerms: boolean;
  customer: Customer;
  isPhoneValid: boolean;
  creatingInvoice: boolean;
  paymentAttemptId: string | null;
}

interface RentalState {
  selectedRental: RentalOption | null;
}

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  // Navigation state
  const cameFromFlashSaleCard = Boolean((location as any)?.state?.fromFlashSaleCard);
  const cameFromCatalogPage = Boolean((location as any)?.state?.fromCatalogPage);
  const flashSaleData = (location as any)?.state?.flashSaleData;
  const shouldOpenCheckoutModal = Boolean((location as any)?.state?.openCheckoutModal);

  // Debug logging
  useEffect(() => {
    if (cameFromFlashSaleCard) {
      console.log('🔍 ProductDetail: Navigated from flash sale card', {
        productId: id,
        hasFlashSaleData: !!flashSaleData,
        flashSaleData: flashSaleData,
        shouldOpenCheckoutModal
      });
    }
  }, [cameFromFlashSaleCard, flashSaleData, id, shouldOpenCheckoutModal]);

  // Product state
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    loading: true,
    error: null
  });

  // Gallery state
  const [galleryState, setGalleryState] = useState<GalleryState>({
    selectedImage: 0,
    images: []
  });

  // Checkout state
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    showCheckoutForm: false,
    checkoutType: 'purchase',
    acceptedTerms: false,
    customer: {
      name: '',
      email: '',
      phone: ''
    },
    isPhoneValid: true,
    creatingInvoice: false,
    paymentAttemptId: null
  });

  // Rental state
  const [rentalState, setRentalState] = useState<RentalState>({
    selectedRental: null
  });

  // WhatsApp configuration
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890'
  );

  // Load WhatsApp configuration
  useEffect(() => { 
    (async () => { 
      try { 
        const settings = await SettingsService.get(); 
        if (settings?.whatsappNumber) setWhatsappNumber(settings.whatsappNumber); 
      } catch (_e) { 
        // Ignore settings fetch errors
      } 
    })(); 
  }, []);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await ProductService.getProductById(id);
      
      // Set initial rental option
      if (data?.rentalOptions && data.rentalOptions.length > 0) {
        setRentalState({ selectedRental: data.rentalOptions[0] });
      }

      // If navigated from a flash sale card, use the flash sale data or try to fetch live data
      if (data && cameFromFlashSaleCard) {
        if (flashSaleData) {
          // Use the flash sale data passed from the card
          console.log('🔍 Applying flash sale data from card:', flashSaleData);
          
          const updatedProduct = {
            ...data,
            isFlashSale: true,
            flashSaleEndTime: flashSaleData.endTime,
            price: flashSaleData.salePrice,
            originalPrice: flashSaleData.originalPrice || data.originalPrice || data.price
          };
          
          console.log('🔍 Updated product with flash sale data:', updatedProduct);
          
          setState(prev => ({
            ...prev,
            product: updatedProduct,
            loading: false
          }));
        } else {
          // Fallback: try to fetch live flash sale data
          try {
            const sale = await ProductService.getActiveFlashSaleByProductId(data.id);
            if (sale) {
              const updatedProduct = {
                ...data,
                isFlashSale: true,
                flashSaleEndTime: sale.endTime,
                price: sale.salePrice,
                originalPrice: sale.originalPrice || data.originalPrice
              };
              
              setState(prev => ({
                ...prev,
                product: updatedProduct,
                loading: false
              }));
            } else {
              setState(prev => ({ ...prev, product: data, loading: false }));
            }
          } catch (flashSaleError) {
            console.warn('Could not fetch flash sale data:', flashSaleError);
            setState(prev => ({ ...prev, product: data, loading: false }));
          }
        }
      } else {
        setState(prev => ({ ...prev, product: data, loading: false }));
      }
      
      // Auto-open checkout modal if requested from button click
      if (shouldOpenCheckoutModal && data) {
        setTimeout(() => {
          setCheckoutState(prev => ({
            ...prev,
            showCheckoutForm: true,
            checkoutType: 'purchase'
          }));
        }, 500); // Small delay to let UI render
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load product details'
      }));
    }
  }, [id, cameFromFlashSaleCard, shouldOpenCheckoutModal]);

  // Setup gallery images
  useEffect(() => {
    if (!state.product) return;

    const baseList = state.product.images && state.product.images.length > 0 
      ? state.product.images 
      : (state.product.image ? [state.product.image] : []);
    
    let images: string[];
    if (baseList.length < MOBILE_CONSTANTS.GALLERY_PLACEHOLDER_COUNT) {
      const needed = MOBILE_CONSTANTS.GALLERY_PLACEHOLDER_COUNT - baseList.length;
      const placeholders = Array.from({ length: needed }, (_, i) => 
        `https://source.unsplash.com/collection/190727/400x400?sig=${i}`
      );
      images = [...baseList, ...placeholders];
    } else {
      images = baseList.slice(0, MOBILE_CONSTANTS.MAX_GALLERY_IMAGES);
    }

    setGalleryState(prev => ({ ...prev, images }));
  }, [state.product]);

  // Load product data on mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Navigation handlers
  const handleBackToCatalog = useCallback(() => {
    if (cameFromCatalogPage) {
      navigate('/products', { state: { fromProductDetail: true } });
    } else {
      navigate('/products');
    }
  }, [cameFromCatalogPage, navigate]);

  // Gallery handlers
  const handleImageSelect = useCallback((index: number) => {
    setGalleryState(prev => ({ ...prev, selectedImage: index }));
  }, []);

  // Rental handlers
  const handleRentalSelect = useCallback((rental: RentalOption) => {
    setRentalState({ selectedRental: rental });
  }, []);

  // Checkout handlers
  const handlePurchase = useCallback(() => {
    setCheckoutState(prev => ({
      ...prev,
      showCheckoutForm: true,
      checkoutType: 'purchase'
    }));
  }, []);

  const handleRental = useCallback((rental: RentalOption) => {
    setRentalState({ selectedRental: rental });
    setCheckoutState(prev => ({
      ...prev,
      showCheckoutForm: true,
      checkoutType: 'rental'
    }));
  }, []);

  const closeCheckout = useCallback(() => {
    setCheckoutState(prev => ({
      ...prev,
      showCheckoutForm: false,
      acceptedTerms: false,
      customer: { name: '', email: '', phone: '' },
      isPhoneValid: true
    }));
  }, []);

  // Checkout handlers
  const handleCheckout = useCallback(async (paymentMethod?: string) => {
    if (!state.product) return;
    
    try {
      setCheckoutState(prev => ({ ...prev, creatingInvoice: true }));
      
      const { createXenditInvoice } = await import('../services/paymentService');
      
      const externalId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate effective price
      const isFlashSaleActive = Boolean(state.product?.flashSaleEndTime && state.product.isFlashSale);
      const calculatedEffectivePrice = (isFlashSaleActive && state.product?.originalPrice && state.product.originalPrice > state.product.price) 
        ? state.product.price 
        : (state.product?.originalPrice && state.product.originalPrice > 0 
          ? state.product.originalPrice 
          : state.product?.price || 0);
      
      const amount = checkoutState.checkoutType === 'rental' && rentalState.selectedRental 
        ? rentalState.selectedRental.price 
        : calculatedEffectivePrice;
      
      const invoiceData = await createXenditInvoice({
        externalId,
        amount,
        payerEmail: checkoutState.customer.email,
        description: `Pembelian ${state.product.name}`,
        successRedirectUrl: `${window.location.origin}/payment-status?status=success`,
        failureRedirectUrl: `${window.location.origin}/payment-status?status=failed`,
        paymentMethod, // Pass the selected payment method
        customer: {
          given_names: checkoutState.customer.name,
          email: checkoutState.customer.email,
          mobile_number: checkoutState.customer.phone,
        },
        order: {
          product_id: state.product.id,
          customer_name: checkoutState.customer.name,
          customer_email: checkoutState.customer.email,
          customer_phone: checkoutState.customer.phone,
          order_type: checkoutState.checkoutType,
          amount,
          rental_duration: checkoutState.checkoutType === 'rental' ? rentalState.selectedRental?.duration : null,
        }
      });
      
      // Redirect to payment page
      window.location.href = invoiceData.invoice_url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Gagal membuat invoice. Silakan coba lagi.', 'error');
    } finally {
      setCheckoutState(prev => ({ ...prev, creatingInvoice: false }));
    }
  }, [state.product, checkoutState, rentalState.selectedRental, showToast]);

  const handleWhatsAppRental = useCallback(() => {
    if (!state.product || !rentalState.selectedRental) return;
    
    const message = `Halo! Saya tertarik untuk rental ${state.product.name} dengan durasi ${rentalState.selectedRental.duration}. Mohon info lebih lanjut.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    closeCheckout();
  }, [state.product, rentalState.selectedRental, whatsappNumber, closeCheckout]);

  // Wishlist handlers
  const handleWishlistToggle = useCallback(() => {
    if (!state.product) return;
    
    const wishlistItem = {
      id: state.product.id,
      name: state.product.name,
      price: state.product.price,
      image: state.product.images?.[0] || '',
      rating: 5,
  category: (state.product as any).categoryData?.name || '',
      available: true
    };

    if (isInWishlist(state.product.id)) {
      removeFromWishlist(state.product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  }, [state.product, isInWishlist, addToWishlist, removeFromWishlist]);

  // Share handler
  const handleShare = useCallback(async () => {
    if (!state.product) return;
    
    const currentUrl = window.location.href;
    const shareData = {
      title: state.product.name,
      text: `Lihat ${state.product.name} di JB Alwikobra - ${formatCurrency(state.product.price)}`,
      url: currentUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        showToast('Link produk telah disalin ke clipboard!', 'success');
      }
    } catch (error) {
      // Additional fallback: Manual copy
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link produk telah disalin ke clipboard!', 'success');
    }
  }, [state.product, showToast]);

  // Computed values
  const isFlashSaleActive = Boolean(state.product?.flashSaleEndTime && state.product.isFlashSale);
  const timeRemaining = state.product?.flashSaleEndTime 
    ? calculateTimeRemaining(state.product.flashSaleEndTime) 
    : null;
  
  // Fix: Check if time remaining is still valid (not expired)
  const isTimeValid = timeRemaining && (
    timeRemaining.days > 0 || 
    timeRemaining.hours > 0 || 
    timeRemaining.minutes > 0 || 
    timeRemaining.seconds > 0
  );
  
  const actuallyFlashSaleActive = isFlashSaleActive && isTimeValid;
  
  const effectivePrice = (actuallyFlashSaleActive && state.product?.originalPrice && state.product.originalPrice > state.product.price) 
    ? state.product.price 
    : (state.product?.originalPrice && state.product.originalPrice > 0 
      ? state.product.originalPrice 
      : state.product?.price || 0);

  // Debug final computed values
  useEffect(() => {
    if (state.product && cameFromFlashSaleCard) {
      console.log('🔍 Final computed values:', {
        productName: state.product.name,
        isFlashSale: state.product.isFlashSale,
        flashSaleEndTime: state.product.flashSaleEndTime,
        isFlashSaleActive,
        actuallyFlashSaleActive,
        isTimeValid,
        price: state.product.price,
        originalPrice: state.product.originalPrice,
        effectivePrice,
        timeRemaining
      });
    }
  }, [state.product, isFlashSaleActive, actuallyFlashSaleActive, effectivePrice, timeRemaining, cameFromFlashSaleCard]);

  return {
    // State
    ...state,
    galleryState,
    checkoutState,
    rentalState,
    whatsappNumber,
    cameFromFlashSaleCard,
    cameFromCatalogPage,
    
    // Computed
    isFlashSaleActive: actuallyFlashSaleActive,
    timeRemaining,
    effectivePrice,
    isInWishlist: state.product ? isInWishlist(state.product.id) : false,
    
    // Actions
    fetchProduct,
    handleBackToCatalog,
    handleImageSelect,
    handleRentalSelect,
    handlePurchase,
    handleRental,
    handleCheckout,
    handleWhatsAppRental,
    closeCheckout,
    handleWishlistToggle,
    handleShare,
    
    // State setters for forms
    setCheckoutState,
    setRentalState
  };
};
