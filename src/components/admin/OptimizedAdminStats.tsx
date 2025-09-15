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
import { IOSCard, IOSButton } from '../ios/IOSDesignSystemV2';

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
    <IOSCard className="h-full surface-glass-md">
      <div className="p-stack-md">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {cardLoading && (
            <div className="w-4 h-4 border-2 border-surface-tint-pink border-t-surface-tint-pink/30 rounded-full animate-spin"></div>
          )}
        </div>
        <div className="mt-stack-md">
          <h3 className="fs-sm font-medium text-surface-tint-gray">{title}</h3>
          {cardLoading ? (
            <div className="h-6 surface-glass-sm rounded animate-pulse mt-1"></div>
          ) : (
            <p className="heading-lg text-white mt-1">{value}</p>
          )}
          {subValue && !cardLoading && (
            <p className="fs-xs text-surface-tint-gray mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </IOSCard>
  );

  return (
    <div className="space-y-stack-lg">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="heading-lg text-white">Dashboard Overview</h2>
        <div className="flex items-center gap-cluster-md">
          {lastUpdated && (
            <span className="fs-sm text-surface-tint-gray flex items-center gap-cluster-xs">
              <Clock className="w-4 h-4" />
              {formatLastUpdated()}
            </span>
          )}
          <IOSButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-cluster-xs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </IOSButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="surface-tint-gray"
          loading={loading}
        />
        
        <StatCard
          icon={ShoppingBag}
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subValue={`${stats?.pendingOrders || 0} pending`}
          color="surface-tint-green"
          loading={loading}
        />
        
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
          color="surface-tint-purple"
          loading={loading}
        />
        
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats?.totalProducts || 0}
          color="surface-tint-orange"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        <StatCard
          icon={Star}
          title="Reviews"
          value={stats?.totalReviews || 0}
          subValue={stats?.averageRating ? `${stats.averageRating} avg rating` : 'No reviews'}
          color="surface-tint-yellow"
          loading={loading}
        />
        
        <StatCard
          icon={CheckCircle}
          title="Completed Orders"
          value={stats?.completedOrders || 0}
          subValue={stats ? `${((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% completion rate` : ''}
          color="surface-tint-green"
          loading={loading}
        />
        
        <StatCard
          icon={AlertCircle}
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subValue={stats ? `${((stats.pendingOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}% pending` : ''}
          color="surface-tint-red"
          loading={loading}
        />
      </div>

      {/* Cache Performance Indicator */}
      <div className="fs-xs text-surface-tint-gray text-center">
        📈 Data is cached for optimal performance • Auto-refreshes every 2 minutes
      </div>
    </div>
  );
};

export default OptimizedAdminStats;
export {};
