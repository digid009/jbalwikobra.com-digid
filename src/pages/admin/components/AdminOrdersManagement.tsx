import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye, 
  Edit, 
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Users,
  TrendingUp,
  Search
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { DataPanel } from '../layout/DashboardPrimitives';
import { AdminDSTable, DSTableColumn, DSTableAction } from './ui/AdminDSTable';
import { adminInputBase, adminSelectBase } from './ui/InputStyles';
import { adminService } from '../../../services/adminService';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface OrderFilters {
  searchTerm: string;
  statusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentFilter: 'all' | 'pending' | 'paid' | 'failed' | 'refunded';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  sortBy: 'created_at' | 'total' | 'customer_name' | 'status';
  sortOrder: 'asc' | 'desc';
}

// Using shared input tokens from InputStyles for consistency across admin

const AdminOrdersManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: '',
    statusFilter: 'all',
    paymentFilter: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch orders from adminService with server-side pagination
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const statusParam = filters.statusFilter !== 'all' ? filters.statusFilter : undefined;
        const resp = await adminService.getOrders(currentPage, itemsPerPage, statusParam as any);
        // Map service rows to local display type
        const mapped: Order[] = (resp.data || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.id || '-',
          customerName: o.customer_name || 'Unknown Customer',
          customerEmail: o.customer_email || '',
          customerPhone: o.customer_phone || '',
          status: (['pending','processing','shipped','delivered','cancelled'].includes(o.status) ? o.status : 'pending') as Order['status'],
          paymentStatus: 'pending',
          items: [],
          subtotal: Number(o.amount) || 0,
          shipping: 0,
          tax: 0,
          total: Number(o.amount) || 0,
          shippingAddress: {
            street: o.shipping_street || '',
            city: o.shipping_city || '',
            state: o.shipping_state || '',
            zipCode: o.shipping_zip || '',
            country: o.shipping_country || 'Indonesia'
          },
          createdAt: o.created_at || new Date().toISOString(),
          updatedAt: o.updated_at || o.created_at || new Date().toISOString(),
          estimatedDelivery: undefined,
          trackingNumber: o.tracking_number
        }));
        setOrders(mapped);
        setFilteredOrders(mapped);
        setTotalItems(resp.count || 0);
        setTotalPages(resp.totalPages || 1);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
        setFilteredOrders([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    void loadOrders();
  }, [currentPage, itemsPerPage, filters.statusFilter]);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(filters.searchTerm)
      );
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === filters.statusFilter);
    }

    // Payment filter
    if (filters.paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'customer_name':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, filters]);

  const updateFilter = (key: keyof OrderFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-700', icon: Clock, label: 'Menunggu' },
      processing: { color: 'bg-blue-500/20 text-blue-700', icon: Package, label: 'Diproses' },
      shipped: { color: 'bg-purple-500/20 text-purple-700', icon: Truck, label: 'Dikirim' },
      delivered: { color: 'bg-green-500/20 text-green-700', icon: CheckCircle, label: 'Sampai' },
      cancelled: { color: 'bg-red-500/20 text-red-700', icon: XCircle, label: 'Dibatalkan' }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium', config.color)}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-700', label: 'Menunggu' },
      paid: { color: 'bg-green-500/20 text-green-700', label: 'Lunas' },
      failed: { color: 'bg-red-500/20 text-red-700', label: 'Gagal' },
      refunded: { color: 'bg-gray-500/20 text-gray-700', label: 'Refund' }
    };

    const config = statusConfig[paymentStatus];

    return (
      <span className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-medium', config.color)}>
        {config.label}
      </span>
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders; // already server-paginated

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-ds-text">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Memuat pesanan...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-ds-pink" />
          <div>
            <h2 className="text-xl font-semibold text-ds-text">Manajemen Pesanan</h2>
            <p className="text-sm text-ds-text-secondary">
              Kelola pesanan dan status pengiriman
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataPanel>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ds-text">{stats.totalOrders}</p>
              <p className="text-sm text-ds-text-secondary">Total Pesanan</p>
            </div>
          </div>
        </DataPanel>

        <DataPanel>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ds-text">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-ds-text-secondary">Total Revenue</p>
            </div>
          </div>
        </DataPanel>

        <DataPanel>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ds-text">{stats.pendingOrders}</p>
              <p className="text-sm text-ds-text-secondary">Menunggu</p>
            </div>
          </div>
        </DataPanel>

        <DataPanel>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ds-text">{stats.completedOrders}</p>
              <p className="text-sm text-ds-text-secondary">Selesai</p>
            </div>
          </div>
        </DataPanel>
      </div>

      {/* Filters */}
      {showFilters && (
        <DataPanel>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ds-text flex items-center gap-2">
              <Filter className="w-5 h-5 text-ds-pink" />
              Filter Pesanan
            </h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ds-text-tertiary" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor pesanan, nama, email, atau telepon..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className={cn(adminInputBase, "pl-12")}
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Status Pesanan
                </label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => updateFilter('statusFilter', e.target.value)}
                  className={adminSelectBase}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Sampai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Status Pembayaran
                </label>
                <select
                  value={filters.paymentFilter}
                  onChange={(e) => updateFilter('paymentFilter', e.target.value)}
                  className={adminSelectBase}
                >
                  <option value="all">Semua Pembayaran</option>
                  <option value="pending">Menunggu</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="refunded">Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Urutkan
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    updateFilter('sortBy', sortBy);
                    updateFilter('sortOrder', sortOrder);
                  }}
                  className={adminSelectBase}
                >
                  <option value="created_at-desc">Terbaru</option>
                  <option value="created_at-asc">Terlama</option>
                  <option value="total-desc">Total Tertinggi</option>
                  <option value="total-asc">Total Terendah</option>
                  <option value="customer_name-asc">Nama A-Z</option>
                  <option value="customer_name-desc">Nama Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </DataPanel>
      )}

      {/* Orders Table (Unified DS) */}
      <DataPanel>
        {(() => {
          type Row = Order;
          const columns: DSTableColumn<Row>[] = [
            {
              key: 'orderNumber',
              header: 'Pesanan',
              render: (_, o) => (
                <div>
                  <p className="font-medium text-ds-text">{o.orderNumber}</p>
                  <p className="text-sm text-ds-text-secondary">{o.items.length} item(s)</p>
                </div>
              ),
            },
            {
              key: 'customer',
              header: 'Pelanggan',
              render: (_, o) => (
                <div>
                  <p className="font-medium text-ds-text">{o.customerName}</p>
                  <p className="text-sm text-ds-text-secondary">{o.customerEmail}</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (v: Row['status']) => getStatusBadge(v),
              width: '140px',
            },
            {
              key: 'paymentStatus',
              header: 'Pembayaran',
              render: (v: Row['paymentStatus']) => getPaymentBadge(v),
              width: '140px',
            },
            {
              key: 'total',
              header: 'Total',
              render: (v: number) => <p className="font-medium text-ds-text">{formatCurrency(v)}</p>,
              width: '140px',
              align: 'right',
            },
            {
              key: 'createdAt',
              header: 'Tanggal',
              render: (v: string) => (
                <p className="text-sm text-ds-text">{new Date(v).toLocaleDateString('id-ID')}</p>
              ),
              width: '160px',
            },
          ];

          const actions: DSTableAction<Row>[] = [
            { key: 'view', label: 'View', icon: Eye, onClick: () => {}, variant: 'secondary' },
            { key: 'edit', label: 'Edit', icon: Edit, onClick: () => {}, variant: 'secondary' },
          ];

          return (
            <AdminDSTable<Row>
              data={paginatedOrders}
              columns={columns}
              actions={actions}
              currentPage={currentPage}
              pageSize={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              emptyMessage="Belum ada pesanan"
            />
          );
        })()}
      </DataPanel>
    </div>
  );
};

export default AdminOrdersManagement;
