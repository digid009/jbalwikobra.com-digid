import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced types with better structure
export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image?: string;
  images?: string[];
  category: string;
  game_title?: string;
  account_level?: string;
  account_details?: string;
  is_flash_sale?: boolean;
  flash_sale_end_time?: string;
  has_rental?: boolean;
  stock: number;
  tier_id?: string;
  game_title_id?: string;
  is_active?: boolean;
  archived_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image: string;
  images: string[];
  category: string;
  game_title?: string;
  account_level?: string;
  account_details?: string;
  is_flash_sale: boolean;
  flash_sale_end_time?: string;
  has_rental: boolean;
  stock: number;
  created_at: string;
  updated_at?: string;
  tier_id?: string;
  game_title_id?: string;
  is_active: boolean;
  archived_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number; // renamed from total_amount to match DB
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  meta_data?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_admin: boolean;
  is_active: boolean;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
  meta_data?: Record<string, any>;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  product?: Product;
  user?: User;
  helpful_count?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  target_audience?: string[];
  meta_data?: Record<string, any>;
}

export interface FlashSale {
  id: string;
  product_id: string;
  sale_price: number;
  original_price: number;
  discount_percentage: number;
  start_time: string;
  end_time: string;
  stock: number;
  sold_count: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  product?: Product;
  meta_data?: Record<string, any>;
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  post_type: 'announcement' | 'news' | 'promotion' | 'tutorial' | 'other';
  is_active: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  author_id?: string;
  author_name: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  tags?: string[];
  meta_data?: Record<string, any>;
}

// Pagination and filtering types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Enhanced Admin Service with better error handling and caching
class EnhancedAdminService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache management
  private getCacheKey(operation: string, params?: any): string {
    return `${operation}_${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, customTtl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.CACHE_TTL
    });
  }

  private clearCacheByPattern(pattern: string): void {
    const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keys.forEach(key => this.cache.delete(key));
  }

  // Error handling wrapper
  private async handleApiCall<T>(
    operation: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error: any) {
      console.error(`${errorMessage}:`, error);
      return {
        success: false,
        error: error.message || errorMessage,
        message: error.message || errorMessage
      };
    }
  }

  // Dashboard Stats with enhanced metrics
  async getDashboardStats(): Promise<ApiResponse<AdminStats>> {
    const cacheKey = this.getCacheKey('dashboard_stats');
    const cached = this.getFromCache<AdminStats>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.handleApiCall(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { count: pendingOrders },
        { count: completedOrders },
        { count: todayOrders },
        ordersWithAmounts,
        todayOrdersWithAmounts,
        reviewsData
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
  supabase.from('orders').select('amount, status').in('status', ['paid', 'completed']),
  supabase.from('orders').select('amount').gte('created_at', today),
        supabase.from('reviews').select('rating')
      ]);

      const totalRevenue = ordersWithAmounts.data?.reduce((sum, order) => 
  sum + (Number(order.amount) || 0), 0) || 0;

      const todayRevenue = todayOrdersWithAmounts.data?.reduce((sum, order) => 
  sum + (Number(order.amount) || 0), 0) || 0;

      const averageRating = reviewsData.data?.length > 0
        ? reviewsData.data.reduce((sum, review) => sum + review.rating, 0) / reviewsData.data.length
        : 0;

      const stats: AdminStats = {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalReviews: reviewsData.data?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingOrders: pendingOrders || 0,
        completedOrders: completedOrders || 0,
        todayOrders: todayOrders || 0,
        todayRevenue
      };

      this.setCache(cacheKey, stats);
      return stats;
    }, 'Failed to fetch dashboard stats');
  }

  // Enhanced Products CRUD
  async getProducts(
    pagination: PaginationParams,
    filters: FilterParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const cacheKey = this.getCacheKey('products', { pagination, filters });
    const cached = this.getFromCache<PaginatedResponse<Product>>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.handleApiCall(async () => {
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('is_active', filters.status === 'active');
      }

      // Apply sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortOrder = pagination.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pagination.limit);
      const result: PaginatedResponse<Product> = {
        data: data || [],
        count: count || 0,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      };

      this.setCache(cacheKey, result);
      return result;
    }, 'Failed to fetch products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const cacheKey = this.getCacheKey('product', { id });
    const cached = this.getFromCache<Product>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.handleApiCall(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      this.setCache(cacheKey, data);
      return data;
    }, 'Failed to fetch product');
  }

  async createProduct(product: CreateProductData): Promise<ApiResponse<Product>> {
    return this.handleApiCall(async () => {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          image: product.image || '',
          images: product.images || [],
          category: product.category,
          game_title: product.game_title,
          account_level: product.account_level,
          account_details: product.account_details,
          is_flash_sale: product.is_flash_sale || false,
          flash_sale_end_time: product.flash_sale_end_time,
          has_rental: product.has_rental || false,
          stock: product.stock,
          tier_id: product.tier_id,
          game_title_id: product.game_title_id,
          is_active: product.is_active !== undefined ? product.is_active : true,
          archived_at: product.archived_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      this.clearCacheByPattern('products');
      return data;
    }, 'Failed to create product');
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.handleApiCall(async () => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      this.clearCacheByPattern('products');
      this.clearCacheByPattern('product');
      return data;
    }, 'Failed to update product');
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.handleApiCall(async () => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      this.clearCacheByPattern('products');
      this.clearCacheByPattern('product');
    }, 'Failed to delete product');
  }

  // Similar enhanced methods for Orders, Users, Reviews, Banners, FlashSales, and FeedPosts
  // ... (I'll implement the other CRUD methods following the same pattern)

  // Bulk operations
  async bulkUpdateProducts(ids: string[], updates: Partial<Product>): Promise<ApiResponse<Product[]>> {
    return this.handleApiCall(async () => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select();

      if (error) throw error;
      this.clearCacheByPattern('products');
      return data;
    }, 'Failed to bulk update products');
  }

  async bulkDeleteProducts(ids: string[]): Promise<ApiResponse<void>> {
    return this.handleApiCall(async () => {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) throw error;
      this.clearCacheByPattern('products');
    }, 'Failed to bulk delete products');
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const enhancedAdminService = new EnhancedAdminService();
