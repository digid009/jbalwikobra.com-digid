import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, Order } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';

export const AdminOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
  console.debug('[AdminOrdersManagement] Loading orders page', currentPage, 'status', statusFilter);
      const result = await adminService.getOrders(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? undefined : statusFilter
      );
  console.debug('[AdminOrdersManagement] Fetched count', result.count, 'items', result.data?.length);
      setOrders(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    // Dark iOS tokens (soft tinted backgrounds + bright text)
    switch (status) {
      case 'pending':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'paid':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'completed':
        return 'bg-green-500/15 text-green-300 border border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/15 text-red-300 border border-red-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
  <div className="space-y-6 p-6 bg-ios-background rounded-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Orders Management"
          subtitle="Manage and track all customer orders"
        />
        <IOSButton onClick={loadOrders} className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </IOSButton>
      </div>

      {/* Filters */}
      <IOSCard variant="elevated" padding="medium" className="bg-ios-surface/80 backdrop-blur-xl border-ios-border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text-secondary" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-ios-bg-secondary/60 border border-ios-border text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-ios-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl px-4 py-3 bg-ios-bg-secondary/60 border border-ios-border text-ios-text focus:ring-2 focus:ring-ios-accent focus:border-transparent transition-colors duration-200 min-w-[140px] text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </IOSCard>

      {/* Orders Table */}
      <IOSCard variant="elevated" padding="none" className="bg-ios-surface/80 backdrop-blur-xl border-ios-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-accent" />
            <p className="text-ios-text-secondary font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ios-bg-secondary/60 border-b border-ios-border/80">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-ios-bg-secondary/40 transition-colors duration-200">
                    <td className="px-6 py-3 whitespace-nowrap align-top">
                      <span className="inline-flex text-[11px] font-mono font-semibold text-ios-accent bg-ios-accent/10 px-2 py-1 rounded-lg">
                        #{order.id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{order.customer_name}</span>
                        {order.customer_email && (
                          <span className="text-[11px] text-ios-text-secondary">{order.customer_email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-400">
                        Rp {order.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-[11px] font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap align-top">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-[11px] text-ios-text-secondary">
                          {new Date(order.created_at).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <IOSButton variant="ghost" size="small" className="p-2 hover:bg-ios-accent/10">
                          <Eye className="w-4 h-4 text-ios-text-secondary" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2 hover:bg-green-500/10">
                          <Edit className="w-4 h-4 text-green-400" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-ios-text-secondary">
            <div className="w-16 h-16 bg-ios-bg-secondary/60 border border-ios-border rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-ios-text-secondary" />
            </div>
            <p className="text-ios-text font-semibold mb-1">No orders found</p>
            <p className="text-xs max-w-sm mx-auto">{statusFilter!=='all' ? 'Filter status ini tidak memiliki data.' : 'Jika seharusnya ada data, periksa RLS policy tabel orders atau role kredensial Supabase.'}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-ios-border/60 bg-ios-bg-secondary/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-ios-text-secondary tracking-wide">
              Showing <span className="text-ios-text font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="text-ios-text font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-ios-text font-medium">{totalCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border border-ios-border flex items-center justify-center text-ios-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ios-bg-secondary/60"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-medium text-ios-text bg-ios-bg-secondary/60 px-3 py-1.5 rounded-lg border border-ios-border tracking-wide">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border border-ios-border flex items-center justify-center text-ios-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ios-bg-secondary/60"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </IOSCard>
    </div>
  );
};
