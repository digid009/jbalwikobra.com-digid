/**
 * Simple GTM Data Layer Helper
 * Much simpler approach - just push to dataLayer directly
 */

// Simple helper to ensure dataLayer exists
const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

// Simple tracking functions
export const simpleTracking = {
  
  // Track page views (automatic with GTM All Pages trigger)
  pageView: (pagePath?: string) => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath || window.location.pathname
    });
  },

  // Track product views
  productView: (product: any) => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'view_item',
      currency: 'IDR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: 'gaming_accounts',
        price: product.price,
        quantity: 1
      }]
    });
  },

  // Track purchases
  purchase: (orderData: {
    transaction_id: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
    }>
  }) => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'purchase',
      transaction_id: orderData.transaction_id,
      value: orderData.value,
      currency: 'IDR',
      items: orderData.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        category: 'gaming_accounts',
        quantity: 1,
        price: item.price
      }))
    });
  },

  // Track add to wishlist
  addToWishlist: (product: any) => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'add_to_wishlist',
      currency: 'IDR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: 'gaming_accounts',
        price: product.price
      }]
    });
  },

  // Track begin checkout
  beginCheckout: (product: any) => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'begin_checkout',
      currency: 'IDR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: 'gaming_accounts',
        price: product.price,
        quantity: 1
      }]
    });
  },

  // Track user signup
  signUp: () => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'sign_up',
      method: 'phone'
    });
  },

  // Track user login
  login: () => {
    ensureDataLayer();
    window.dataLayer.push({
      event: 'login',
      method: 'phone'
    });
  }
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).simpleTracking = simpleTracking;
}