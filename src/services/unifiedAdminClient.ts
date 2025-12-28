/**
 * Unified Admin Client
 * 
 * This module serves as a unified interface for admin-related operations.
 * It wraps the adminService and provides additional caching and batching capabilities.
 */

import { adminCache } from './adminCache';

// Re-export types from adminService
export type {
  AdminStats,
  AdminNotification,
  Order,
  User,
  Product,
  Review,
  Banner,
  FlashSale,
  FeedPost,
  OrderDayStat,
  OrderStatusDayStat,
  TopProductStat
} from './adminService';

// Import adminService instance
const AdminService = require('./adminService').default || require('./adminService').AdminService;
const adminServiceInstance = AdminService ? new AdminService() : null;

// Additional type for dashboard stats (nested structure for V2)
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

// Legacy flat structure for backwards compatibility
export interface AdminDashboardStatsFlat {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews?: number;
  averageRating?: number;
  pendingOrders: number;
  completedOrders: number;
  todayOrders: number;
  todayRevenue: number;
  lastUpdated?: string;
}

// Type for order status time series
export interface OrderStatusTimeSeries {
  date: string;
  created: number;
  completed: number;
}

// Type for batch request
interface BatchRequestItem {
  id: string;
  endpoint: string;
  params?: Record<string, any>;
}

interface BatchRequestResult {
  [key: string]: any;
}

/**
 * Unified Admin Client class
 * Provides methods for admin operations with caching and batching support
 */
class UnifiedAdminClient {
  /**
   * Prefetch dashboard data for faster loading
   */
  async prefetchDashboardData(): Promise<void> {
    try {
      if (adminServiceInstance && adminServiceInstance.prefetchDashboardData) {
        await adminServiceInstance.prefetchDashboardData();
      }
    } catch (error) {
      console.warn('Error prefetching dashboard data:', error);
    }
  }

  /**
   * Batch request multiple endpoints for efficiency
   */
  async batchRequest(requests: BatchRequestItem[]): Promise<BatchRequestResult> {
    const results: BatchRequestResult = {};

    await Promise.all(
      requests.map(async (request) => {
        try {
          let data;
          
          switch (request.endpoint) {
            case 'dashboard-stats':
              data = await this.getDashboardStats();
              break;
            case 'recent-notifications':
              data = await this.getRecentNotifications(request.params?.limit || 5);
              break;
            case 'recent-orders':
              data = await this.getRecentOrders(request.params?.limit || 10);
              break;
            case 'orders-overview':
              data = await this.getOrdersOverview();
              break;
            default:
              console.warn(`Unknown endpoint: ${request.endpoint}`);
              data = null;
          }
          
          // Wrap data in .data property for compatibility
          results[request.id] = { data };
        } catch (error) {
          console.error(`Error in batch request for ${request.id}:`, error);
          results[request.id] = { data: null };
        }
      })
    );

    return results;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(options?: { skipCache?: boolean; backgroundRefresh?: boolean }): Promise<AdminDashboardStats | null> {
    try {
      if (!adminServiceInstance) return null;
      
      const stats = await adminServiceInstance.getAdminStats();
      
      // Map to nested AdminDashboardStats format
      return {
        orders: {
          count: stats.totalOrders || 0,
          completed: stats.completedOrders || 0,
          pending: stats.pendingOrders || 0,
          revenue: stats.totalRevenue || 0,
          completedRevenue: stats.totalRevenue || 0 // Using totalRevenue for now
        },
        users: {
          count: stats.totalUsers || 0
        },
        products: {
          count: stats.totalProducts || 0
        },
        flashSales: {
          count: stats.totalFlashSales || 0
        },
        reviews: {
          count: stats.totalReviews || 0,
          averageRating: stats.averageRating || 0
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return null;
    }
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limit: number = 5): Promise<any[]> {
    try {
      if (!adminServiceInstance) return [];
      
      const notifications = await adminServiceInstance.getRecentNotifications(limit);
      return notifications || [];
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      return [];
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<any[]> {
    try {
      if (!adminServiceInstance) return [];
      
      const result = await adminServiceInstance.getOrders(1, limit);
      return result.data || [];
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return [];
    }
  }

  /**
   * Get orders overview
   */
  async getOrdersOverview(): Promise<any> {
    try {
      if (!adminServiceInstance) return null;
      
      const stats = await adminServiceInstance.getAdminStats();
      return {
        totalOrders: stats.totalOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        completedOrders: stats.completedOrders || 0,
        todayOrders: stats.todayOrders || 0
      };
    } catch (error) {
      console.error('Error getting orders overview:', error);
      return null;
    }
  }

  /**
   * Get order status time series data
   */
  async getOrderStatusTimeSeries(params?: { 
    startDate?: string; 
    endDate?: string; 
    days?: number 
  }): Promise<OrderStatusTimeSeries[]> {
    try {
      if (!adminServiceInstance) return [];
      
      const series = await adminServiceInstance.getOrderStatusTimeSeries(params);
      return series || [];
    } catch (error) {
      console.error('Error getting order status time series:', error);
      return [];
    }
  }

  /**
   * Invalidate orders caches
   */
  invalidateOrdersCaches(): void {
    try {
      if (adminServiceInstance) {
        adminServiceInstance.invalidateCache('admin:orders');
      }
      adminCache.clear();
    } catch (error) {
      console.warn('Error invalidating orders caches:', error);
    }
  }

  /**
   * Invalidate users caches
   */
  invalidateUsersCaches(): void {
    try {
      if (adminServiceInstance) {
        adminServiceInstance.invalidateCache('admin:users');
      }
      adminCache.clear();
    } catch (error) {
      console.warn('Error invalidating users caches:', error);
    }
  }

  /**
   * Invalidate products caches
   */
  invalidateProductsCaches(): void {
    try {
      if (adminServiceInstance) {
        adminServiceInstance.invalidateCache('admin:products');
      }
      adminCache.clear();
    } catch (error) {
      console.warn('Error invalidating products caches:', error);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalBytes: 0,
      errors: 0,
      averageResponseTime: 0,
      egressSavings: 0
    };
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): any {
    return {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalBytes: 0,
      errors: 0,
      averageResponseTime: 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    // No-op for now as we don't track stats yet
  }

  /**
   * Get orders list
   */
  async getOrders(page: number = 1, limit: number = 20, status?: string, options?: { skipCache?: boolean }): Promise<any> {
    try {
      if (!adminServiceInstance) return { data: [], count: 0 };
      return await adminServiceInstance.getOrders(page, limit, status);
    } catch (error) {
      console.error('Error getting orders:', error);
      return { data: [], count: 0 };
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(page: number = 1, limit: number = 20, options?: { backgroundRefresh?: boolean }): Promise<any[]> {
    try {
      if (!adminServiceInstance) return [];
      return await adminServiceInstance.getNotifications(page, limit);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get users list
   */
  async getUsers(page: number = 1, limit: number = 20): Promise<any> {
    try {
      if (!adminServiceInstance) return { data: [], count: 0 };
      return await adminServiceInstance.getUsers(page, limit);
    } catch (error) {
      console.error('Error getting users:', error);
      return { data: [], count: 0 };
    }
  }

  /**
   * Get products list
   */
  async getProducts(page: number = 1, limit: number = 20): Promise<any> {
    try {
      if (!adminServiceInstance) return { data: [], count: 0 };
      return await adminServiceInstance.getProducts(page, limit);
    } catch (error) {
      console.error('Error getting products:', error);
      return { data: [], count: 0 };
    }
  }
}

// Create and export singleton instance
export const adminClient = new UnifiedAdminClient();

// Default export
export default adminClient;
