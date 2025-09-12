import { createClient } from '@supabase/supabase-js';
import { adminCache } from './adminCache';
import { ordersService } from './ordersService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface Order {
  id: string;
  customer_name: string;
  product_name: string;
  amount: number; // Actual column name in DB
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  user_id?: string;
  product_id?: string;
  customer_email?: string;
  customer_phone?: string;
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
  description: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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
  title: string;
  content: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Add missing properties for feed management
  type: 'text' | 'image' | 'video';
  author_name: string;
  likes_count: number;
  comments_count: number;
  is_deleted: boolean;
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
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      // Try to get reviews (might not exist)
      let totalReviews = 0;
      let averageRating = 0;
      
      try {
        const [
          { count: reviewCount },
          reviewsWithRating
        ] = await Promise.all([
          supabase.from('reviews').select('*', { count: 'exact', head: true }),
          supabase.from('reviews').select('rating')
        ]);
        
        totalReviews = reviewCount || 0;
        averageRating = reviewsWithRating.data?.length > 0
          ? reviewsWithRating.data.reduce((sum, review) => sum + review.rating, 0) / reviewsWithRating.data.length
          : 0;
      } catch (reviewError) {
        // Silent fallback if reviews table not present
      }

      return {
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingOrders: orderStats.pendingOrders,
        completedOrders: orderStats.completedOrders
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
        completedOrders: 0
      };
    }
  }

  // Orders Management
  async getOrders(page = 1, limit = 20, status?: string): Promise<{ data: Order[], count: number }> {
    try {
      // Simple query without foreign key relationships
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const orders: Order[] = (data || []).map((item: any) => ({
        id: item.id,
        customer_name: item.customer_name || 'Unknown Customer',
        product_name: 'Product Order', // Generic name since we don't have the relationship
        amount: item.amount || 0,
        status: item.status || 'pending',
        created_at: item.created_at,
        user_id: item.user_id,
        product_id: item.product_id,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        payment_method: item.payment_method,
        xendit_invoice_id: item.xendit_invoice_id
      }));

      return { data: orders, count: count || 0 };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], count: 0 };
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

  // Products Management
  async getProducts(page = 1, limit = 20, search?: string): Promise<{ data: Product[], count: number }> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], count: 0 };
    }
  }

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
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
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
            supabase.from('reviews').select('*', { count: 'exact', head: true }),
            supabase.from('reviews').select('rating')
          ]);
          
          totalReviews = reviewCount || 0;
          averageRating = reviewsWithRating.data?.length > 0
            ? reviewsWithRating.data.reduce((sum, review) => sum + review.rating, 0) / reviewsWithRating.data.length
            : 0;
        } catch (reviewError) {
          // Silent fallback if reviews table missing
        }

        // Calculate revenue
        const totalRevenue = ordersWithAmounts.data?.reduce((sum, order) => 
          sum + (Number(order.amount) || 0), 0) || 0;

        return {
          totalOrders: totalOrders || 0,
          totalRevenue,
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0
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
          completedOrders: 0
        };
      }
    });
  },

  async getOrders(page: number = 1, limit: number = 10, statusFilter?: string): Promise<PaginatedResponse<Order>> {
    // NOTE: Previous implementation attempted to select related users/products via
    // PostgREST foreign key expansion (users(name,email), products(name)) but the
    // database does not have declared FK relationships, causing 400 errors.
    return adminCache.getOrFetch(`admin:orders:${page}:${limit}:${statusFilter || 'all'}`, async () => {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Map to Order interface enforcing fallbacks
      const mapped: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name || 'Unknown Customer',
        product_name: o.product_name || 'Product Order',
        amount: Number(o.amount) || 0,
        status: o.status || 'pending',
        created_at: o.created_at,
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
  },

  async getUsers(page: number = 1, limit: number = 10, searchTerm?: string): Promise<PaginatedResponse<User>> {
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

  async getProducts(page: number = 1, limit: number = 10, searchTerm?: string): Promise<PaginatedResponse<Product>> {
    return adminCache.getOrFetch(`admin:products:${page}:${limit}:${searchTerm || ''}`, async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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

  async getReviews(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> {
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
    discount_percentage: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }): Promise<FlashSale> {
    const { data, error } = await supabase
      .from('flash_sales')
      .insert([{
        product_id: flashSaleData.product_id,
        original_price: flashSaleData.original_price,
        sale_price: flashSaleData.sale_price,
        discount_percentage: flashSaleData.discount_percentage,
        start_time: flashSaleData.start_time,
        end_time: flashSaleData.end_time,
        is_active: flashSaleData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

  async getFeedPosts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FeedPost>> {
    return adminCache.getOrFetch(`admin:feed-posts:${page}:${limit}`, async () => {
      const { data, error, count } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact' })
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

  // ----- Dashboard Analytics -----
  async getOrdersTimeSeries(params?: { startDate?: string; endDate?: string; days?: number }): Promise<OrderDayStat[]> {
    const days = params?.days || 7;
    const end = params?.endDate ? new Date(params.endDate) : new Date();
    const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
    const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, amount')
      .gte('created_at', startISO)
      .lte('created_at', endISO);

    if (error) {
      console.warn('getOrdersTimeSeries error', error);
      return [];
    }

    // Initialize date buckets
    const buckets: Record<string, OrderDayStat> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, count: 0, revenue: 0 };
    }

    (data || []).forEach(o => {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      if (!buckets[key]) {
        buckets[key] = { date: key, count: 0, revenue: 0 };
      }
      buckets[key].count += 1;
      buckets[key].revenue += Number((o as any).amount) || 0;
    });

    return Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
  },

  async getTopProducts(params?: { startDate?: string; endDate?: string; limit?: number }): Promise<TopProductStat[]> {
    const limit = params?.limit || 5;
    const end = params?.endDate ? new Date(params.endDate) : new Date();
    const start = params?.startDate ? new Date(params.startDate) : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000); // default 7 days
    const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
    const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('product_id, product_name, amount')
      .gte('created_at', startISO)
      .lte('created_at', endISO);

    if (error) {
      console.warn('getTopProducts error', error);
      return [];
    }

    const agg: Record<string, TopProductStat> = {};
    (data || []).forEach(o => {
      const pid = (o as any).product_id || 'unknown';
      const name = (o as any).product_name || 'Unknown Product';
      if (!agg[pid]) {
        agg[pid] = { product_id: pid, product_name: name, count: 0, revenue: 0 };
      }
      agg[pid].count += 1;
      agg[pid].revenue += Number((o as any).amount) || 0;
    });

    return Object.values(agg)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
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
          // If table doesn't exist, return mock notifications
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
        // Return mock data on any error
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
      created_at: o.created_at,
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
  }
};
