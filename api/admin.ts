import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { 
  generateCacheKey, 
  getFromCache, 
  setToCache, 
  setCacheHeaders,
  validatePagination,
  sendError,
  sendSuccess
} from './_utils/requestOptimizer';
import { OptimizedQueryBuilder } from './_utils/optimizedQueries';

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
      case 'dashboard':
        return await handleDashboard(req, res);
      case 'orders':
        return await handleOrders(req, res);
      case 'users':
        return await handleUsers(req, res);
      case 'products':
        return await handleProducts(req, res);
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
    // Check cache first
    const cacheKey = generateCacheKey(req);
    const cached = getFromCache(cacheKey);
    if (cached) {
      setCacheHeaders(res, 300); // 5 minutes cache
      return sendSuccess(res, cached);
    }

    // Use optimized queries
    const [tableStats, revenueStats] = await Promise.all([
      OptimizedQueryBuilder.getTableCounts().catch(err => {
        console.error('Table counts error:', err);
        return { orders: 0, users: 0, products: 0, flashSales: 0 };
      }),
      OptimizedQueryBuilder.getRevenueStats(7).catch(err => {
        console.error('Revenue stats error:', err);
        return { total: 0, completed: 0, orderCount: 0, completedCount: 0 };
      })
    ]);

    const dashboardData = {
      orders: {
        count: revenueStats.orderCount,
        completed: revenueStats.completedCount,
        revenue: revenueStats.total,
        completedRevenue: revenueStats.completed
      },
      users: { count: tableStats.users },
      products: { count: tableStats.products },
      flashSales: { count: tableStats.flashSales }
    };

    // Cache the result
    setToCache(cacheKey, dashboardData, 5);
    setCacheHeaders(res, 300);
    
    return sendSuccess(res, dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return sendError(res, 'Failed to fetch dashboard data');
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
