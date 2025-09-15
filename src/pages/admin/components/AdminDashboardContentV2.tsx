import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  Star,
  Calendar,
  RotateCcw,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp as TrendingUpIcon,
  Zap
} from 'lucide-react';
import { adminClient, AdminDashboardStats, OrderStatusTimeSeries } from '../../../services/unifiedAdminClient';
import { AdminNotification } from '../../../services/adminNotificationService';
import { prefetchManager } from '../../../services/intelligentPrefetch';
import { OrderAnalyticsChart } from './OrderAnalyticsChart';

interface AdminDashboardContentProps {
  onRefreshStats?: () => void;
}

interface DashboardMetrics {
  totalRevenue: number;
  todayOrders: number;
  totalProducts: number;
  activeFlashSales: number;
  conversionRate: number;
  avgOrderValue: number;
  customerRating: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
  color?: 'pink' | 'blue' | 'green' | 'orange' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  trend = 'stable',
  color = 'pink' 
}) => {
  const colorMap = {
    pink: 'from-pink-500 to-fuchsia-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-green-600',
    orange: 'from-orange-500 to-red-600',
    purple: 'from-purple-500 to-violet-600'
  };

  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
  const TrendIcon = trendIcon;

  return (
    <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
              changeType === 'increase' ? 'bg-emerald-500/10 text-emerald-400' :
              changeType === 'decrease' ? 'bg-red-500/10 text-red-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  color?: 'pink' | 'blue' | 'green' | 'orange' | 'purple';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon: Icon, onClick, color = 'pink' }) => {
  const colorMap = {
    pink: 'hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400',
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400',
    green: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400',
    orange: 'hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400'
  };

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-4 bg-black border border-gray-800 rounded-xl transition-all duration-300 ${colorMap[color]}`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition-colors">
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-current transition-colors" />
        </div>
        <div>
          <p className="font-medium text-white group-hover:text-current transition-colors">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );
};

interface NotificationItemProps {
  notification: AdminNotification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'new_order': return '🛒';
      case 'paid_order': return '💰';
      case 'order_cancelled': return '❌';
      case 'new_user': return '👤';
      case 'new_review': return '⭐';
      case 'system': return '⚠️';
      default: return '📢';
    }
  };

  const getColor = (type: AdminNotification['type']) => {
    switch (type) {
      case 'new_order': return 'border-blue-500/20 bg-blue-500/5';
      case 'paid_order': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'order_cancelled': return 'border-red-500/20 bg-red-500/5';
      case 'new_user': return 'border-purple-500/20 bg-purple-500/5';
      case 'new_review': return 'border-yellow-500/20 bg-yellow-500/5';
      case 'system': return 'border-orange-500/20 bg-orange-500/5';
      default: return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getColor(notification.type)} transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{notification.title}</p>
          <p className="text-xs text-gray-400 truncate">{notification.message}</p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(notification.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export const AdminDashboardContentV2: React.FC<AdminDashboardContentProps> = ({ onRefreshStats }) => {
  // Raw data from API
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats>({
    orders: { count: 0, completed: 0, pending: 0, revenue: 0, completedRevenue: 0 },
    users: { count: 0 },
    products: { count: 0 },
    flashSales: { count: 0 },
    reviews: { count: 0, averageRating: 0 }
  });
  
  // Processed metrics for display
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    todayOrders: 0,
    totalProducts: 0,
    activeFlashSales: 0,
    conversionRate: 2.5,
    avgOrderValue: 0,
    customerRating: 0
  });
  
  const [recentNotifications, setRecentNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate metrics from raw stats
  const calculateMetrics = (stats: AdminDashboardStats): DashboardMetrics => {
    const avgOrderValue = stats.orders.count > 0 
      ? Math.round(stats.orders.revenue / stats.orders.count) 
      : 0;
    
    return {
      totalRevenue: stats.orders.revenue || 0,
      todayOrders: stats.orders.count || 0,
      totalProducts: stats.products.count || 0,
      activeFlashSales: stats.flashSales.count || 0,
      conversionRate: 2.5, // Static for now, can be calculated later
      avgOrderValue,
      customerRating: stats.reviews.averageRating || 0
    };
  };

  useEffect(() => {
    prefetchManager.setCurrentPage('dashboard');
    loadDashboardData();
    adminClient.prefetchDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data...');
      
      const batchResults = await adminClient.batchRequest([
        { id: 'stats', endpoint: 'dashboard-stats' },
        { id: 'notifications', endpoint: 'recent-notifications', params: { limit: 6 } }
      ]);

      console.log('📊 Batch results:', batchResults);

      if (batchResults.stats?.data) {
        console.log('📈 Dashboard stats loaded:', batchResults.stats.data);
        const newStats = batchResults.stats.data;
        setDashboardStats(newStats);
        setDashboardMetrics(calculateMetrics(newStats));
      } else {
        console.warn('⚠️ No stats data received');
      }
      
      if (batchResults.notifications?.data) {
        console.log('🔔 Notifications loaded:', batchResults.notifications.data);
        setRecentNotifications(batchResults.notifications.data);
      } else {
        console.warn('⚠️ No notifications data received');
      }
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Use default metrics on error
      const defaultStats = {
        orders: { count: 0, completed: 0, pending: 0, revenue: 0, completedRevenue: 0 },
        users: { count: 0 },
        products: { count: 0 },
        flashSales: { count: 0 },
        reviews: { count: 0, averageRating: 0 }
      };
      setDashboardStats(defaultStats);
      setDashboardMetrics(calculateMetrics(defaultStats));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      adminClient.invalidateOrdersCaches();
      adminClient.invalidateUsersCaches();
      adminClient.invalidateProductsCaches();
      
      await loadDashboardData();
      await adminClient.prefetchDashboardData();
      
      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const dashboardQuickActions = [
    {
      title: 'Add Product',
      description: 'Create new product listing',
      icon: Package,
      onClick: () => window.location.href = '/admin/products',
      color: 'blue' as const
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      onClick: () => window.location.href = '/admin/orders',
      color: 'green' as const
    },
    {
      title: 'User Management',
      description: 'Manage user accounts',
      icon: Users,
      onClick: () => window.location.href = '/admin/users',
      color: 'purple' as const
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      onClick: () => window.location.href = '/admin/analytics',
      color: 'orange' as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-800 rounded animate-pulse w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 hover:bg-pink-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`Rp ${dashboardMetrics.totalRevenue.toLocaleString()}`}
            change={12.5}
            changeType="increase"
            icon={DollarSign}
            trend="up"
            color="green"
          />
          <MetricCard
            title="Orders Today"
            value={dashboardMetrics.todayOrders}
            change={8.2}
            changeType="increase"
            icon={ShoppingCart}
            trend="up"
            color="blue"
          />
          <MetricCard
            title="Total Products"
            value={dashboardMetrics.totalProducts}
            change={-2.1}
            changeType="decrease"
            icon={Package}
            trend="down"
            color="orange"
          />
          <MetricCard
            title="Active Flash Sales"
            value={dashboardMetrics.activeFlashSales}
            change={15.3}
            changeType="increase"
            icon={Zap}
            trend="up"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-black border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <TrendingUpIcon className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {dashboardQuickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Analytics Chart */}
          <div className="lg:col-span-2">
            <OrderAnalyticsChart loading={loading} />
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <PieChart className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Analytics Overview</h3>
            </div>
            <button
              onClick={() => window.location.href = '/admin/analytics'}
              className="flex items-center space-x-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
            >
              <span>View Details</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-black border border-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-white mb-1">{dashboardMetrics.conversionRate}%</p>
              <p className="text-sm text-gray-400">Conversion Rate</p>
            </div>
            <div className="text-center p-4 bg-black border border-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-white mb-1">
                Rp {dashboardMetrics.avgOrderValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">Avg Order Value</p>
            </div>
            <div className="text-center p-4 bg-black border border-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-white mb-1">
                {dashboardMetrics.customerRating > 0 ? `${dashboardMetrics.customerRating.toFixed(1)}/5` : '0/5'}
              </p>
              <p className="text-sm text-gray-400">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContentV2;
