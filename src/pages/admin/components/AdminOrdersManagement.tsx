import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Edit, Trash2, X } from 'lucide-react';
import { ordersService, Order } from '../../../services/ordersService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { IOSPagination } from '../../../components/ios/IOSPagination';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

export const AdminOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, searchTerm, dateFilter, amountFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ordersService.getOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      setOrders(result.orders);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-ios-warning/10 text-ios-warning border border-ios-warning/20';
      case 'paid':
        return 'bg-ios-primary/10 text-ios-primary border border-ios-primary/20';
      case 'completed':
        return 'bg-ios-success/10 text-ios-success border border-ios-success/20';
      case 'cancelled':
        return 'bg-ios-danger/10 text-ios-danger border border-ios-danger/20';
      default:
        return 'bg-ios-surface/50 text-ios-text/70 border border-ios-primary/20';
    }
  };

  const filteredOrders = orders; // Remove local filtering since backend handles it

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    loadOrders();
  };

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Orders Management"
          subtitle="Manage and track all customer orders"
        />
        <IOSButton onClick={loadOrders} className="flex items-center space-x-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </IOSButton>
      </div>

      {/* Error Banner */}
      {error && (
        <RLSDiagnosticsBanner
          hasErrors={true}
          errorMessage={error}
          isConnected={!error.includes('network')}
          className="mb-4"
        />
      )}

      {/* Filters */}
      <IOSCard variant="elevated" padding="medium">
        <div className="space-y-4">
          {/* First Row - Search and Status */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text-secondary" />
              <input
                type="text"
                placeholder="Search orders by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-xl transition-colors duration-200',
                  'bg-ios-surface border border-ios-border text-ios-text placeholder-ios-text-secondary',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent'
                )}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <Filter className="w-4 h-4 text-ios-text-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-3 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Second Row - Date and Amount Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-ios-text-secondary">Date:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-2 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            {/* Amount Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-ios-text-secondary">Amount:</span>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className={cn(
                  'border border-ios-border rounded-xl px-4 py-2 bg-ios-surface',
                  'focus:ring-2 focus:ring-ios-primary focus:border-transparent',
                  'transition-colors duration-200 text-ios-text'
                )}
              >
                <option value="all">All Amounts</option>
                <option value="low">Under Rp 100,000</option>
                <option value="medium">Rp 100,000 - 500,000</option>
                <option value="high">Rp 500,000 - 1,000,000</option>
                <option value="premium">Over Rp 1,000,000</option>
              </select>
            </div>

            {/* Clear Filters */}
            <IOSButton 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setAmountFilter('all');
                setCurrentPage(1);
              }}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Orders Table */}
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-accent" />
            <p className="text-ios-text-secondary font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={cn(
                'bg-ios-surface border-b border-ios-border'
              )}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-ios-surface transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-mono font-medium text-ios-primary bg-ios-primary/10 px-2 py-1 rounded-lg">
                          #{order.id.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-ios-text">{order.customer_name}</span>
                        {order.customer_email && (
                          <span className="text-xs text-ios-text-secondary">{order.customer_email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-ios-success">
                        Rp {order.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-ios-text">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-ios-text-secondary">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Eye className="w-4 h-4 text-ios-primary" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Edit className="w-4 h-4 text-ios-success" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Trash2 className="w-4 h-4 text-ios-error" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-ios-surface/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-ios-text-secondary" />
            </div>
            <p className="text-ios-text-secondary font-medium">No orders found</p>
            <p className="text-ios-text/50 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-ios-border/30 bg-ios-background/50">
            <IOSPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </IOSCard>
    </div>
  );
};
