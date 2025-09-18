import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Lazy supabase client (service role preferred for admin operations)
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Basic in-memory rate limiting
const rateMap = new Map<string, { count: number; ts: number }>();
const RATE_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT = 60; // 60 calls / window

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now - entry.ts > RATE_WINDOW_MS) {
    rateMap.set(key, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function respond(res: VercelResponse, status: number, body: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(body));
}

function parseIntSafe(v: any, def: number) { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : def; }

function normalizeAction(action?: string | string[]): string {
  if (!action) return 'unknown';
  const a = Array.isArray(action) ? action[0] : action;
  if (a === 'dashboard') return 'dashboard-stats';
  if (a === 'notifications') return 'recent-notifications';
  return a;
}

async function dashboardStats() {
  if (!supabase) return mockDashboard();
  const ordersRes = await supabase.from('orders').select('id', { count: 'exact', head: true });
  const usersRes = await supabase.from('users').select('id', { count: 'exact', head: true });
  const productsRes = await supabase.from('products').select('id', { count: 'exact', head: true });
  let flashSalesCount = 0;
  try {
    const flashRes = await supabase.from('flash_sales').select('id', { count: 'exact', head: true });
    flashSalesCount = flashRes.count || 0;
  } catch {}
  let reviewsCount = 0;
  try {
    const reviewsRes = await supabase.from('reviews').select('id', { count: 'exact', head: true });
    reviewsCount = reviewsRes.count || 0;
  } catch {}
  const { data: revRows } = await supabase
    .from('orders')
    .select('amount,status')
    .limit(5000);
  let revenue = 0, completedRevenue = 0, completed = 0, pending = 0;
  (revRows||[]).forEach(r => { 
    // Business rule: revenue counts only PAID + COMPLETED orders
    if (r.status === 'completed' || r.status === 'paid') { 
      completed++; 
      revenue += r.amount||0; // Use same value for both revenue and completedRevenue
      completedRevenue += r.amount||0; 
    } else if (r.status === 'pending') {
      pending++; 
    }
  });
  return {
    orders: { count: ordersRes.count||0, completed, pending, revenue, completedRevenue },
    users: { count: usersRes.count||0 },
    products: { count: productsRes.count||0 },
    flashSales: { count: flashSalesCount },
    reviews: { count: reviewsCount, averageRating: 0 }
  } as const;
}

function mockDashboard() {
  return { orders:{count:0,completed:0,pending:0,revenue:0,completedRevenue:0}, users:{count:0}, products:{count:0}, flashSales:{count:0}, reviews:{count:0, averageRating:0} };
}

async function recentNotifications(limit: number) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data||[]).map(n => ({ id:n.id, type:n.type||'new_order', title:n.title||'Notification', message:n.message||n.description||'', isRead:!!n.is_read, createdAt:n.created_at, metadata:n.metadata||null }));
}

async function listOrders(page: number, limit: number, status?: string) {
  if (!supabase) return { data: [], count: 0, page };
  const from = (page - 1) * limit; const to = from + limit - 1;
  
  // First get orders
  let query: any = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (status && status !== 'all') {
    // Handle "completed" status to include both 'paid' and 'completed' orders
    if (status === 'completed') {
      query = query.in('status', ['paid', 'completed']);
    } else {
      query = query.eq('status', status);
    }
  }
  const { data: orders, error, count } = await query;
  if (error) return { data: [], count: 0, page };
  
  // Get payment data for these orders
  const orderRows = orders || [];
  const externalIds = orderRows.map(order => order.client_external_id).filter(Boolean);
  let paymentsMap: { [key: string]: any } = {};
  
  if (externalIds.length > 0) {
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('external_id', externalIds);
    
    if (payments) {
      payments.forEach(payment => {
        paymentsMap[payment.external_id] = payment;
      });
    }
  }
  
  // Map orders with payment data
  const mappedOrders = orderRows.map((order: any) => {
    const paymentRecord = paymentsMap[order.client_external_id];
    
    return {
      ...order,
      payment_data: paymentRecord ? {
        xendit_id: paymentRecord.xendit_id,
        payment_method_type: paymentRecord.payment_method,
        payment_status: paymentRecord.status,
        qr_url: paymentRecord.payment_data?.qr_url,
        qr_string: paymentRecord.payment_data?.qr_string,
        account_number: paymentRecord.payment_data?.account_number,
        bank_code: paymentRecord.payment_data?.bank_code,
        payment_url: paymentRecord.payment_data?.payment_url,
        payment_code: paymentRecord.payment_data?.payment_code,
        retail_outlet: paymentRecord.payment_data?.retail_outlet,
      } : undefined
    };
  });
  
  return { data: mappedOrders, count: count || 0, page };
}

