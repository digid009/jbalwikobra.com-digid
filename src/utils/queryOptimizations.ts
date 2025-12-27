/**
 * Query Optimization Constants
 * 
 * This file contains optimized field lists for Supabase queries to reduce cache egress.
 * Using explicit field lists instead of SELECT * can reduce data transfer by 60-80%.
 */

/**
 * Common field selections for products table
 */
export const PRODUCT_FIELDS = {
  // Minimal fields for lists and cards
  LIST: 'id, name, price, original_price, image, is_active, stock, created_at',
  
  // Fields for product cards with tier/game info
  CARD: 'id, name, price, original_price, image, images, is_active, stock, has_rental, tier_id, game_title_id',
  
  // Full product details (avoid in lists)
  FULL: 'id, name, description, price, original_price, image, images, is_active, stock, created_at, updated_at, category_id, game_title_id, tier_id, has_rental, archived_at',
  
  // Admin view with all necessary fields
  ADMIN: 'id, name, description, price, original_price, image, images, is_active, stock, created_at, updated_at, category_id, game_title_id, tier_id, has_rental, archived_at',
} as const;

/**
 * Common field selections for orders table
 */
export const ORDER_FIELDS = {
  // Minimal for counts and stats
  STATS: 'id, status, amount, created_at',
  
  // List view fields
  LIST: 'id, customer_name, customer_email, customer_phone, amount, status, payment_method, created_at, product_id, user_id',
  
  // Full order details
  FULL: 'id, customer_name, customer_email, customer_phone, amount, status, payment_method, created_at, updated_at, product_id, user_id, order_type, rental_duration, xendit_invoice_id, admin_notes, client_external_id',
} as const;

/**
 * Common field selections for users table
 */
export const USER_FIELDS = {
  // Minimal for lists
  LIST: 'id, email, name, phone, created_at, is_admin, is_active',
  
  // With additional status fields
  ADMIN: 'id, email, name, avatar_url, phone, created_at, is_admin, last_login, is_active, phone_verified',
  
  // Profile view
  PROFILE: 'id, email, name, avatar_url, phone, created_at, last_login, phone_verified',
} as const;

/**
 * Common field selections for reviews table
 */
export const REVIEW_FIELDS = {
  LIST: 'id, product_id, user_id, rating, comment, created_at',
  FULL: 'id, product_id, user_id, rating, comment, created_at, updated_at',
} as const;

/**
 * Common field selections for notifications table
 */
export const NOTIFICATION_FIELDS = {
  LIST: 'id, type, title, message, is_read, created_at',
  FULL: 'id, type, title, message, description, is_read, created_at, metadata',
} as const;

/**
 * Default pagination limits to prevent unbounded queries
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * Cache durations in seconds for different data types
 */
export const CACHE_DURATION = {
  // Static data - cache longer
  PRODUCTS: 300,        // 5 minutes
  CATEGORIES: 600,      // 10 minutes
  GAME_TITLES: 600,     // 10 minutes
  TIERS: 600,           // 10 minutes
  SETTINGS: 600,        // 10 minutes
  
  // Semi-static data
  USERS: 120,           // 2 minutes
  REVIEWS: 180,         // 3 minutes
  
  // Dynamic data - cache briefly
  ORDERS: 60,           // 1 minute
  STATS: 60,            // 1 minute
  NOTIFICATIONS: 30,    // 30 seconds
  
  // Real-time data - no cache
  PAYMENT_STATUS: 0,
  ORDER_UPDATES: 0,
} as const;

/**
 * Helper to enforce pagination limits
 */
export function sanitizePagination(page?: number, limit?: number): { page: number; limit: number } {
  const safePage = Math.max(PAGINATION.MIN_LIMIT, Math.floor(page || 1));
  const safeLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(PAGINATION.MIN_LIMIT, Math.floor(limit || PAGINATION.DEFAULT_LIMIT))
  );
  return { page: safePage, limit: safeLimit };
}

/**
 * Helper to calculate range for pagination
 */
export function getPaginationRange(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Helper to generate cache key for queries
 */
export function generateCacheKey(table: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  return `${table}:${sortedParams}`;
}
