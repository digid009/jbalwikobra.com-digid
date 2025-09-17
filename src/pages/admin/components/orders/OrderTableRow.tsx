import React from 'react';
import { Order } from '../../../../services/adminService';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrencyIDR, formatShortDate } from '../../../../utils/format';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface OrderTableRowProps {
  order: Order;
  onOrderClick?: (order: Order) => void;
  className?: string;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({ 
  order, 
  onOrderClick,
  className 
}) => {
  const handleClick = () => {
    onOrderClick?.(order);
  };

  return (
    <tr 
      className={cn(
        'border-b border-pink-500/20 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-fuchsia-600/5',
        'transition-all duration-200 cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-white text-sm">
            #{order.id}
          </span>
          <span className="text-xs text-pink-200/70">
            {formatShortDate(order.created_at)}
          </span>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-white text-sm">
            {order.customer_name || 'Unknown Customer'}
          </span>
          <span className="text-xs text-pink-200/70">
            {order.customer_phone || 'No phone'}
          </span>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <OrderStatusBadge status={order.status} />
      </td>
      
      <td className="px-4 py-4 text-right">
        <div className="flex flex-col items-end">
          <span className="font-bold text-white text-sm">
            {formatCurrencyIDR(order.amount)}
          </span>
          <span className="text-xs text-pink-200/70">
            {order.order_type === 'rental' && order.rental_duration ? `${order.rental_duration}` : order.order_type}
          </span>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex flex-col">
          {order.payment_data ? (
            <>
              <span className="text-sm font-medium text-white">
                {order.payment_data.payment_method_type?.toUpperCase() || 'Xendit'}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  order.payment_data.payment_status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                  order.payment_data.payment_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                  order.payment_data.payment_status === 'PAID' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {order.payment_data.payment_status || 'Unknown'}
                </span>
              </div>
              {order.payment_data.qr_url && (
                <span className="text-xs text-pink-200/50">QR Available</span>
              )}
              {order.payment_data.account_number && (
                <span className="text-xs text-pink-200/50 truncate max-w-[100px]">
                  VA: {order.payment_data.account_number}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-gray-400">
                {order.payment_method || 'WhatsApp'}
              </span>
              <span className="text-xs text-pink-200/50">No payment data</span>
            </>
          )}
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-sm text-white">
            {order.product_name || 'Product'}
          </span>
          <span className="text-xs text-pink-200/70 truncate max-w-[120px]">
            ID: {order.product_id?.slice(0, 8) || 'N/A'}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default OrderTableRow;