async function updateOrderStatus(orderId: string, newStatus: string) {
  if (!supabase) return false;
  if (!orderId || !newStatus) return false;
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  return !error;
}

async function listUsers(page: number, limit: number, search?: string) {
  if (!supabase) return { data: [], count: 0, page };
  const from = (page - 1) * limit; const to = from + limit - 1;
  let query: any = supabase.from('users').select('id,name,email,phone,role,created_at,is_active', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error, count } = await query;
  if (error) return { data: [], count: 0, page };
  return { data:data||[], count:count||0, page };
}

async function listProducts(page: number, limit: number, search?: string) {
  if (!supabase) return { data: [], count: 0, page };
  const from = (page - 1) * limit; const to = from + limit - 1;
  let query: any = supabase.from('products').select('id,name,description,price,images,is_active,is_flash_sale,stock,created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error, count } = await query;
  if (error) return { data: [], count: 0, page };
  return { data:data||[], count:count||0, page };
}

async function timeSeries(days?: number, startDate?: string, endDate?: string) {
  if (!supabase) return [];
  let fromDate: Date;
  if (startDate && endDate) { fromDate = new Date(startDate); } else { const d = days && days>0 ? days : 7; fromDate = new Date(Date.now() - d*86400000); }
  const { data, error } = await supabase.from('orders').select('created_at,status,amount').gte('created_at', fromDate.toISOString()).order('created_at');
  if (error) return [];
  const bucket = new Map<string,{pending:number;completed:number;cancelled:number;paid:number;total:number}>();
  (data||[]).forEach(r => { const day = r.created_at.substring(0,10); if(!bucket.has(day)) bucket.set(day,{pending:0,completed:0,cancelled:0,paid:0,total:0}); const b=bucket.get(day)!; b.total++; switch(r.status){case 'completed': b.completed++; break; case 'cancelled': b.cancelled++; break; case 'paid': b.paid++; break; case 'pending': b.pending++; break;} });
  return Array.from(bucket.entries()).map(([date,v]) => ({ date, ...v }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = normalizeAction(req.query.action);
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    if (!rateLimit(ip + ':' + action)) return respond(res, 429, { error: 'rate_limited' });

    if (req.method === 'POST' && action === 'update-order') {
      const { orderId, status } = req.body || {};
      const ok = await updateOrderStatus(orderId, status);
      return respond(res, ok ? 200 : 400, ok ? { success: true } : { error: 'update_failed' });
    }

    const page = parseIntSafe(req.query.page, 1);
    const limit = Math.min(parseIntSafe(req.query.limit, 20), 100);

    switch (action) {
      case 'dashboard-stats': {
        const data = await dashboardStats();
        return respond(res, 200, data);
      }
      case 'recent-notifications': {
        const data = await recentNotifications(limit);
        return respond(res, 200, { data });
      }
      case 'orders': {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const data = await listOrders(page, limit, status);
        return respond(res, 200, data);
      }
      case 'users': {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const data = await listUsers(page, limit, search);
        return respond(res, 200, data);
      }
      case 'products': {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const data = await listProducts(page, limit, search);
        return respond(res, 200, data);
      }
      case 'time-series': {
        const days = req.query.days ? parseIntSafe(req.query.days, 7) : undefined;
        const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
        const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
        const data = await timeSeries(days, startDate, endDate);
        return respond(res, 200, { data });
      }
      default:
        return respond(res, 400, { error: 'unknown_action', action });
    }
  } catch (e: any) {
    console.error('Admin API error', e);
    return respond(res, 500, { error: 'internal_error', message: e.message });
  }
}
// (Removed legacy duplicated handler & unused legacy helpers to resolve conflicts and keep canonical actions only)
