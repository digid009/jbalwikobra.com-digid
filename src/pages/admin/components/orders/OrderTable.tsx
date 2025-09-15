import React from 'react';
import { ShoppingCart, CreditCard, Package, Calendar, User, Mail, Phone, Tag } from 'lucide-react';
import { AdminDataTable, TableColumn, TableAction } from '../ui';

interface OrderTableProps {
  orders: any[];
  loading?: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
  onRefresh?: () => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading = false,
  onUpdateStatus,
  onRefresh
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'paid':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'completed':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-surface-tint-gray bg-surface-glass-sm border-surface-tint-gray/30';
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'rental' ? <Calendar size={14} /> : <ShoppingCart size={14} />;
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === 'xendit' ? <CreditCard size={14} /> : <Phone size={14} />;
  };

  const renderOrderInfo = (value: any, order: any) => (
    <div className="space-y-cluster-xs">
      <div className="font-medium text-white">
        Order #{order.id.slice(-6)}
      </div>
      <div className="flex items-center gap-cluster-xs">
        {getOrderTypeIcon(order.order_type)}
        <span className="fs-sm text-surface-tint-gray capitalize">
          {order.order_type}
        </span>
        {order.rental_duration && (
          <span className="fs-xs text-surface-tint-gray">
            ({order.rental_duration})
          </span>
        )}
      </div>
      <div className="fs-xs text-surface-tint-gray">
        {formatDate(order.created_at)}
      </div>
    </div>
  );

  const renderCustomer = (value: any, order: any) => (
    <div className="space-y-cluster-xs">
      <div className="flex items-center gap-cluster-xs">
        <User size={14} className="text-surface-tint-gray" />
        <span className="font-medium text-white">
          {order.customer_name || 'Unknown Customer'}
        </span>
      </div>
      {order.customer_email && (
        <div className="flex items-center gap-cluster-xs">
          <Mail size={12} className="text-surface-tint-gray" />
          <span className="fs-sm text-surface-tint-gray truncate max-w-[200px]">
            {order.customer_email}
          </span>
        </div>
      )}
      {order.customer_phone && (
        <div className="flex items-center gap-cluster-xs">
          <Phone size={12} className="text-surface-tint-gray" />
          <span className="fs-sm text-surface-tint-gray">
            {order.customer_phone}
          </span>
        </div>
      )}
    </div>
  );

  const renderAmount = (value: any, order: any) => (
    <div className="space-y-cluster-xs">
      <div className="font-medium text-white">
        {formatCurrency(order.amount)}
      </div>
      <div className="flex items-center gap-cluster-xs">
        {getPaymentMethodIcon(order.payment_method)}
        <span className="fs-sm text-surface-tint-gray capitalize">
          {order.payment_method}
        </span>
      </div>
    </div>
  );

  const renderStatus = (value: any, order: any) => (
    <div className="flex items-center gap-cluster-xs">
      <span className={`px-stack-xs py-1 rounded-md border fs-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>
    </div>
  );

  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Order',
      width: 'min-w-[180px]',
      render: renderOrderInfo
    },
    {
      key: 'customer_name',
      label: 'Customer',
      width: 'min-w-[250px]',
      render: renderCustomer
    },
    {
      key: 'amount',
      label: 'Amount & Payment',
      width: 'min-w-[160px]',
      render: renderAmount
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-32',
      render: renderStatus
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'Mark as Paid',
      onClick: (order) => onUpdateStatus(order.id, 'paid'),
      icon: <CreditCard size={14} />,
      disabled: (order) => order.status === 'paid' || order.status === 'completed' || order.status === 'cancelled'
    },
    {
      label: 'Mark as Completed',
      onClick: (order) => onUpdateStatus(order.id, 'completed'),
      icon: <Package size={14} />,
      disabled: (order) => order.status === 'completed' || order.status === 'cancelled'
    },
    {
      label: 'Cancel Order',
      onClick: (order) => onUpdateStatus(order.id, 'cancelled'),
      icon: <Tag size={14} />,
      variant: 'danger',
      disabled: (order) => order.status === 'completed' || order.status === 'cancelled'
    }
  ];

  return (
    <AdminDataTable
      data={orders}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="No orders found. Try adjusting your filters."
      showRowNumbers={false}
    />
  );
};
