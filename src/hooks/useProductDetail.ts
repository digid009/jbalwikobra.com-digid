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
      setState(prev => ({ ...prev, product: data, loading: false }));
      
      // Set initial rental option
      if (data?.rentalOptions && data.rentalOptions.length > 0) {
        setRentalState({ selectedRental: data.rentalOptions[0] });
      }

      // If navigated from a flash sale card, try to enrich with live flash sale info
      if (data && cameFromFlashSaleCard) {
        const sale = await ProductService.getActiveFlashSaleByProductId(data.id);
        if (sale) {
          setState(prev => prev.product ? {
            ...prev,
            product: {
              ...prev.product,
              isFlashSale: true,
              flashSaleEndTime: sale.endTime,
              price: sale.salePrice,
              originalPrice: sale.originalPrice || prev.product.originalPrice
            }
          } : prev);
        }
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load product details'
      }));
    }
  }, [id, cameFromFlashSaleCard]);

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

  // Wishlist handlers
  const handleWishlistToggle = useCallback(() => {
    if (!state.product) return;
    
    const wishlistItem = {
      id: state.product.id,
      name: state.product.name,
      price: state.product.price,
      image: state.product.images?.[0] || '',
      rating: 5,
      category: state.product.category || '',
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
  const isFlashSaleActive = state.product?.flashSaleEndTime && state.product.isFlashSale;
  const timeRemaining = state.product?.flashSaleEndTime 
    ? calculateTimeRemaining(state.product.flashSaleEndTime) 
    : null;
  const effectivePrice = (isFlashSaleActive && state.product?.originalPrice && state.product.originalPrice > state.product.price) 
    ? state.product.price 
    : (state.product?.originalPrice && state.product.originalPrice > 0 
      ? state.product.originalPrice 
      : state.product?.price || 0);

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
    isFlashSaleActive,
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
    closeCheckout,
    handleWishlistToggle,
    handleShare,
    
    // State setters for forms
    setCheckoutState,
    setRentalState
  };
};
