import React, { useState, useEffect } from 'react';
import { adminInputWithLeftIcon, adminInputBase } from './ui/InputStyles';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, Package, User, Mail, Phone } from 'lucide-react';
import { adminService, Order } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import AdminOrdersTable from './AdminOrdersTable';
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

  const handleComplete = async (order: Order) => {
    await adminService.completeOrder(order.id);
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
    // Unified Black & Pink design system badges
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30';
      case 'processing':
        return 'bg-pink-500/15 text-pink-300 border border-pink-500/30';
      case 'completed':
        return 'bg-green-500/15 text-green-300 border border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/15 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/15 text-gray-300 border border-gray-500/30';
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
                className={adminInputWithLeftIcon}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={adminInputBase}
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

      <AdminOrdersTable
        orders={orders}
        loading={loading}
        onComplete={handleComplete}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />

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
