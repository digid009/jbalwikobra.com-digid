// Optimized Supabase Query Builder
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Optimized query templates
export const OPTIMIZED_QUERIES = {
  // Dashboard queries - only essential fields
  ORDERS_STATS: `
    id, total_amount, created_at, status
  `,
  
  // Orders list - minimal fields for performance
  ORDERS_LIST: `
    id, created_at, total_amount, status, user_id, admin_notes,
    customer_name, customer_email, customer_phone,
    products!inner (
      id, name, image
    )
  `,
  
  // Users list - no sensitive data
  USERS_LIST: `
    id, phone, email, name, is_admin, is_active, 
    phone_verified, created_at
  `,
  
  // Products minimal for admin
  PRODUCTS_ADMIN: `
    id, name, description, price, original_price, account_level,
    is_active, archived_at, created_at, images, game_title_id, tier_id,
    tiers (id, name, slug, color, background_gradient),
    game_titles (id, name, slug, icon)
  `,
  
  // Count queries - most efficient
  COUNT_ONLY: 'id'
} as const;

export interface QueryOptions {
  filters?: Record<string, any>;
  pagination?: { page: number; limit: number };
  sorting?: { column: string; ascending?: boolean };
  search?: { columns: string[]; term: string };
}

export class OptimizedQueryBuilder {
  static async getOrdersWithStats(options: QueryOptions = {}) {
    const { pagination = { page: 1, limit: 20 }, filters = {} } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(OPTIMIZED_QUERIES.ORDERS_LIST, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters efficiently
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    return query;
  }

  static async getUsersWithSearch(options: QueryOptions = {}) {
    const { pagination = { page: 1, limit: 20 }, search } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select(OPTIMIZED_QUERIES.USERS_LIST, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search efficiently
    if (search?.term && search.term.trim()) {
      const searchTerm = search.term.trim();
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    return query;
  }

  static async getProductsForAdmin(options: QueryOptions = {}) {
    const { pagination = { page: 1, limit: 20 }, filters = {} } = options;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('products')
      .select(OPTIMIZED_QUERIES.PRODUCTS_ADMIN, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (filters.status === 'active') {
      query = query.eq('is_active', true).is('archived_at', null);
    } else if (filters.status === 'archived') {
      query = query.or('is_active.eq.false,archived_at.not.is.null');
    }

    // Apply other filters
    if (filters.gameTitle) {
      query = query.eq('game_title_id', filters.gameTitle);
    }

    if (filters.tier) {
      query = query.eq('tier_id', filters.tier);
    }

    return query;
  }

  // Efficient count queries
  static async getTableCounts() {
    const [
      { count: ordersCount },
      { count: usersCount },
      { count: productsCount },
      { count: flashSalesCount }
    ] = await Promise.all([
      supabaseAdmin.from('orders').select(OPTIMIZED_QUERIES.COUNT_ONLY, { count: 'exact', head: true }),
      supabaseAdmin.from('users').select(OPTIMIZED_QUERIES.COUNT_ONLY, { count: 'exact', head: true }),
      supabaseAdmin.from('products').select(OPTIMIZED_QUERIES.COUNT_ONLY, { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('flash_sales').select(OPTIMIZED_QUERIES.COUNT_ONLY, { count: 'exact', head: true }).eq('is_active', true)
    ]);

    return {
      orders: ordersCount || 0,
      users: usersCount || 0,
      products: productsCount || 0,
      flashSales: flashSalesCount || 0
    };
  }

  // Efficient revenue calculation
  static async getRevenueStats(daysBack: number = 7) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status, created_at')
      .gte('created_at', fromDate.toISOString());

    const totalRevenue = orders?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;
    
    const completedRevenue = orders?.filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    return {
      total: totalRevenue,
      completed: completedRevenue,
      orderCount: orders?.length || 0,
      completedCount: orders?.filter(o => o.status === 'completed').length || 0
    };
  }
}
