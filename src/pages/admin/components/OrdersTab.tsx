import React from 'react';
import { ShoppingCart, CreditCard, Clock, AlertCircle, Eye } from 'lucide-react';
import { IOSCard, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { useOrders } from '../hooks/useAdminData';
import { Order } from '../types';

const OrdersTab: React.FC = () => {
  const { orders, loading, error } = useOrders();

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, icon: <Clock className="w-3 h-3" /> },
      paid: { variant: 'success' as const, icon: <CreditCard className="w-3 h-3" /> },
      processing: { variant: 'primary' as const, icon: <ShoppingCart className="w-3 h-3" /> },
      completed: { variant: 'success' as const, icon: <ShoppingCart className="w-3 h-3" /> },
      cancelled: { variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> }
    };

    const config = statusConfig[status];
    return (
      <IOSBadge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </IOSBadge>
    );
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-ios-surface-secondary rounded w-1/4"></div>
              <div className="h-6 bg-ios-surface-secondary rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-ios-surface-secondary rounded w-3/4"></div>
              <div className="h-3 bg-ios-surface-secondary rounded w-1/2"></div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <IOSCard className="p-6 text-center">
        <div className="text-ios-destructive mb-4">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load orders</p>
          <p className="text-sm text-ios-text-secondary">{error}</p>
        </div>
      </IOSCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ios-text">Orders Management</h2>
        <div className="text-sm text-ios-text-secondary">
          {orders.length} orders found
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <IOSCard className="p-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-ios-text-secondary" />
          <h3 className="text-lg font-medium text-ios-text mb-2">No orders found</h3>
          <p className="text-ios-text-secondary">Orders will appear here when customers make purchases</p>
        </IOSCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <IOSCard key={order.id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-ios-text">
                      Order #{order.id.slice(-8)}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="text-sm text-ios-text-secondary space-y-1">
                    <p>Customer: {order.customer_name || 'N/A'}</p>
                    <p>Email: {order.customer_email || 'N/A'}</p>
                    <p>Phone: {order.customer_phone || 'N/A'}</p>
                    <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    {order.payment_method && (
                      <p>Payment: {order.payment_method}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-semibold text-ios-primary mb-2">
                    {formatCurrency(order.amount)}
                  </p>
                  <button className="flex items-center gap-1 text-ios-primary hover:text-ios-primary-dark transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View Details</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              {order.products && (
                <div className="pt-4 border-t border-ios-separator">
                  <div className="flex items-center gap-3">
                    {order.products.image && (
                      <img
                        src={order.products.image}
                        alt={order.products.name}
                        className="w-12 h-12 object-cover rounded-lg bg-ios-surface-secondary"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-ios-text">{order.products.name}</p>
                      <p className="text-sm text-ios-text-secondary">Product ID: {order.product_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {order.admin_notes && (
                <div className="pt-4 border-t border-ios-separator">
                  <p className="text-sm text-ios-text-secondary">
                    <strong>Admin Notes:</strong> {order.admin_notes}
                  </p>
                </div>
              )}
            </IOSCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
