import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../components/Toast';
import { RefreshCw, Filter } from 'lucide-react';

type OrderRow = {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: 'purchase'|'rental';
  amount: number;
  status: 'pending'|'paid'|'completed'|'cancelled';
  payment_method: 'xendit'|'whatsapp';
  rental_duration?: string | null;
  created_at: string;
};

const AdminOrders: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'paid'|'completed'|'cancelled'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all'|'purchase'|'rental'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { push } = useToast();

  const mapRow = (r: any): OrderRow => ({
    id: r.id,
    product_id: r.product_id ?? r.productId ?? null,
    customer_name: r.customer_name ?? r.customerName ?? r.customer?.name ?? 'Unknown',
    customer_email: r.customer_email ?? r.customerEmail ?? r.customer?.email ?? '',
    customer_phone: r.customer_phone ?? r.customerPhone ?? r.customer?.phone ?? '',
    order_type: r.order_type ?? r.orderType ?? 'purchase',
    amount: Number(r.amount ?? 0),
    status: (r.status ?? 'pending') as OrderRow['status'],
    payment_method: r.payment_method ?? r.paymentMethod ?? 'whatsapp',
    rental_duration: r.rental_duration ?? r.rentalDuration ?? null,
    created_at: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  });

  const load = async () => {
    setLoading(true); setErrorMsg('');
    try {
      // Fetch orders from consolidated admin API endpoint
      const response = await fetch('/api/admin?action=orders');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }
      
      setRows((result.data || []).map(mapRow));
      
      // Show warning if product relations couldn't be loaded
      if (result.warning) {
        setErrorMsg(result.warning);
      }
    } catch (e: any) {
      const m = e?.message || String(e);
      setErrorMsg(m);
      push(`Gagal memuat orders: ${m}`, 'error');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);
  // Realtime updates: refresh on any change in orders
  useEffect(() => {
    // Simple polling for updates since we're using API endpoints
    const interval = setInterval(() => {
      load();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let result = rows as OrderRow[];
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    
    // Order type filter
    if (orderTypeFilter !== 'all') {
      result = result.filter(r => r.order_type === orderTypeFilter);
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(searchLower) ||
        r.customer_name.toLowerCase().includes(searchLower) ||
        r.customer_email.toLowerCase().includes(searchLower) ||
        r.customer_phone.includes(searchTerm)
      );
    }
    
    return result;
  }, [rows, statusFilter, orderTypeFilter, searchTerm]);

  const updateStatus = async (id: string, status: OrderRow['status']) => {
    try {
      const response = await fetch('/api/admin?action=update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order');
      }

      push('Status diperbarui', 'success');
      await load();
    } catch (e: any) {
      push(`Gagal memperbarui status: ${e.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="space-y-8 p-8">
        {/* Modern Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Orders Management
            </h1>
            <p className="text-gray-400 font-medium">
              Monitor customer orders and manage fulfillment
            </p>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Filter size={18} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Filter Orders</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Search</label>
              <input
                type="text"
                placeholder="ID, name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
              />
            </div>
            
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <select 
                value={statusFilter} 
                onChange={e=>setStatusFilter(e.target.value as any)} 
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
              >
                <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Order Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Order</label>
            <select 
              value={orderTypeFilter} 
              onChange={e=>setOrderTypeFilter(e.target.value as any)} 
              className="w-full px-3 py-2 bg-black border border-pink-500/40 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="purchase">Pembelian</option>
              <option value="rental">Rental</option>
            </select>
          </div>
        </div>
        
        {/* Filter Summary and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-pink-500/20">
          <div className="text-sm text-gray-400">
            Menampilkan {filtered.length} dari {rows.length} pesanan
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setOrderTypeFilter('all');
              }}
              className="px-3 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-900/20 text-sm"
            >
              Reset Filter
            </button>
            <button 
              onClick={load} 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 hover:bg-black/5 text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden mt-3">
        {errorMsg && (
          <div className="px-4 py-2 text-sm text-amber-300 bg-amber-900/30 border-b border-amber-700/40">
            {errorMsg.includes('permission') || errorMsg.includes('RLS') ? (
              <span>Akses dibatasi oleh RLS. Pastikan kebijakan RLS untuk tabel orders mengizinkan admin melihat semua data.</span>
            ) : (
              <span>{errorMsg}</span>
            )}
          </div>
        )}
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Jenis</div>
          <div className="col-span-2">Jumlah</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-400">Belum ada order{statusFilter!=='all' ? ` dengan status ${statusFilter}` : ''}.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
            <div className="col-span-3 text-white">
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-xs text-gray-400">{r.customer_email} · {r.customer_phone}</div>
            </div>
            <div className="col-span-2 text-gray-300">
              <div className="capitalize">{r.order_type}</div>
              {/* Product quick link when available */}
              {((r as any).products || r.product_id) && (
                <div className="mt-1 text-xs">
                  <a
                    href={`/products/${(r as any).products?.id || r.product_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline decoration-dotted"
                    title={(r as any).products?.name || 'Lihat produk'}
                  >
                    {(r as any).products?.name || 'Buka produk'}
                  </a>
                </div>
              )}
            </div>
            <div className="col-span-2 text-gray-300">Rp {Number(r.amount||0).toLocaleString('id-ID')}</div>
            <div className="col-span-2 text-gray-300">{r.status}</div>
            <div className="col-span-3 text-right">
              <select value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value as any)} className="bg-black border border-gray-700 rounded px-2 py-1 text-white">
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default AdminOrders;
