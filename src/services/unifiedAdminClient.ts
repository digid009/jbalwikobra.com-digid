/**
 * Unified Admin API Client
 * 
 * Centralized API client untuk halaman admin dengan fokus pada:
 * - Optimalisasi Egress Supabase
 * - Smart Caching dengan adminCache
 * - Request Batching
 * - Intelligent Prefetching
 * - Error Handling dengan Fallback
 * - Monitoring dan Analytics
 */

import { adminCache } from './adminCache';

// Types untuk API responses
export interface AdminDashboardStats {
  orders: {
    count: number;
    completed: number;
    pending: number;
    revenue: number;
    completedRevenue: number;
  };
  users: {
    count: number;
  };
  products: {
    count: number;
  };
  flashSales: {
    count: number;
  };
  reviews: {
    count: number;
    averageRating: number;
  };
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name?: string;
  amount: number;
  status: string;
  order_type: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  is_active: boolean;
  is_flash_sale: boolean;
  flash_sale_price?: number;
  stock_quantity?: number;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'paid_order' | 'cancelled_order' | 'new_user' | 'low_stock';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export interface OrderStatusTimeSeries {
  date: string;
  pending: number;
  completed: number;
  cancelled: number;
  paid: number;
  total: number;
}

interface APIRequestOptions {
  skipCache?: boolean;
  timeout?: number;
  retries?: number;
  backgroundRefresh?: boolean;
}

interface BatchRequest {
  id: string;
  endpoint: string;
  params?: Record<string, any>;
}

class UnifiedAdminClient {
  private readonly BASE_URL = '/api/admin';
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private readonly CACHE_TTL = {
    DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
    ORDERS: 30 * 1000, // 30 seconds
    USERS: 5 * 60 * 1000, // 5 minutes
    PRODUCTS: 5 * 60 * 1000, // 5 minutes  
    NOTIFICATIONS: 15 * 1000, // 15 seconds
    TIME_SERIES: 5 * 60 * 1000, // 5 minutes
  };

  private stats = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    totalBytes: 0,
  };

