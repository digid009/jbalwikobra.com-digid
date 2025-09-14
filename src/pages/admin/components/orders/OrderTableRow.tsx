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
            {order.payment_method || 'Cash'}
          </span>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-sm text-white">
            {order.product_name || 'Product'}
          </span>
          <span className="text-xs text-pink-200/70 truncate max-w-[120px]">
            {order.order_type || 'purchase'}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default OrderTableRow;
