import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Admin service role client
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: process.env.NODE_ENV === 'development' ? 'Missing Supabase credentials' : undefined
      });
    }

    const { action } = req.query;

    switch (action) {
      case 'batch':
        return await handleBatchRequest(req, res);
      case 'dashboard':
        return await handleDashboard(req, res);
      case 'orders':
        return await handleOrders(req, res);
      case 'users':
        return await handleUsers(req, res);
      case 'products':
        return await handleProducts(req, res);
      case 'time-series':
        return await handleTimeSeries(req, res);
      case 'notifications':
        return await handleNotifications(req, res);
      case 'create-product':
        return await handleCreateProduct(req, res);
      case 'update-product':
        return await handleUpdateProduct(req, res);
      case 'delete-product':
        return await handleDeleteProduct(req, res);
      case 'update-order':
        return await handleUpdateOrder(req, res);
      case 'whatsapp-settings':
        return await handleWhatsAppSettings(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDashboard(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get table counts directly
    const [
      { count: ordersCount },
      { count: usersCount },
      { count: productsCount },
      { count: flashSalesCount }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_flash_sale', true).eq('is_active', true)
    ]);

    // Get revenue stats
    const { data: orders } = await supabase
      .from('orders')
      .select('status, amount')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
    const completedOrders = orders?.filter(order => order.status === 'completed') || [];
    const completedRevenue = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

    const dashboardData = {
      orders: {
        count: ordersCount || 0,
        completed: completedOrders.length,
        revenue: totalRevenue,
        completedRevenue: completedRevenue
      },
      users: { count: usersCount || 0 },
      products: { count: productsCount || 0 },
      flashSales: { count: flashSalesCount || 0 }
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}


async function handleOrders(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50); // Cap at 50 for performance
    const offset = (pageNum - 1) * limitNum;

    // Build optimized query with only necessary fields
    let query = supabase
      .from('orders')
      .select(`
        id, created_at, amount, status, user_id, admin_notes,
        customer_name, customer_email, customer_phone,
        product_id
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      orders: orders || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}


async function handleUsers(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, phone, email, name, is_admin, is_active, phone_verified, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    return res.status(200).json({
      users: users || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}


async function handleUpdateOrder(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, status, notes } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}

async function handleWhatsAppSettings(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { data: settings, error } = await supabase
        .from('whatsapp_api_keys')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return res.status(200).json({
        settings: settings || null
      });
    } catch (error) {
      console.error('Get WhatsApp settings error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { api_key, provider_name } = req.body;

      if (!api_key || !provider_name) {
        return res.status(400).json({ error: 'API key and provider name are required' });
      }

      // Update or insert settings
      const { data: settings, error } = await supabase
        .from('whatsapp_api_keys')
        .upsert({
          api_key,
          provider_name,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Update WhatsApp settings error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Product management handlers
async function handleProducts(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        original_price,
        category,
        stock,
        is_active,
        is_flash_sale,
        flash_sale_end_time,
        image,
        images,
        created_at,
        updated_at
      `);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: products, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: products || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function handleCreateProduct(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      description,
      price,
      original_price,
      category,
      stock,
      is_active = true,
      is_flash_sale = false,
      flash_sale_end_time,
      image,
      images,
      game_title,
      account_level,
      account_details,
      tier
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, price, category' 
      });
    }

    const productData = {
      name,
      description: description || '',
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      category,
      stock: parseInt(stock) || 0,
      is_active: Boolean(is_active),
      is_flash_sale: Boolean(is_flash_sale),
      flash_sale_end_time: is_flash_sale && flash_sale_end_time ? flash_sale_end_time : null,
      image: image || null,
      images: images || [],
      game_title: game_title || null,
      account_level: account_level || null,
      account_details: account_details || null,
      tier: tier || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
}

async function handleUpdateProduct(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const {
      name,
      description,
      price,
      original_price,
      category,
      stock,
      is_active,
      is_flash_sale,
      flash_sale_end_time,
      image,
      images,
      game_title,
      account_level,
      account_details,
      tier
    } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (original_price !== undefined) updateData.original_price = original_price ? parseFloat(original_price) : null;
    if (category !== undefined) updateData.category = category;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (is_flash_sale !== undefined) updateData.is_flash_sale = Boolean(is_flash_sale);
    if (flash_sale_end_time !== undefined) updateData.flash_sale_end_time = flash_sale_end_time;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;
    if (game_title !== undefined) updateData.game_title = game_title;
    if (account_level !== undefined) updateData.account_level = account_level;
    if (account_details !== undefined) updateData.account_details = account_details;
    if (tier !== undefined) updateData.tier = tier;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
}