  /**
   * Make API request with intelligent caching and error handling
   */
  private async apiRequest<T>(
    endpoint: string,
    options: APIRequestOptions = {}
  ): Promise<T> {
    const cacheKey = `admin:${endpoint}`;
    const { skipCache = false, timeout = this.DEFAULT_TIMEOUT, retries = 2 } = options;

    // Try cache first (unless skipped)
    if (!skipCache) {
      try {
        const cached = adminCache.get<T>(cacheKey);
        if (cached) {
          this.stats.cacheHits++;
          
          // Background refresh if requested
          if (options.backgroundRefresh) {
            this.refreshInBackground(endpoint, options);
          }
          
          return cached;
        }
      } catch (error) {
        console.warn(`Cache error for ${cacheKey}:`, error);
      }
    }

    // Make API request with retries
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.stats.apiCalls++;
        this.stats.cacheMisses++;
        
        const response = await this.fetchWithTimeout(endpoint, timeout);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Track response size for egress monitoring
        this.stats.totalBytes += JSON.stringify(data).length;

        // Cache the response
        this.setCacheWithTTL(cacheKey, data, endpoint);
        
        return data;
        
      } catch (error) {
        lastError = error as Error;
        this.stats.errors++;
        
        if (attempt < retries) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed, try to return stale cache if available
    try {
      const staleData = adminCache.getStale<T>(cacheKey);
      if (staleData) {
        console.warn(`Using stale data for ${endpoint} due to API failure`);
        return staleData;
      }
    } catch (error) {
      // Ignore cache errors
    }

    throw lastError!;
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(endpoint: string, timeout: number): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.BASE_URL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Set cache with appropriate TTL based on endpoint
   */
  private setCacheWithTTL(cacheKey: string, data: any, endpoint: string): void {
    let ttl = this.CACHE_TTL.DASHBOARD_STATS; // default

    if (endpoint.includes('dashboard')) {
      ttl = this.CACHE_TTL.DASHBOARD_STATS;
    } else if (endpoint.includes('orders')) {
      ttl = this.CACHE_TTL.ORDERS;
    } else if (endpoint.includes('users')) {
      ttl = this.CACHE_TTL.USERS;
    } else if (endpoint.includes('products')) {
      ttl = this.CACHE_TTL.PRODUCTS;
    } else if (endpoint.includes('notifications')) {
      ttl = this.CACHE_TTL.NOTIFICATIONS;
    } else if (endpoint.includes('time-series')) {
      ttl = this.CACHE_TTL.TIME_SERIES;
    }

    adminCache.set(cacheKey, data, ttl);
  }

  /**
   * Background refresh for hot data
   */
  private async refreshInBackground(endpoint: string, options: APIRequestOptions): Promise<void> {
    try {
      await this.apiRequest(endpoint, { ...options, skipCache: true, backgroundRefresh: false });
    } catch (error) {
      // Silent fail for background refreshes
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===================== PUBLIC API METHODS =====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(options: APIRequestOptions = {}): Promise<AdminDashboardStats> {
    return this.apiRequest<AdminDashboardStats>('?action=dashboard', {
      backgroundRefresh: true,
      ...options
    });
  }

  /**
   * Get orders with pagination and filtering
   */
  async getOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    options: APIRequestOptions = {}
  ): Promise<{ data: AdminOrder[]; count: number; page: number }> {
    const params = new URLSearchParams({
      action: 'orders',
      page: page.toString(),
      limit: limit.toString(),
      ...(status && status !== 'all' && { status })
    });

    const endpoint = `?${params.toString()}`;
    return this.apiRequest<{ data: AdminOrder[]; count: number; page: number }>(
      endpoint,
      options
    );
  }

  /**
   * Get users with pagination and search
   */
  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    options: APIRequestOptions = {}
  ): Promise<{ data: AdminUser[]; count: number; page: number }> {
    const params = new URLSearchParams({
      action: 'users',
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const endpoint = `?${params.toString()}`;
    return this.apiRequest<{ data: AdminUser[]; count: number; page: number }>(
      endpoint,
      options
    );
  }

  /**
   * Get products with pagination and search
   */
  async getProducts(
    page: number = 1,
    limit: number = 20,
    search?: string,
    options: APIRequestOptions = {}
  ): Promise<{ data: AdminProduct[]; count: number; page: number }> {
    const params = new URLSearchParams({
      action: 'products',
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const endpoint = `?${params.toString()}`;
    return this.apiRequest<{ data: AdminProduct[]; count: number; page: number }>(
      endpoint,
      options
    );
  }

  /**
   * Get notifications (optimized for real-time updates)
   */
  async getNotifications(
    page: number = 1,
    limit: number = 10,
    options: APIRequestOptions = {}
  ): Promise<AdminNotification[]> {
    const params = new URLSearchParams({
      action: 'notifications',
      page: page.toString(),
      limit: limit.toString()
    });

    const endpoint = `?${params.toString()}`;
    const result = await this.apiRequest<{ data: AdminNotification[] }>(
      endpoint,
      { backgroundRefresh: true, ...options }
    );

    return result.data || [];
  }

  /**
   * Get order status time series data
   */
  async getOrderStatusTimeSeries(
    options: { days?: number; startDate?: string; endDate?: string } = {},
    requestOptions: APIRequestOptions = {}
  ): Promise<OrderStatusTimeSeries[]> {
    try {
      const params = new URLSearchParams({
        action: 'time-series',
        ...(options.days && { days: options.days.toString() }),
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate })
      });

      const endpoint = `?${params.toString()}`;
      console.log('Requesting time-series data from:', endpoint);
      
      const result = await this.apiRequest<{ data: OrderStatusTimeSeries[] }>(
        endpoint,
        requestOptions
      );

      console.log('Time-series result:', result);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching time-series data:', error);
      return [];
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}?action=update-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }

      // Invalidate related caches
      this.invalidateOrdersCaches();

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Batch request multiple endpoints
   */
  async batchRequest(requests: BatchRequest[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    // Execute requests in parallel (with reasonable concurrency limit)
    const chunks = this.chunkArray(requests, 5);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (req) => {
        try {
          const params = new URLSearchParams({
            action: req.endpoint,
            ...req.params
          });
          const data = await this.apiRequest(`?${params.toString()}`);
          return { id: req.id, data, error: null };
        } catch (error) {
          return { id: req.id, data: null, error };
        }
      });

      const chunkResults = await Promise.all(promises);
      
      chunkResults.forEach(({ id, data, error }) => {
        results[id] = { data, error };
      });
    }

    return results;
  }

  /**
   * Smart prefetch for admin dashboard
   */
  async prefetchDashboardData(): Promise<void> {
    const prefetchRequests = [
      { id: 'stats', endpoint: 'dashboard' },
      { id: 'recent-orders', endpoint: 'orders', params: { limit: '5' } },
      { id: 'notifications', endpoint: 'notifications', params: { limit: '5' } }
    ];

    // Execute prefetch in background
    this.batchRequest(prefetchRequests).catch(error => {
      console.warn('Prefetch failed:', error);
    });
  }

  /**
   * Clear specific cache patterns
   */
  invalidateOrdersCaches(): void {
    adminCache.invalidatePattern('admin:?action=orders');
    adminCache.invalidatePattern('admin:?action=dashboard');
    adminCache.invalidatePattern('admin:?action=time-series');
  }

  invalidateUsersCaches(): void {
    adminCache.invalidatePattern('admin:?action=users');
    adminCache.invalidatePattern('admin:?action=dashboard');
  }

  invalidateProductsCaches(): void {
    adminCache.invalidatePattern('admin:?action=products');
    adminCache.invalidatePattern('admin:?action=dashboard');
  }

  /**
   * Get performance statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Reset performance statistics
   */
  resetStats(): void {
    this.stats = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      totalBytes: 0,
    };
  }

  /**
   * Utility function to chunk arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Global instance
export const adminClient = new UnifiedAdminClient();

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).adminClient = adminClient;
}

export default adminClient;
