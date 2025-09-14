import React from 'react';
import { IOSCard, IOSButton, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { formatCurrencyIDR, formatShortDate } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import { Order } from '../../../services/adminService';

interface AdminOrdersTableProps {
  orders: Order[];
  loading: boolean;
  onComplete: (order: Order) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, loading, onComplete, getStatusColor, getStatusIcon }) => {
  if (loading) {
    return (
      <IOSCard className="p-8 text-center">
        <p className="text-gray-200">Loading...</p>
      </IOSCard>
    );
  }
  if (!orders.length) {
    return (
      <IOSCard className="p-8 text-center">
        <p className="text-gray-200">No orders found</p>
      </IOSCard>
    );
  }
  return (
    <IOSCard className="p-0 overflow-hidden admin-table-container">
      <div className="overflow-x-auto">
        <table className="admin-table admin-table-sticky zebra compact min-w-full">
          <thead>
            <tr>
              {['Order ID','Product Name','Product Link','Buyer Name','Buyer Email','Buyer WhatsApp','Status','Price','Date','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-black/40 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-white">{o.id.slice(-8)}</td>
                <td className="px-4 py-3 text-sm text-white">{(o as any).product_name || '—'}</td>
                <td className="px-4 py-3 text-sm"><a href={`/product/${o.product_id}`} className="text-pink-400 hover:underline" target="_blank" rel="noreferrer">View</a></td>
                <td className="px-4 py-3 text-sm text-white">{o.customer_name || 'Unknown'}</td>
                <td className="px-4 py-3 text-xs text-gray-300">{o.customer_email || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-300">{o.customer_phone || '—'}</td>
                <td className="px-4 py-3">
                  <IOSBadge className={cn('px-2 py-0.5 rounded-full border text-xs', getStatusColor(o.status))}>
                    <span className="inline-flex items-center gap-1">{getStatusIcon(o.status)}<span className="capitalize">{o.status}</span></span>
                  </IOSBadge>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-500">{formatCurrencyIDR(o.amount)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatShortDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  {o.status === 'paid' && (
                    <IOSButton
                      size="small"
                      variant="ghost"
                      onClick={() => onComplete(o)}
                      className="text-pink-300 hover:text-white"
                    >
                      Complete
                    </IOSButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IOSCard>
  );
};

export default AdminOrdersTable;
