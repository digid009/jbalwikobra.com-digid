/**
 * React Hook for Google Tag Manager & Analytics Tracking
 * Easy-to-use hook for tracking user interactions in React components
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import trackingService from '../services/trackingService';

// Type definitions
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  brand?: string;
}

interface PurchaseData {
  transaction_id: string;
  value: number;
  currency: string;
  payment_method?: string;
  transaction_type: 'purchase' | 'rental';
  items: Product[];
}

interface RentalData {
  rental_id: string;
  product_id: string;
  duration: string;
  value: number;
  currency: string;
}

export const useTracking = () => {
  const location = useLocation();

  // Automatically track page views when location changes
  useEffect(() => {
    trackingService.trackPageView(location.pathname);
  }, [location]);

  // Page tracking methods
  const trackPageView = useCallback((page?: string, title?: string, additionalData?: any) => {
    trackingService.trackPageView(page || location.pathname, title, additionalData);
  }, [location.pathname]);

  // Product tracking methods
  const trackProductView = useCallback((product: Product) => {
    trackingService.trackProductView(product);
  }, []);

  const trackProductList = useCallback((products: Product[], listName: string, listId?: string) => {
    trackingService.trackProductList(products, listName, listId);
  }, []);

  // Wishlist tracking methods
  const trackAddToWishlist = useCallback((product: Product) => {
    trackingService.trackAddToWishlist(product);
  }, []);

  const trackRemoveFromWishlist = useCallback((product: Product) => {
    trackingService.trackRemoveFromWishlist(product);
  }, []);

  // Checkout tracking methods
  const trackBeginCheckout = useCallback((product: Product, transactionType: 'purchase' | 'rental') => {
    trackingService.trackBeginCheckout(product, transactionType);
  }, []);

  const trackPurchase = useCallback((purchaseData: PurchaseData) => {
    trackingService.trackPurchase(purchaseData);
  }, []);

  const trackRental = useCallback((rentalData: RentalData) => {
    trackingService.trackRental(rentalData);
  }, []);

  // User tracking methods
  const trackSignUp = useCallback((method: 'phone' | 'email' = 'phone') => {
    trackingService.trackSignUp(method);
  }, []);

  const trackLogin = useCallback((method: 'phone' | 'email' = 'phone') => {
    trackingService.trackLogin(method);
  }, []);

  // Gaming-specific tracking methods
  const trackFlashSale = useCallback((action: 'view' | 'click' | 'purchase', product?: Product) => {
    trackingService.trackFlashSale(action, product);
  }, []);

  const trackWhatsAppContact = useCallback((productId?: string, contactType: 'rental' | 'purchase' | 'inquiry' = 'inquiry') => {
    trackingService.trackWhatsAppContact(productId, contactType);
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    trackingService.trackSearch(searchTerm, resultsCount);
  }, []);

  // Utility methods
  const trackCustomEvent = useCallback((eventName: string, parameters: any = {}) => {
    trackingService.trackCustomEvent(eventName, parameters);
  }, []);

  const setUserProperties = useCallback((properties: { [key: string]: any }) => {
    trackingService.setUserProperties(properties);
  }, []);

  const trackError = useCallback((error: string, context?: string) => {
    trackingService.trackError(error, context);
  }, []);

  return {
    // Page tracking
    trackPageView,
    
    // Product tracking
    trackProductView,
    trackProductList,
    
    // Wishlist tracking
    trackAddToWishlist,
    trackRemoveFromWishlist,
    
    // Checkout tracking
    trackBeginCheckout,
    trackPurchase,
    trackRental,
    
    // User tracking
    trackSignUp,
    trackLogin,
    
    // Gaming-specific tracking
    trackFlashSale,
    trackWhatsAppContact,
    trackSearch,
    
    // Utility methods
    trackCustomEvent,
    setUserProperties,
    trackError
  };
};