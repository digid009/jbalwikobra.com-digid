import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, Package, User, Mail, Phone } from 'lucide-react';
import { adminService, Order } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { formatCurrencyIDR, formatShortDate } from '../../../utils/format';
import { cn } from '../../../styles/standardClasses';

export const AdminOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getOrders(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setOrders(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleRefresh = () => {
    loadOrders();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'processing':
        return <AlertCircle size={16} className="text-pink-400" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'processing':
        return 'bg-gray-900 dark:bg-blue-900/20 text-pink-300 dark:text-blue-200 border-pink-500/20 dark:border-blue-700';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-900 dark:bg-gray-900/20 text-gray-100 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <IOSSectionHeader 
        title="Orders Management" 
        subtitle={`${totalCount} total orders`}
      />

      {/* RLS Diagnostics */}
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

      {/* Search and Filters */}
      <IOSCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-700 border-gray-600 rounded-2xl focus:ring-pink-500 focus:ring-2 focus:ring-2 focus:border-pink-500 bg-black dark:bg-gray-900 text-white text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-700 border-gray-600 rounded-2xl focus:ring-pink-500 focus:ring-2 focus:ring-2 focus:border-pink-500 bg-black dark:bg-gray-900 text-white text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2">
            <IOSButton
              variant="ghost"
              size="medium"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={18} />
              Search
            </IOSButton>
            
            <IOSButton
              variant="ghost"
              size="medium"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Orders List */}
      {loading ? (
        <IOSCard className="p-8">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4" size={24} />
            <p className="text-gray-200 dark:text-gray-400">Loading orders...</p>
          </div>
        </IOSCard>
      ) : error ? (
        <IOSCard className="p-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <AlertCircle className="mx-auto mb-4" size={24} />
            <p className="font-medium mb-2">Error Loading Orders</p>
            <p className="text-sm">{error}</p>
            <IOSButton
              variant="primary"
              size="medium"
              onClick={handleRefresh}
              className="mt-4"
            >
              Try Again
            </IOSButton>
          </div>
        </IOSCard>
      ) : orders.length === 0 ? (
        <IOSCard className="p-8">
          <div className="text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-200 dark:text-gray-400 mb-2">No orders found</p>
            <p className="text-sm text-gray-300 dark:text-gray-300">
              {statusFilter !== 'all' 
                ? `No orders with status "${statusFilter}"`
                : 'Orders will appear here once customers place them'
              }
            </p>
          </div>
        </IOSCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <IOSCard key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-white">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-200 dark:text-gray-400">
                        {formatShortDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <IOSBadge
                        variant={order.status === 'completed' ? 'success' : 
                                order.status === 'cancelled' ? 'destructive' : 'warning'}
                        className={cn('px-3 py-1 rounded-full border', getStatusColor(order.status))}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </IOSBadge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-white text-white">
                        {order.customer_name || 'Unknown Customer'}
                      </span>
                    </div>
                    
                    {order.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-200 dark:text-gray-400">
                          {order.customer_email}
                        </span>
                      </div>
                    )}
                    
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-200 dark:text-gray-400">
                          {order.customer_phone}
                        </span>
                      </div>
                    )}
                    
                    {order.order_type && (
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-gray-200 dark:text-gray-400 capitalize">
                          {order.order_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencyIDR(order.amount)}
                  </div>
                  <p className="text-sm text-gray-300 dark:text-gray-400">
                    Total Amount
                  </p>
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      )}

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <IOSCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-200 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({totalCount} total orders)
            </div>
            <div className="flex gap-2">
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </IOSButton>
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </IOSButton>
            </div>
          </div>
        </IOSCard>
      )}
    </div>
  );
};

export default AdminOrdersManagement;
