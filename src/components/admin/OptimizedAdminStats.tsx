import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { adminService, AdminStats } from '../../services/adminService';
import { adminCache } from '../../services/adminCache';
import { IOSCard } from '../ios/IOSDesignSystem';

export const OptimizedAdminStats: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 2 minutes for stats
    const interval = setInterval(() => {
      loadStats(false); // Silent refresh
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await adminService.getAdminStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Force refresh by invalidating cache
      adminCache.invalidate('admin:stats');
      await loadStats(false);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLastUpdated = (): string => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subValue, 
    color,
    loading: cardLoading = false 
  }: {
    icon: any;
    title: string;
    value: string | number;
    subValue?: string;
    color: string;
    loading?: boolean;
  }) => (
    <IOSCard className="h-full">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {cardLoading && (
            <div className="w-4 h-4 border-2 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {cardLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-semibold text-white mt-1">{value}</p>
          )}
          {subValue && !cardLoading && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </IOSCard>
  );

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatLastUpdated()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="bg-gray-9000"
          loading={loading}
        />
        
        <StatCard
          icon={ShoppingBag}
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subValue={`${stats?.pendingOrders || 0} pending`}
          color="bg-green-500"
          loading={loading}
        />
        
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
          color="bg-purple-500"
          loading={loading}
        />
        
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats?.totalProducts || 0}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Star}
          title="Reviews"
          value={stats?.totalReviews || 0}
          subValue={stats?.averageRating ? `${stats.averageRating} avg rating` : 'No reviews'}
          color="bg-yellow-500"
          loading={loading}
        />
        
        <StatCard
          icon={CheckCircle}
          title="Completed Orders"
          value={stats?.completedOrders || 0}
          subValue={stats ? `${((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% completion rate` : ''}
          color="bg-green-600"
          loading={loading}
        />
        
        <StatCard
          icon={AlertCircle}
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subValue={stats ? `${((stats.pendingOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% pending` : ''}
          color="bg-red-500"
          loading={loading}
        />
      </div>

      {/* Cache Performance Indicator */}
      <div className="text-xs text-gray-500 text-center">
        📈 Data is cached for optimal performance • Auto-refreshes every 2 minutes
      </div>
    </div>
  );
};

export default OptimizedAdminStats;
export {};
