/**
 * Admin API Service
 * 
 * Simplified admin service that uses the /api/admin endpoint exclusively.
 * This endpoint has service role key access and bypasses RLS policies.
 * 
 * This is a complete refactor to fix persistent admin panel data issues.
 */

const API_BASE = '/api/admin';

// Types for admin data
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
  totalFlashSales?: number;
  activeFlashSales?: number;
}

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
  flashSales?: {
    count: number;
  };
  reviews?: {
    count: number;
    averageRating: number;
  };
}

export interface Order {
  id: string;
  customer_name: string;
  product_name?: string;
  amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  order_type: string;
  rental_duration?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  product_id?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method?: string;
  xendit_invoice_id?: string;
  client_external_id?: string;
  payment_data?: {
    xendit_id?: string;
    payment_method_type?: string;
    payment_status?: string;
    qr_url?: string;
    qr_string?: string;
    account_number?: string;
    bank_code?: string;
    payment_url?: string;
    payment_code?: string;
    retail_outlet?: string;
    created_at?: string;
    expiry_date?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  is_admin?: boolean;
  last_login_at?: string;
  is_active?: boolean;
  phone_verified?: boolean;
  profile_completed?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  image?: string;
  images?: string[];
  is_flash_sale?: boolean;
  flash_sale_end_time?: string;
  has_rental?: boolean;
  archived_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
}

// Helper function to make API calls
async function apiCall<T>(
  action: string,
  options: {
    method?: string;
    body?: any;
    params?: Record<string, string | number>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, params = {} } = options;
  
  // Build URL with query parameters
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  console.log(`[AdminAPI] ${method} ${url.pathname}${url.search}`);

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[AdminAPI] Error:', errorData);
    throw new Error(errorData.error || errorData.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[AdminAPI] Response:`, data);
  return data;
}

/**
 * Admin API Service Class
 */
class AdminApiService {
  /**
   * Get dashboard statistics
   * Converts the nested structure from API to flat structure expected by components
   */
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const apiStats = await apiCall<AdminDashboardStats>('dashboard-stats');
      
      // Convert nested API structure to flat structure
      return {
        totalOrders: apiStats.orders.count || 0,
        totalRevenue: apiStats.orders.revenue || 0,
        totalUsers: apiStats.users.count || 0,
        totalProducts: apiStats.products.count || 0,
        totalReviews: apiStats.reviews?.count || 0,
        averageRating: apiStats.reviews?.averageRating || 0,
        pendingOrders: apiStats.orders.pending || 0,
        completedOrders: apiStats.orders.completed || 0,
        totalFlashSales: apiStats.flashSales?.count || 0,
        activeFlashSales: 0, // Not provided by API
      };
    } catch (error) {
      console.error('[AdminApiService] Error fetching dashboard stats:', error);
      // Return zero stats instead of throwing to prevent UI crashes
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalReviews: 0,
        averageRating: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalFlashSales: 0,
        activeFlashSales: 0,
      };
    }
  }

  /**
   * Get orders with pagination and optional status filter
   */
  async getOrders(page: number = 1, limit: number = 20, status?: string): Promise<PaginatedResponse<Order>> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (status && status !== 'all') {
        params.status = status;
      }

      const response = await apiCall<PaginatedResponse<Order>>('orders', { params });
      return response;
    } catch (error) {
      console.error('[AdminApiService] Error fetching orders:', error);
      return { data: [], count: 0, page };
    }
  }

  /**
   * Get users with pagination and optional search
   */
  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<User>> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await apiCall<{ data: User[]; count: number; page: number }>('users', { params });
      return response;
    } catch (error) {
      console.error('[AdminApiService] Error fetching users:', error);
      return { data: [], count: 0, page };
    }
  }

  /**
   * Get products with pagination and optional search
   */
  async getProducts(page: number = 1, limit: number = 20, search?: string): Promise<PaginatedResponse<Product>> {
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await apiCall<PaginatedResponse<Product>>('products', { params });
      return response;
    } catch (error) {
      console.error('[AdminApiService] Error fetching products:', error);
      return { data: [], count: 0, page };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await apiCall('update-order', {
        method: 'POST',
        body: { orderId, status },
      });
      return true;
    } catch (error) {
      console.error('[AdminApiService] Error updating order status:', error);
      return false;
    }
  }

  /**
   * Clear stats cache (forces refresh on next request)
   */
  clearStatsCache(): void {
    // The API doesn't have client-side cache, so this is a no-op
    // Kept for compatibility with existing code
    console.log('[AdminApiService] Cache clear requested (no-op for API service)');
  }

  /**
   * Clear orders cache (forces refresh on next request)
   */
  clearOrdersCache(): void {
    // The API doesn't have client-side cache, so this is a no-op
    // Kept for compatibility with existing code
    console.log('[AdminApiService] Cache clear requested (no-op for API service)');
  }

  /**
   * Get product statistics
   * Returns aggregated stats about products
   */
  async getProductStats(): Promise<any> {
    // This is a placeholder - product stats aren't provided by the current API
    // Return empty stats for now
    return {
      total: 0,
      active: 0,
      inactive: 0,
      flashSale: 0,
    };
  }

  /**
   * Get categories
   * This method exists for compatibility but categories aren't part of the admin API yet
   */
  async getCategories(): Promise<any[]> {
    console.warn('[AdminApiService] Categories endpoint not implemented in API');
    return [];
  }

  /**
   * Get game titles
   * This method exists for compatibility but game titles aren't part of the admin API yet
   */
  async getGameTitles(): Promise<any[]> {
    console.warn('[AdminApiService] Game titles endpoint not implemented in API');
    return [];
  }

  /**
   * Get tiers
   * This method exists for compatibility but tiers aren't part of the admin API yet
   */
  async getTiers(): Promise<any[]> {
    console.warn('[AdminApiService] Tiers endpoint not implemented in API');
    return [];
  }

  /**
   * Update product fields
   * This method exists for compatibility but needs backend API implementation
   */
  async updateProductFields(id: string, fields: Partial<Pick<Product, 'price' | 'stock' | 'is_active'>>): Promise<Product | null> {
    console.error('[AdminApiService] updateProductFields not implemented - requires backend API endpoint');
    throw new Error('Product update not implemented in API service');
  }

  /**
   * Delete/archive product
   * This method exists for compatibility but needs backend API implementation
   */
  async deleteProduct(id: string): Promise<boolean> {
    console.error('[AdminApiService] deleteProduct not implemented - requires backend API endpoint');
    throw new Error('Product delete not implemented in API service');
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService();

// Export as default for compatibility
export default adminApiService;
