import React from 'react';
import { Order } from '../../../../services/adminService';
import { OrderTableRow } from './OrderTableRow';
import { cn } from '../../../../utils/cn';

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onOrderClick?: (order: Order) => void;
  className?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  loading, 
  onOrderClick,
  className 
}) => {
  if (loading) {
    return (
      <div className={cn('rounded-2xl overflow-hidden border border-pink-500/20 bg-gradient-to-br from-black/50 to-gray-950/50', className)}>
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-pink-500/20 to-fuchsia-600/20 p-4">
            <div className="h-6 bg-pink-500/30 rounded w-full"></div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-pink-500/10 p-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-pink-500/20 rounded w-1/6"></div>
                <div className="h-4 bg-pink-500/20 rounded w-1/6"></div>
                <div className="h-4 bg-pink-500/20 rounded w-1/8"></div>
                <div className="h-4 bg-pink-500/20 rounded w-1/6"></div>
                <div className="h-4 bg-pink-500/20 rounded w-1/6"></div>
                <div className="h-4 bg-pink-500/20 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={cn(
        'rounded-2xl border border-pink-500/20 bg-gradient-to-br from-black/50 to-gray-950/50 p-12 text-center',
        className
      )}>
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
        <p className="text-pink-200/70">Try adjusting your search or filters to find orders.</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl overflow-hidden admin-table-container border-token backdrop-blur-sm', className)}>
      <div className="overflow-x-auto">
        <table className="admin-table admin-table-sticky zebra compact w-full">
          <thead>
            <tr>
              <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                Order ID
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                Customer
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-4 text-right text-sm font-bold text-white uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                Payment
              </th>
              <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                Product
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onOrderClick={onOrderClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
