import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
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
      const result = await adminService.getOrders(
        currentPage, 
        itemsPerPage, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setOrders(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6 p-6">
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
      <IOSCard variant="elevated" padding="medium">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         transition-colors duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         transition-colors duration-200 min-w-[120px]"
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
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          #{order.id.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
                        {order.customer_email && (
                          <span className="text-xs text-gray-500">{order.customer_email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
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
                        <span className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Edit className="w-4 h-4 text-green-500" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small" className="p-2">
                          <Trash2 className="w-4 h-4 text-red-500" />
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex items-center space-x-3">
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  Previous
                </IOSButton>
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
                  {currentPage} / {totalPages}
                </span>
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2"
                >
                  Next
                </IOSButton>
              </div>
            </div>
          </div>
        )}
      </IOSCard>
    </div>
  );
};
