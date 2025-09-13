import { createClient } from '@supabase/supabase-js';
import { adminCache } from './adminCache';
import { ordersService } from './ordersService';
import { dbRowToDomainProduct } from './mappers/productMapper';

// Use service role key from environment variables for admin operations
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

console.log('AdminService: Using', serviceKey.includes('service_role') ? 'service role key' : 'anonymous key', 'for database access');

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
  totalFlashSales: number;
  activeFlashSales: number;
}

export interface Order {
  id: string;
  customer_name: string;
  product_name?: string; // Derived from product_id lookup
  amount: number;
  // Expanded status union to align with broader system usage (paid & processing etc.)
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  order_type: string; // 'purchase' etc.
  created_at: string;
  updated_at: string;
  user_id?: string;
  product_id?: string; // Actual column in DB
  customer_email?: string; // Actual column in DB
  customer_phone?: string; // Actual column in DB
  payment_method?: string;
  xendit_invoice_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  is_admin?: boolean;
  last_login?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  game_title?: string;
  account_level?: string;
  account_details?: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  image?: string;
  images?: string[];
  tier?: string;
  tier_id?: string;
  game_title_id?: string;
  is_flash_sale?: boolean;
  flash_sale_end_time?: string;
  has_rental?: boolean;
  archived_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  product_name?: string;
  user_name?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashSale {
  id: string;
  product_id: string;
  sale_price: number;
  original_price: number;
  start_time: string;
  end_time: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  product?: Product;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

export interface FeedPost {
  id: string;
  user_id: string;
  type: 'post' | 'announcement';
  product_id?: string | null;
  title?: string | null;
  content: string;
  rating?: number | null;
  image_url?: string | null;
  likes_count: number;
  comments_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  // Optional computed fields
  author_name?: string;
  views?: number;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'paid_order' | 'cancelled_order' | 'new_user' | 'new_review';
  title: string;
  message: string;
  order_id?: string;
  user_id?: string;
  product_name?: string;
  amount?: number;
  created_at: string;
  is_read: boolean;
}

// Dashboard analytics helper types
export interface OrderDayStat {
  date: string; // YYYY-MM-DD
  count: number;
  revenue: number;
}

export interface OrderStatusDayStat {
  date: string; // YYYY-MM-DD
  created: number;
  completed: number;
}

export interface TopProductStat {
  product_id: string | null;
  product_name: string;
  count: number;
  revenue: number;
}

class AdminService {
  // Dashboard Stats
  async getDashboardStats(): Promise<AdminStats> {
    try {
      // Get orders stats from the working service
      const orderStats = await ordersService.getOrderStats();
      
      // Get other stats in parallel
      const [
        { count: totalUsers },
  { count: totalProducts }
      ] = await Promise.all([
  supabase.from('users').select('id', { count: 'exact', head: true }),
  supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      // Updated business rule: totalReviews represents count of paid + completed orders
      let totalReviews = 0;
      let averageRating = 0; // Keep averageRating legacy computation if reviews table exists
      try {
        const [paidCompletedOrders, reviewsWithRating] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['paid', 'completed']),
          supabase.from('reviews').select('rating')
        ]);
        totalReviews = paidCompletedOrders.count || 0;
        if (reviewsWithRating.data?.length) {
          averageRating = reviewsWithRating.data.reduce((sum, r) => sum + (r as any).rating, 0) / reviewsWithRating.data.length;
        }
      } catch (e) {
        // fallback silently
      }

      // Get flash sales data
      let totalFlashSales = 0;
      let activeFlashSales = 0;
      try {
        const { count: totalFlashSalesCount } = await supabase
          .from('flash_sales')
          .select('*', { count: 'exact', head: true });
        
        const { count: activeFlashSalesCount } = await supabase
          .from('flash_sales')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
          
        totalFlashSales = totalFlashSalesCount || 0;
        activeFlashSales = activeFlashSalesCount || 0;
      } catch (e) {
        // fallback silently
      }

      return {
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingOrders: orderStats.pendingOrders,
        completedOrders: orderStats.completedOrders,
        totalFlashSales,
        activeFlashSales
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
        activeFlashSales: 0
      };
    }
  }

  // Orders Management
  async getOrders(page = 1, limit = 20, status?: string): Promise<{ data: Order[], count: number }> {
    try {
      // Use the actual database columns we confirmed exist
      let query = supabase
        .from('orders')
        .select('id, product_id, customer_name, customer_email, customer_phone, order_type, amount, status, user_id, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Orders query error:', error);
        throw error;
      }

      // Map to Order interface with actual data
      const productIds = Array.from(new Set((data||[]).map((d:any)=>d.product_id).filter(Boolean)));
      let productsMap: Record<string,string> = {};
      if (productIds.length) {
        const { data: prodData } = await supabase.from('products').select('id,name').in('id', productIds);
        productsMap = (prodData||[]).reduce((acc:any,p:any)=>{acc[p.id]=p.name;return acc;},{});
      }

      const orders: Order[] = (data || []).map((item: any) => ({
        id: item.id,
        customer_name: item.customer_name || 'Unknown Customer',
        product_name: item.product_id ? productsMap[item.product_id] : undefined,
        amount: item.amount || 0,
        status: item.status || 'pending',
        order_type: item.order_type || 'purchase',
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id,
        product_id: item.product_id,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        payment_method: null, // Not in current schema
        xendit_invoice_id: null // Not in current schema
      }));

      return { data: orders, count: count || 0 };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], count: 0 };
    }
  }

  async completeOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('orders').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', orderId);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('completeOrder error', e);
      return false;
    }
  }

  // Users Management
  async getUsers(page = 1, limit = 20, search?: string): Promise<{ data: User[], count: number }> {
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], count: 0 };
    }
  }

  // Products Management (see unified implementation later in file)

  // Reviews Management
  async getReviews(page = 1, limit = 20): Promise<{ data: Review[], count: number }> {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const reviews: Review[] = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        user_id: item.user_id,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at,
        product_name: item.product_name,
        user_name: item.user_name
      }));

      return { data: reviews, count: count || 0 };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { data: [], count: 0 };
    }
  }

  // Banners Management
  async getBanners(): Promise<Banner[]> {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  }

  // Flash Sales Management
  async getFlashSales(): Promise<FlashSale[]> {
    try {
      const { data, error } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        product: item.products
      }));
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      return [];
    }
  }

  // Feed Posts Management
  async getFeedPosts(limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          users!inner(name)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        type: post.type || 'post',
        author_name: post.users?.name || 'Unknown',
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        is_deleted: post.is_deleted || false,
        created_at: post.created_at,
        image_url: post.image_url,
        user_id: post.user_id,
      }));
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
  }

  // Notifications for real-time admin alerts
  async getRecentNotifications(limit = 10): Promise<AdminNotification[]> {
    try {
      // Get recent orders for notifications
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          users(name),
          products(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      const notifications: AdminNotification[] = (recentOrders || []).map((order: any) => {
        let type: AdminNotification['type'] = 'new_order';
        let title = 'New Order';
        
        if (order.status === 'paid') {
          type = 'paid_order';
          title = 'Order Paid';
        } else if (order.status === 'cancelled') {
          type = 'cancelled_order';
          title = 'Order Cancelled';
        }

        return {
          id: `order-${order.id}`,
          type,
          title,
          message: `Order #${order.id.slice(-8)} - ${order.products?.name || 'Unknown Product'}`,
          order_id: order.id,
          product_name: order.products?.name,
          amount: order.total_amount,
          created_at: order.created_at,
          is_read: false
        };
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Search functionality
  async searchAll(query: string): Promise<{
    orders: Order[];
    users: User[];
    products: Product[];
  }> {
    try {
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        this.getOrders(1, 5),
        this.getUsers(1, 5, query),
        this.getProducts(1, 5, query)
      ]);

      return {
        orders: ordersResult.data,
        users: usersResult.data,
        products: productsResult.data
      };
    } catch (error) {
      console.error('Error searching:', error);
      return {
        orders: [],
        users: [],
        products: []
      };
    }
  }

  // Lightweight delegator to unified implementation later (kept for backward compatibility inside class context)
  async getProducts(page = 1, limit = 20, search?: string, sort?: { column: string; direction: 'asc'|'desc' }): Promise<{ data: Product[], count: number }> {
    // Reuse global instance method after class instantiation if available; fallback simple query
    try {
      let queryBuilder = supabase.from('products').select('*', { count: 'exact' })
        .order(sort?.column || 'created_at', { ascending: sort ? sort.direction === 'asc' : false })
        .range((page - 1) * limit, page * limit - 1);
      if (search) {
        queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      const { data, error, count } = await queryBuilder;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (e) {
      console.error('[AdminService.class.getProducts] fallback error', e);
      return { data: [], count: 0 };
    }
  }

  // Create sample reviews for initial setup
  async createSampleReviews(): Promise<void> {
    try {
      // Get some users and products to create reviews for
      const { data: users } = await supabase.from('users').select('id, name').limit(5);
      const { data: products } = await supabase.from('products').select('id, name').eq('is_active', true).limit(3);

      if (!users?.length || !products?.length) {
        throw new Error('Need users and products to create sample reviews');
      }

      const sampleReviews = [];
      const comments = [
        'Produk sangat bagus! Kualitas premium dan pelayanan memuaskan.',
        'Rekomendasi banget! Akun game nya legit dan proses cepat.',
        'Pelayanan ramah, akun sesuai deskripsi. Puas dengan pembelian ini.',
        'Good seller, trusted! Akun game berkualitas tinggi.',
        'Terima kasih, produk sesuai ekspektasi. Akan beli lagi di sini.',
        'Fast response dan barang original. Highly recommended!',
        'Seller terpercaya, akun game work perfect. Thank you!',
        'Pengalaman berbelanja yang menyenangkan. Top quality!',
        'Sesuai dengan deskripsi, packaging rapi. Mantap!',
        'Service excellent, produk berkualitas. Will order again!'
      ];

      // Create sample reviews
      for (let i = 0; i < 10; i++) {
        const user = users[i % users.length];
        const product = products[i % products.length];
        
        sampleReviews.push({
          user_id: user.id,
          product_id: product.id,
          rating: Math.floor(Math.random() * 2) + 4, // Rating 4-5 for better demo
          comment: comments[i % comments.length],
          is_verified: Math.random() < 0.7, // 70% verified
          helpful_count: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Try to create via direct table access
      const { error } = await supabase.from('reviews').insert(sampleReviews);

      if (error) {
        // If direct insert fails, we might need to create table first
        // This would normally be done via database admin console
        console.log('Note: Reviews table may need to be created via Supabase console');
        console.log('Table structure needed:', {
          id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
          user_id: 'UUID REFERENCES users(id)',
          product_id: 'UUID REFERENCES products(id)', 
          rating: 'INTEGER CHECK (rating >= 1 AND rating <= 5)',
          comment: 'TEXT',
          is_verified: 'BOOLEAN DEFAULT false',
          helpful_count: 'INTEGER DEFAULT 0',
          created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
          updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
        });
        throw error;
      }

      console.log('Sample reviews created successfully!');
    } catch (error) {
      console.error('Error creating sample reviews:', error);
      throw error;
    }
  }
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lastUpdated?: string;
}

export interface OrderItem {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface UserItem {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export const adminService = {
  async completeOrder(orderId: string) {
    const service = new AdminService();
    return service.completeOrder(orderId);
  },
  async getAdminStats(): Promise<AdminStats> {
    return adminCache.getOrFetch('admin:stats', async () => {
      try {
        // Get all stats in parallel
        const [
          { count: totalUsers },
          { count: totalProducts },
          { count: totalOrders },
          { count: pendingOrders },
          { count: completedOrders },
          ordersWithAmounts
        ] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('orders').select('amount')
        ]);

        // Try to get reviews (might not exist)
        let totalReviews = 0;
        let averageRating = 0;
        
        try {
          const [
            { count: reviewCount },
            reviewsWithRating
          ] = await Promise.all([
            supabase.from('reviews').select('id', { count: 'exact', head: true }),
            supabase.from('reviews').select('rating')
          ]);
          
          totalReviews = reviewCount || 0;
          averageRating = reviewsWithRating.data?.length > 0
            ? reviewsWithRating.data.reduce((sum, review) => sum + review.rating, 0) / reviewsWithRating.data.length
            : 0;
        } catch (reviewError) {
          // Silent fallback if reviews table missing
        }

        // Calculate revenue - only from paid and completed orders
        let totalRevenue = 0;
        if (ordersWithAmounts.data) {
          const { data: ordersWithStatus, error: statusError } = await supabase
            .from('orders')
            .select('amount, status')
            .in('status', ['paid', 'completed']);
          
          if (!statusError && ordersWithStatus) {
            totalRevenue = ordersWithStatus.reduce((sum, order) => 
              sum + (Number(order.amount) || 0), 0);
          }
        }

        // Get flash sales data
        let totalFlashSales = 0;
        let activeFlashSales = 0;
        try {
          const [
            { count: totalFlashSalesCount },
            { count: activeFlashSalesCount }
          ] = await Promise.all([
            supabase.from('flash_sales').select('id', { count: 'exact', head: true }),
            supabase.from('flash_sales').select('id', { count: 'exact', head: true }).eq('is_active', true)
          ]);
          
          totalFlashSales = totalFlashSalesCount || 0;
          activeFlashSales = activeFlashSalesCount || 0;
        } catch (flashSalesError) {
          // Silent fallback if flash_sales table missing
        }

        return {
          totalOrders: totalOrders || 0,
          totalRevenue,
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
          totalFlashSales,
          activeFlashSales
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
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
          activeFlashSales: 0
        };
      }
    });
  },

  async getOrders(page: number = 1, limit: number = 10, statusFilter?: string): Promise<PaginatedResponse<Order>> {
    // Orders table is empty but structure exists, need to handle gracefully
    return adminCache.getOrFetch(`admin:orders:${page}:${limit}:${statusFilter || 'all'}`, async () => {
      // Since orders table is empty, let's use basic columns that should exist
      const basicOrderColumns = ['id','created_at'];
      
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' }); // Use * since table is empty anyway

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      console.log('[adminService.getOrders] querying (table currently empty)');
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('[adminService.getOrders] query error:', error);
        throw error;
      }

      const rows = data || [];
      console.log('[adminService.getOrders] success:', { rows: rows.length, count });

      // Map to Order interface with safe fallbacks
      const mapped: Order[] = rows.map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name || 'Unknown Customer',
        product_name: o.product_name || 'Product Order',
        amount: Number(o.amount) || 0,
        status: o.status || 'pending',
        order_type: o.order_type || 'purchase',
        created_at: o.created_at,
        updated_at: o.updated_at,
        user_id: o.user_id,
        product_id: o.product_id,
        customer_email: o.customer_email,
        customer_phone: o.customer_phone,
        payment_method: o.payment_method,
        xendit_invoice_id: o.xendit_invoice_id
      }));

      return {
        data: mapped,
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },  async getUsers(page: number = 1, limit: number = 10, searchTerm?: string): Promise<PaginatedResponse<User>> {
    return adminCache.getOrFetch(`admin:users:${page}:${limit}:${searchTerm || ''}`, async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },

  async getProducts(page: number = 1, limit: number = 10, searchTerm?: string, sort?: { column: string; direction: 'asc'|'desc' }): Promise<PaginatedResponse<Product>> {
    const sortKey = sort ? `${sort.column}:${sort.direction}` : 'created_at:desc';
    return adminCache.getOrFetch(`admin:products:${page}:${limit}:${searchTerm || ''}:${sortKey}`, async () => {
      // Use LEFT JOIN with tiers and game_titles to get all products
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, category, tier_id, game_title, game_title_id,
          account_level, account_details, stock, is_active, image, images, created_at, updated_at, archived_at,
          is_flash_sale, flash_sale_end_time, has_rental,
          tiers (
            id, name, slug, color, background_gradient, icon
          ),
          game_titles (
            id, name, slug, icon, logo_url
          )
        `, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const orderColumn = sort?.column || 'created_at';
      const ascending = sort ? sort.direction === 'asc' : false;
      console.log('[adminService.getProducts] using actual schema columns with sort', { orderColumn, ascending });
      const { data, error, count } = await query
        .order(orderColumn, { ascending })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('[adminService.getProducts] query error:', error);
        throw error;
      }

      const rows = data || [];
      console.log('[adminService.getProducts] success:', { rows: rows.length, count });

      const mapped = rows.map((row: any) => dbRowToDomainProduct(row) as unknown as Product);

      return {
        data: mapped,
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },  async getReviews(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> {
    return adminCache.getOrFetch(`admin:reviews:${page}:${limit}`, async () => {
      try {
        const { data, error, count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;
        
        const mapped: Review[] = (data || []).map((r: any) => ({
          id: r.id,
            product_id: r.product_id,
            user_id: r.user_id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            product_name: r.product_name,
            user_name: r.user_name
        }));

        return {
          data: mapped,
          count: count || 0,
          page,
          totalPages: Math.ceil((count || 0) / limit)
        };
      } catch (error) {
        console.log('Reviews table not found');
        return {
          data: [],
          count: 0,
          page,
          totalPages: 0
        };
      }
    });
  },

  async getFlashSales(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FlashSale>> {
    return adminCache.getOrFetch(`admin:flash-sales:${page}:${limit}`, async () => {
      const { data, error, count } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products(name, price, image)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },

  async createFlashSale(flashSaleData: {
    product_id: string;
    original_price: number;
    sale_price: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    stock?: number;
  }): Promise<FlashSale> {
    const { data, error } = await supabase
      .from('flash_sales')
      .insert([{
        product_id: flashSaleData.product_id,
        original_price: flashSaleData.original_price,
        sale_price: flashSaleData.sale_price,
        start_time: flashSaleData.start_time,
        end_time: flashSaleData.end_time,
        is_active: flashSaleData.is_active,
        stock: flashSaleData.stock || 10,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        products(name, price, image)
      `)
      .single();

    if (error) throw error;
    
    // Clear cache after creating
    adminCache.clear();
    
    return data;
  },

  async getBanners(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Banner>> {
    return adminCache.getOrFetch(`admin:banners:${page}:${limit}`, async () => {
      const { data, error, count } = await supabase
        .from('banners')
        .select('*', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },

  async createBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
      .single();

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
    
    return data;
  },

  async updateBanner(id: string, updates: Partial<Omit<Banner, 'id' | 'created_at' | 'updated_at'>>): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
    
    return data;
  },

  async deleteBanner(id: string): Promise<void> {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
  },

  async toggleBannerStatus(id: string): Promise<Banner> {
    // First get current status
    const { data: currentBanner, error: fetchError } = await supabase
      .from('banners')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle status
    const { data, error } = await supabase
      .from('banners')
      .update({ 
        is_active: !currentBanner.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
    
    return data;
  },

  async reorderBanners(bannerIds: string[]): Promise<void> {
    // Update sort_order for each banner
    const updates = bannerIds.map((id, index) => ({
      id,
      sort_order: index + 1,
      updated_at: new Date().toISOString()
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('banners')
        .update({ sort_order: update.sort_order, updated_at: update.updated_at })
        .eq('id', update.id);

      if (error) throw error;
    }
    
    // Clear cache
    adminCache.clear();
  },

  async getFeedPosts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FeedPost>> {
    return adminCache.getOrFetch(`admin:feed-posts:${page}:${limit}`, async () => {
      const { data, error, count } = await supabase
        .from('feed_posts')
        .select(`
          *,
          users:user_id (
            name
          )
        `, { count: 'exact' })
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      // Add computed author_name field
      const postsWithAuthor = (data || []).map(post => ({
        ...post,
        author_name: post.users?.name || 'Unknown User'
      }));
      
      return {
        data: postsWithAuthor,
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    });
  },

  async deleteFeedPost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    
    // Clear cache for feed posts
    adminCache.clear();
  },

  // ----- Dashboard Analytics -----
  async getOrdersTimeSeries(params?: { startDate?: string; endDate?: string; days?: number }): Promise<OrderDayStat[]> {
    try {
      const days = params?.days || 7;
      const end = params?.endDate ? new Date(params.endDate) : new Date();
      const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
      const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).toISOString();

      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, amount, status')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (error) {
        console.warn('getOrdersTimeSeries error', error);
        // Return empty buckets on error
        const buckets: OrderDayStat[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().slice(0, 10);
          buckets.push({ date: key, count: 0, revenue: 0 });
        }
        return buckets;
      }

      // Group by date
      const dailyStats: Record<string, { count: number; revenue: number }> = {};
      
      // Initialize all days with zero values
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        dailyStats[key] = { count: 0, revenue: 0 };
      }

      // Process orders - only count paid and completed for revenue
      (orders || []).forEach(order => {
        const orderDate = new Date(order.created_at);
        const dateKey = orderDate.toISOString().slice(0, 10);
        
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].count += 1;
          
          // Only include revenue for paid and completed orders
          if (order.status === 'paid' || order.status === 'completed') {
            dailyStats[dateKey].revenue += Number(order.amount) || 0;
          }
        }
      });

      return Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error in getOrdersTimeSeries:', error);
      // Return empty buckets on error
      const days = params?.days || 7;
      const end = params?.endDate ? new Date(params.endDate) : new Date();
      const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      
      const buckets: OrderDayStat[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        buckets.push({ date: key, count: 0, revenue: 0 });
      }
      return buckets;
    }
  },

  // Get order created vs completed analytics
  async getOrderStatusTimeSeries(params?: { startDate?: string; endDate?: string; days?: number }): Promise<OrderStatusDayStat[]> {
    try {
      const days = params?.days || 7;
      const end = params?.endDate ? new Date(params.endDate) : new Date();
      const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      
      const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
      const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1).toISOString();

      // Get all orders within date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, updated_at, status')
        .gte('created_at', startISO)
        .lt('created_at', endISO);

      if (error) {
        console.warn('getOrderStatusTimeSeries error', error);
        // Return empty buckets on error
        const buckets: OrderStatusDayStat[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().slice(0, 10);
          buckets.push({ date: key, created: 0, completed: 0 });
        }
        return buckets;
      }

      // Group by date
      const dailyStats: Record<string, { created: number; completed: number }> = {};
      
      // Initialize all days with zero values
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        dailyStats[key] = { created: 0, completed: 0 };
      }

      // Process orders
      (orders || []).forEach(order => {
        const createdDate = new Date(order.created_at);
        const createdDateKey = createdDate.toISOString().slice(0, 10);
        
        // Count all orders as "created" on their creation date
        if (dailyStats[createdDateKey]) {
          dailyStats[createdDateKey].created += 1;
        }
        
        // Count completed orders on their completion date (if completed)
        if (order.status === 'completed' && order.updated_at) {
          const updatedDate = new Date(order.updated_at);
          const updatedDateKey = updatedDate.toISOString().slice(0, 10);
          
          if (dailyStats[updatedDateKey]) {
            dailyStats[updatedDateKey].completed += 1;
          }
        }
      });

      return Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          created: stats.created,
          completed: stats.completed
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error in getOrderStatusTimeSeries:', error);
      // Return empty buckets on error
      const days = params?.days || 7;
      const end = params?.endDate ? new Date(params.endDate) : new Date();
      const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      
      const buckets: OrderStatusDayStat[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        buckets.push({ date: key, created: 0, completed: 0 });
      }
      return buckets;
    }
  },

  async getTopProducts(params?: { startDate?: string; endDate?: string; limit?: number }): Promise<TopProductStat[]> {
    try {
      const limit = params?.limit || 5;
      const end = params?.endDate ? new Date(params.endDate) : new Date();
      const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
      const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
      const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select('product_id, amount, status')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (error) {
        console.warn('getTopProducts error', error);
        return [];
      }

      // First get product names for the found product IDs
      const productIds = [...new Set((data || []).map(o => o.product_id).filter(Boolean))];
      const productNamesMap: Record<string, string> = {};
      
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
        
        (products || []).forEach(p => {
          productNamesMap[p.id] = p.name;
        });
      }

      const agg: Record<string, TopProductStat> = {};
      (data || []).forEach(order => {
        const pid = order.product_id || 'unknown';
        const name = productNamesMap[pid] || 'Unknown Product';
        if (!agg[pid]) {
          agg[pid] = { product_id: pid, product_name: name, count: 0, revenue: 0 };
        }
        agg[pid].count += 1;
        
        // Only include revenue for paid and completed orders
        if (order.status === 'paid' || order.status === 'completed') {
          agg[pid].revenue += Number(order.amount) || 0;
        }
      });

      return Object.values(agg)
        .sort((a, b) => b.revenue - a.revenue) // Sort by revenue instead of count
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      return [];
    }
  },

  async getNotifications(page: number = 1, limit: number = 20): Promise<AdminNotification[]> {
    return adminCache.getOrFetch(`admin:notifications:${page}:${limit}`, async () => {
      try {
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) {
          // Generate realistic notifications based on actual orders
          const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, customer_name, product_name, amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (recentOrders && recentOrders.length > 0) {
            return recentOrders.map((order, index) => ({
              id: `order-${order.id}`,
              type: order.status === 'paid' ? 'paid_order' as const : 'new_order' as const,
              title: order.status === 'paid' ? 'Payment Received' : 'New Order',
              message: `${order.customer_name} - ${order.product_name || 'Product Order'} - Rp ${order.amount?.toLocaleString()}`,
              created_at: order.created_at,
              is_read: false,
              amount: order.amount
            }));
          }

          // Fallback mock data
          return [
            {
              id: '1',
              type: 'new_order' as const,
              title: 'New Order Received',
              message: 'A new order has been placed',
              created_at: new Date().toISOString(),
              is_read: false
            },
            {
              id: '2',
              type: 'paid_order' as const,
              title: 'Payment Received',
              message: 'Payment has been confirmed for an order',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              is_read: false
            }
          ];
        }
        return data || [];
      } catch (error) {
        // Return basic mock data on any error
        return [
          {
            id: '1',
            type: 'new_order' as const,
            title: 'System Ready',
            message: 'Admin notifications system is operational',
            created_at: new Date().toISOString(),
            is_read: false
          }
        ];
      }
    }, { ttl: 30 * 1000 }); // 30 seconds for real-time notifications
  },

  // Cache invalidation methods
  invalidateCache(pattern?: string) {
    if (pattern) {
      adminCache.invalidatePattern(pattern);
    } else {
      adminCache.clear();
    }
  },

  // Prefetch related data
  async prefetchDashboardData() {
    await adminCache.prefetchBatch([
      { key: 'admin:stats', fetchFn: () => this.getAdminStats() },
      { key: 'admin:notifications:1:20', fetchFn: () => this.getNotifications(1, 20) }
    ]);
  },

  // Alias for backwards compatibility
  async getDashboardStats(): Promise<AdminStats> {
    return this.getAdminStats();
  },

  // Search functionality
  async searchAll(query: string): Promise<{
    orders: Order[];
    users: User[];
    products: Product[];
    reviews: Review[];
  }> {
    const [orders, users, products, reviews] = await Promise.all([
      this.searchOrders(query),
      this.searchUsers(query),
      this.searchProducts(query),
      this.searchReviews(query)
    ]);

    return { orders, users, products, reviews };
  },

  async searchOrders(query: string): Promise<Order[]> {
    // Remove relational selects; search only local columns
    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(`id.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
      .limit(10);

    return (data || []).map((o: any) => ({
      id: o.id,
      customer_name: o.customer_name || 'Unknown Customer',
      product_name: o.product_name || 'Product Order',
      amount: Number(o.amount) || 0,
      status: o.status || 'pending',
      order_type: o.order_type || 'purchase',
      created_at: o.created_at,
      updated_at: o.updated_at,
      user_id: o.user_id,
      product_id: o.product_id,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
      payment_method: o.payment_method,
      xendit_invoice_id: o.xendit_invoice_id
    }));
  },

  async searchUsers(query: string): Promise<User[]> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    return data || [];
  },

  async searchProducts(query: string): Promise<Product[]> {
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    return data || [];
  },

  async searchReviews(query: string): Promise<Review[]> {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .or(`comment.ilike.%${query}%`)
        .limit(10);

      return (data || []).map((r: any) => ({
        id: r.id,
        product_id: r.product_id,
        user_id: r.user_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        product_name: r.product_name, // may not exist; kept for compatibility
        user_name: r.user_name
      }));
    } catch (error) {
      return [];
    }
  },

  // Create sample reviews method
  async createSampleReviews(): Promise<void> {
    const sampleComments = [
      'Produk sangat bagus! Kualitas premium dan pelayanan memuaskan.',
      'Rekomendasi banget! Akun game nya legit dan proses cepat.',
      'Pelayanan ramah, akun sesuai deskripsi. Puas dengan pembelian ini.',
      'Good seller, trusted! Akun game berkualitas tinggi.',
      'Terima kasih, produk sesuai ekspektasi. Akan beli lagi di sini.',
      'Fast response dan akun berkualitas. Highly recommended!',
      'Service excellent, akun game sesuai dengan yang dijanjikan.',
      'Transaksi lancar, seller responsif. Akun game premium quality.',
      'Sangat memuaskan! Proses cepat dan akun sesuai deskripsi.',
      'Top seller! Pelayanan ramah dan akun game berkualitas tinggi.'
    ];

    // Get sample users and products
    const [{ data: users }, { data: products }] = await Promise.all([
      supabase.from('users').select('id').limit(5),
      supabase.from('products').select('id').eq('is_active', true).limit(3)
    ]);

    if (!users?.length || !products?.length) {
      throw new Error('No users or products found for sample data');
    }

    const reviews = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      reviews.push({
        user_id: randomUser.id,
        product_id: randomProduct.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: randomComment,
        is_verified: Math.random() < 0.7 // 70% verified
      });
    }

    const { error } = await supabase
      .from('reviews')
      .insert(reviews);

    if (error) throw error;
  },

  // Enhanced Feed Posts Management
  async createFeedPost(data: {
    title?: string;
    content: string;
    type: 'post' | 'announcement';
    image_url?: string;
    is_pinned?: boolean;
  }): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('feed_posts')
      .insert({
        ...data,
        user_id: user.user.id,
        likes_count: 0,
        comments_count: 0,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
  },

  async updateFeedPost(id: string, data: {
    title?: string;
    content: string;
    type: 'post' | 'announcement';
    image_url?: string;
    is_pinned?: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('feed_posts')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
  },

  async toggleFeedPostPin(id: string): Promise<void> {
    const { data: post, error: fetchError } = await supabase
      .from('feed_posts')
      .select('is_pinned')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('feed_posts')
      .update({ 
        is_pinned: !post.is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
  },

  async deleteFeedPostPermanent(id: string): Promise<void> {
    const { error } = await supabase
      .from('feed_posts')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    
    // Clear cache
    adminCache.clear();
  }
};
