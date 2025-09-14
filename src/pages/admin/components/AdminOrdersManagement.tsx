import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, X, AlertCircle, CheckCircle, Clock, XCircle, Check } from 'lucide-react';
import { adminService, Order } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { IOSPaginationV2 } from '../../../components/ios/IOSPaginationV2';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { useNotifications } from '../../../components/ios/NotificationSystem';
import { formatCurrencyIDR, formatShortDate } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import { scrollToPaginationContent } from '../../../utils/scrollUtils';

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
  const [completingOrders, setCompletingOrders] = useState<Set<string>>(new Set());
  const { notifications, showSuccess, showError, showInfo, removeNotification } = useNotifications();
  const itemsPerPage = 20;

  // Handle page change with scroll to admin content
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToPaginationContent();
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  // Separate effect for client-side filtering - no need to reload data
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filtering changes
  }, [searchTerm, dateFilter, amountFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filter parameters
      const filters: any = {};
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      
      if (dateFilter !== 'all') {
        filters.dateFilter = dateFilter;
      }
      
      if (amountFilter !== 'all') {
        filters.amountFilter = amountFilter;
      }

      const result = await adminService.getOrders(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setOrders(result.data);
      setTotalCount(result.count);
      setTotalPages(Math.ceil(result.count / itemsPerPage));
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
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 border border-amber-500/30';
      case 'paid':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30';
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border border-emerald-500/30';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-200 border border-red-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200 border border-gray-500/30';
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    // Add to completing set for immediate UI feedback
    setCompletingOrders(prev => new Set([...prev, orderId]));
    
    try {
      // Optimistically update the order status in the UI
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed' as any }
          : order
      ));
      
      // Call adminService to complete the order
      await adminService.completeOrder(orderId);
      
      showSuccess('Order Completed', 'Order has been successfully completed.');
      
      // Reload orders to sync with server (in background)
      setTimeout(() => loadOrders(), 1000);
    } catch (error) {
      console.error('Error completing order:', error);
      
      // Revert the optimistic update on error
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'paid' as any }
          : order
      ));
      
      showError('Failed to Complete Order', 'Please try again or contact support.');
    } finally {
      // Remove from completing set
      setCompletingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleRefresh = async () => {
    showInfo('Refreshing Orders', 'Loading latest order data...');
    await loadOrders();
    showSuccess('Orders Refreshed', 'Order data has been updated.');
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.customer_email?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= startDate
      );
    }

    // Apply amount filter
    if (amountFilter !== 'all') {
      filtered = filtered.filter(order => {
        const amount = order.amount;
        switch (amountFilter) {
          case 'low':
            return amount < 100000;
          case 'medium':
            return amount >= 100000 && amount <= 500000;
          case 'high':
            return amount >= 500000 && amount <= 1000000;
          case 'premium':
            return amount > 1000000;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, searchTerm, dateFilter, amountFilter]);

  return (
    <div className="space-y-8 min-h-screen">
      {/* Modern Header with Glass Effect */}
      <div className="bg-gradient-to-r from-black via-gray-950 to-black backdrop-blur-xl border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Orders Management
            </h1>
            <p className="text-gray-400 mt-1">Track and manage all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <IOSButton 
              onClick={handleRefresh} 
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 hover:from-pink-500/30 hover:to-fuchsia-500/30" 
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </IOSButton>
          </div>
        </div>
      </div>

      {/* Diagnostic Banner */}
      <div className="px-6">
        <RLSDiagnosticsBanner 
          hasErrors={!!error}
          errorMessage={error || ''}
          statsLoaded={!loading}
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-6">
          <RLSDiagnosticsBanner
            hasErrors={true}
            errorMessage={error}
            isConnected={!error.includes('network')}
            className="mb-4"
          />
        </div>
      )}

      {/* Modern Filters Section */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="space-y-6">
            {/* First Row - Search and Status */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400/60" />
                <input
                  type="text"
                  placeholder="Search orders by customer name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-3 min-w-[160px]">
                <Filter className="w-5 h-5 text-pink-400/60" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
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
              <div className="flex items-center space-x-3 min-w-[160px]">
                <span className="text-sm font-medium text-pink-200/80">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>

              {/* Amount Filter */}
              <div className="flex items-center space-x-3 min-w-[160px]">
                <span className="text-sm font-medium text-pink-200/80">Amount:</span>
                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
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
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 border-pink-500/20 hover:from-pink-500/20 hover:to-fuchsia-500/20"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Orders Table */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-pink-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse"></div>
              </div>
              <p className="text-white font-medium">Loading orders...</p>
              <p className="text-gray-400 text-sm mt-1">Fetching order data from database</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 backdrop-blur-sm border-b border-pink-500/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-pink-500/5 transition-all duration-300 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-mono font-medium bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-200 px-3 py-1 rounded-full border border-pink-500/20">
                            #{order.id.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white group-hover:text-pink-200 transition-colors duration-300">{order.customer_name}</span>
                          {order.customer_email && (
                            <span className="text-xs text-gray-400">{order.customer_email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
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
                          <span className="text-sm text-white">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.status === 'paid' && !completingOrders.has(order.id) && (
                          <IOSButton
                            size="small"
                            onClick={() => handleCompleteOrder(order.id)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30"
                          >
                            <Check className="w-4 h-4" />
                            <span>Complete</span>
                          </IOSButton>
                        )}
                        {order.status === 'paid' && completingOrders.has(order.id) && (
                          <IOSButton
                            size="small"
                            disabled
                            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600/30 to-green-600/30 border-emerald-600/50"
                          >
                            <CheckCircle className="w-4 h-4 animate-pulse" />
                            <span>Completing...</span>
                          </IOSButton>
                        )}
                        {order.status === 'completed' && (
                          <IOSButton
                            size="small"
                            disabled
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-600/40 to-emerald-600/40 border-green-600/60"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed</span>
                          </IOSButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-pink-400/60" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/5 animate-pulse"></div>
              </div>
              <p className="text-white font-medium">No orders found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-pink-500/5 to-fuchsia-500/5">
              <IOSPaginationV2
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
