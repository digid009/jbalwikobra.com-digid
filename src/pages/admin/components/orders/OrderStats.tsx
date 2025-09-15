import React from 'react';
import { ShoppingCart, CreditCard, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';
import { AdminStats, StatItem } from '../ui';

interface OrderStatsProps {
  orders: any[];
  loading?: boolean;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ orders, loading = false }) => {
  // Calculate stats from orders data
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const paidOrders = orders.filter(order => order.status === 'paid').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  const purchaseOrders = orders.filter(order => order.order_type === 'purchase').length;
  const rentalOrders = orders.filter(order => order.order_type === 'rental').length;

  // Calculate total revenue
  const totalRevenue = orders
    .filter(order => order.status === 'paid' || order.status === 'completed')
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  // Calculate recent orders (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOrders = orders.filter(order => {
    if (!order.created_at) return false;
    const orderDate = new Date(order.created_at);
    return orderDate >= sevenDaysAgo;
  }).length;

  // Calculate completion rate
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const pendingRate = totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0;

  const stats: StatItem[] = [
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCart />,
      color: 'blue',
      loading,
      change: {
        value: recentOrders,
        type: recentOrders > 0 ? 'increase' : 'neutral',
        period: 'this week'
      }
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: pendingOrders,
      icon: <Calendar />,
      color: 'yellow',
      loading,
      change: {
        value: pendingRate,
        type: pendingRate > 30 ? 'decrease' : pendingRate > 10 ? 'neutral' : 'increase',
        period: 'of total'
      }
    },
    {
      id: 'completed-orders',
      label: 'Completed Orders',
      value: completedOrders,
      icon: <Package />,
      color: 'green',
      loading,
      change: {
        value: completionRate,
        type: completionRate > 70 ? 'increase' : completionRate > 50 ? 'neutral' : 'decrease',
        period: 'completion rate'
      }
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
      icon: <DollarSign />,
      color: 'pink',
      loading,
      change: {
        value: paidOrders + completedOrders,
        type: (paidOrders + completedOrders) > 0 ? 'increase' : 'neutral',
        period: 'paid orders'
      }
    }
  ];

  return <AdminStats stats={stats} columns={4} size="md" />;
};
