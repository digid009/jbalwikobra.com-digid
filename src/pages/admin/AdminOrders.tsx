import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../../components/Toast';
import { RefreshCw, Plus, Package, CreditCard, Clock, CheckCircle, Eye, Edit } from 'lucide-react';
import { 
  AdminPageHeaderV2, 
  AdminStatCard, 
  AdminFilters, 
  StatusBadge, 
  PaymentBadge 
} from './components/ui';
import type { AdminFiltersConfig } from './components/ui';
import { AdminDSTable, type DSTableColumn, type DSTableAction } from './components/ui/AdminDSTable';

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
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { push } = useToast();

  // Filter states
  const [filterValues, setFilterValues] = useState({
    searchTerm: '',
    status: '',
    paymentMethod: '',
    orderType: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Filter configuration
  const filtersConfig: AdminFiltersConfig = {
    searchPlaceholder: 'Cari pesanan berdasarkan nama, email...',
    filters: [
      {
        key: 'status',
        label: 'Status Pesanan',
        options: [
          { value: '', label: 'Semua Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'paid', label: 'Sudah Bayar' },
          { value: 'completed', label: 'Selesai' },
          { value: 'cancelled', label: 'Dibatalkan' }
        ]
      },
      {
        key: 'paymentMethod',
        label: 'Metode Pembayaran',
        options: [
          { value: '', label: 'Semua Metode' },
          { value: 'xendit', label: 'Xendit' },
          { value: 'whatsapp', label: 'WhatsApp' }
        ]
      },
      {
        key: 'orderType',
        label: 'Tipe Pesanan',
        options: [
          { value: '', label: 'Semua Tipe' },
          { value: 'purchase', label: 'Beli' },
          { value: 'rental', label: 'Sewa' }
        ]
      }
    ],
    sortOptions: [
      { value: 'created_at', label: 'Tanggal Dibuat' },
      { value: 'amount', label: 'Jumlah' },
      { value: 'customer_name', label: 'Nama Pelanggan' },
      { value: 'status', label: 'Status' }
    ],
    showSortOrder: true
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const searchLower = filterValues.searchTerm.toLowerCase();
    const matchesSearch = !searchLower || 
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower) ||
      order.customer_phone.includes(searchLower);

    const matchesStatus = !filterValues.status || order.status === filterValues.status;
    const matchesPayment = !filterValues.paymentMethod || order.payment_method === filterValues.paymentMethod;
    const matchesType = !filterValues.orderType || order.order_type === filterValues.orderType;

    return matchesSearch && matchesStatus && matchesPayment && matchesType;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const { sortBy, sortOrder } = filterValues;
    let aVal = a[sortBy as keyof OrderRow];
    let bVal = b[sortBy as keyof OrderRow];
    
    if (sortBy === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
    paidAmount: orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)
  };

  // Table columns configuration
  const columns: DSTableColumn<OrderRow>[] = [
    {
      key: 'customer_name',
    header: 'Pelanggan',
      sortable: true,
    render: (value, order) => (
        <div>
          <div className="font-medium text-ds-text">{order.customer_name}</div>
          <div className="text-sm text-ds-text-secondary">{order.customer_email}</div>
          <div className="text-xs text-ds-text-tertiary">{order.customer_phone}</div>
        </div>
      )
    },
    {
      key: 'order_type',
    header: 'Tipe',
      sortable: true,
    render: (value, order) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          order.order_type === 'purchase' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        }`}>
      {order.order_type === 'purchase' ? 'Beli' : 'Sewa'}
        </span>
      )
    },
    {
      key: 'amount',
    header: 'Jumlah',
      sortable: true,
    align: 'right',
    render: (value, order) => (
        <div className="text-right">
          <div className="font-semibold text-ds-text">
            Rp {order.amount.toLocaleString('id-ID')}
          </div>
          {order.rental_duration && (
            <div className="text-xs text-ds-text-secondary">{order.rental_duration}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
    header: 'Status',
      sortable: true,
      render: (value, order) => {
        // Map order status to StatusBadge status
        const statusMap: Record<string, 'active' | 'inactive' | 'pending' | 'archived' | 'draft'> = {
          completed: 'active',
          paid: 'active', 
          pending: 'pending',
          cancelled: 'inactive'
        };
        return <StatusBadge status={statusMap[order.status] || 'pending'} customLabel={order.status} />;
      }
    },
    {
      key: 'payment_method',
    header: 'Pembayaran',
      sortable: true,
      render: (value, order) => {
        // Map order status to PaymentBadge status  
        const paymentStatusMap: Record<string, 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'> = {
          completed: 'paid',
          paid: 'paid',
          pending: 'pending', 
          cancelled: 'cancelled'
        };
        return <PaymentBadge status={paymentStatusMap[order.status] || 'pending'} customLabel={order.payment_method} />;
      }
    },
    {
      key: 'created_at',
    header: 'Dibuat',
      sortable: true,
    render: (value, order) => (
        <div className="text-sm text-ds-text-secondary">
          {new Date(order.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    }
  ];

  // Table actions
  const actions: DSTableAction<OrderRow>[] = [
    {
      key: 'view',
      label: 'Lihat',
      icon: Eye,
      onClick: (order) => {
        // Navigate to order detail page or open modal
        push(`Viewing order ${order.id}`, 'info');
      },
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Edit', 
      icon: Edit,
      onClick: (order) => {
        // Open edit modal or navigate to edit page
        push(`Editing order ${order.id}`, 'info');
      },
      variant: 'primary'
    }
  ];

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin?action=orders');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }
      
      const mappedOrders = (result.data || []).map((r: any): OrderRow => ({
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
      }));
      
      setOrders(mappedOrders);
    } catch (e: any) {
      const message = e?.message || String(e);
      setError(message);
      push(`Gagal memuat orders: ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    loadOrders();
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues({
      searchTerm: filters.searchTerm || '',
      status: filters.status || '',
      paymentMethod: filters.paymentMethod || '',
      orderType: filters.orderType || '',
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'desc'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeaderV2
    title="Manajemen Pesanan"
    subtitle="Pantau pesanan pelanggan dan kelola pemenuhan"
        icon={Package}
        actions={[
          {
            key: 'refresh',
      label: 'Muat ulang',
            onClick: handleRefresh,
            variant: 'secondary',
            icon: RefreshCw,
            loading: loading
          },
          {
            key: 'create',
      label: 'Buat Pesanan',
            onClick: () => push('Create order functionality coming soon', 'info'),
            variant: 'primary',
            icon: Plus
          }
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
          trend={{ value: 12, isPositive: true, period: "vs last month" }}
          loading={loading}
        />
        <AdminStatCard
          title="Pending Orders"
          value={stats.pending}
          icon={Clock}
          iconColor="text-yellow-400"
          iconBgColor="bg-yellow-500/20"
          loading={loading}
        />
        <AdminStatCard
          title="Completed Orders"
          value={stats.completed}
          icon={CheckCircle}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
          loading={loading}
        />
        <AdminStatCard
          title="Total Revenue"
          value={`Rp ${stats.paidAmount.toLocaleString('id-ID')}`}
          icon={CreditCard}
          iconColor="text-purple-400"
          iconBgColor="bg-purple-500/20"
          trend={{ value: 8, isPositive: true, period: "vs last month" }}
          loading={loading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 text-sm text-yellow-400 bg-yellow-400/20 border border-yellow-400/30 rounded-md">
          {error.includes('permission') || error.includes('RLS') ? (
            <span>Akses dibatasi oleh RLS. Pastikan kebijakan RLS untuk tabel orders mengizinkan admin melihat semua data.</span>
          ) : (
            <span>{error}</span>
          )}
        </div>
      )}

      {/* Filters */}
      <AdminFilters
        config={filtersConfig}
        values={filterValues}
        onFiltersChange={handleFilterChange}
        totalItems={orders.length}
        filteredItems={filteredOrders.length}
  loading={loading}
  defaultCollapsed={true}
      />

      {/* Orders Table */}
      <AdminDSTable<OrderRow>
        data={sortedOrders}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="Tidak ada pesanan."
      />
    </div>
  );
};

export default AdminOrders;