async function handleDeleteProduct(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete by setting is_active to false and adding archived_at timestamp
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Product "${existingProduct.name}" archived successfully`
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
}

// ================== NEW OPTIMIZED HANDLERS ==================

/**
 * Handle batch requests to reduce API calls
 */
async function handleBatchRequest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: 'Requests array is required' });
    }

    if (requests.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 requests allowed per batch' });
    }

    const results: Record<string, any> = {};

    // Process batch requests concurrently
    const promises = requests.map(async (batchReq: any) => {
      try {
        const { id, action, params = {} } = batchReq;
        
        let data;
        switch (action) {
          case 'dashboard-stats':
            data = await getDashboardStatsOptimized();
            break;
          case 'recent-orders':
            data = await getRecentOrders(params.limit || 5);
            break;
          case 'recent-notifications':
            data = await getRecentNotifications(params.limit || 5);
            break;
          case 'users-count':
            data = await getUsersCount();
            break;
          case 'products-count':
            data = await getProductsCount();
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        return { id, data, error: null };
      } catch (error) {
        return { id: batchReq.id, data: null, error: (error as Error).message };
      }
    });

    const batchResults = await Promise.all(promises);
    
    // Convert to object format
    batchResults.forEach(({ id, data, error }) => {
      results[id] = { data, error };
    });

    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Batch request error:', error);
    return res.status(500).json({ error: 'Batch request failed' });
  }
}

/**
 * Handle time series data requests
 */
async function handleTimeSeries(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { days = '7', startDate, endDate } = req.query;
    
    let timeQuery;
    if (startDate && endDate) {
      timeQuery = {
        start: new Date(startDate as string).toISOString(),
        end: new Date(endDate as string).toISOString()
      };
    } else {
      const daysNum = parseInt(days as string);
      const start = new Date();
      start.setDate(start.getDate() - daysNum);
      timeQuery = {
        start: start.toISOString(),
        end: new Date().toISOString()
      };
    }

    // Get orders grouped by date and status
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, status')
      .gte('created_at', timeQuery.start)
      .lte('created_at', timeQuery.end)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data into time series format
    const timeSeriesData = processOrderTimeSeries(orders || []);

    return res.status(200).json({
      success: true,
      data: timeSeriesData,
      period: {
        start: timeQuery.start,
        end: timeQuery.end,
        days: Math.ceil((new Date(timeQuery.end).getTime() - new Date(timeQuery.start).getTime()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Time series error:', error);
    return res.status(500).json({ error: 'Failed to fetch time series data' });
  }
}

/**
 * Handle notifications requests
 */
async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 20);

    // Get recent orders as notifications
    const notifications = await getRecentNotifications(limitNum, pageNum);

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// ================== OPTIMIZED HELPER FUNCTIONS ==================

async function getDashboardStatsOptimized() {
  // Single query to get multiple counts
  const [ordersResult, usersResult, productsResult] = await Promise.all([
    supabase.from('orders').select('status, amount, created_at', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id, is_flash_sale', { count: 'exact' })
  ]);

  const orders = ordersResult.data || [];
  const totalOrders = ordersResult.count || 0;
  const totalUsers = usersResult.count || 0;
  const products = productsResult.data || [];
  const totalProducts = productsResult.count || 0;

  // Calculate metrics from single query
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const flashSalesCount = products.filter(p => p.is_flash_sale).length;

  return {
    orders: {
      count: totalOrders,
      completed: completedOrders.length,
      pending: pendingOrders.length,
      revenue: totalRevenue,
      completedRevenue: completedRevenue
    },
    users: { count: totalUsers },
    products: { count: totalProducts },
    flashSales: { count: flashSalesCount },
    reviews: { count: completedOrders.length, averageRating: 4.5 } // Fallback rating
  };
}

async function getRecentOrders(limit = 5) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, amount, status, customer_name, customer_email,
      product_id
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function getRecentNotifications(limit = 10, page = 1) {
  const offset = (page - 1) * limit;
  
  const { data: recentOrders, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, amount, customer_name,
      product_id
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Convert orders to notification format
  const notifications = (recentOrders || []).map(order => {
    let type = 'new_order';
    let title = 'New Order';
    
    if (order.status === 'completed') {
      type = 'completed_order';
      title = 'Order Completed';
    } else if (order.status === 'cancelled') {
      type = 'cancelled_order';
      title = 'Order Cancelled';
    }

    return {
      id: `order_${order.id}`,
      type,
      title,
      message: `Order from ${order.customer_name || 'Unknown'} - Rp ${order.amount?.toLocaleString() || 0}`,
      isRead: false,
      createdAt: order.created_at,
      metadata: {
        orderId: order.id,
        amount: order.amount,
        status: order.status
      }
    };
  });

  return notifications;
}

async function getUsersCount() {
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  return { count: count || 0 };
}

async function getProductsCount() {
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  return { count: count || 0 };
}

function processOrderTimeSeries(orders: any[]) {
  // Group orders by date
  const dateGroups: Record<string, any[]> = {};
  
  orders.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(order);
  });

  // Convert to time series format
  return Object.entries(dateGroups).map(([date, dayOrders]) => {
    const pending = dayOrders.filter(o => o.status === 'pending').length;
    const completed = dayOrders.filter(o => o.status === 'completed').length;
    const cancelled = dayOrders.filter(o => o.status === 'cancelled').length;
    const paid = dayOrders.filter(o => o.status === 'paid').length;
    
    return {
      date,
      pending,
      completed,
      cancelled,
      paid,
      total: dayOrders.length
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}
