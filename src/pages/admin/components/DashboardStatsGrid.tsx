import React from 'react';
import { DollarSign, Users, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { IOSCard } from '../../../components/ios/IOSDesignSystemV2';
import { DashboardStats } from '../types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  trend, 
  color = 'primary' 
}) => {
  const colorClasses = {
  primary: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  destructive: 'text-rose-400'
  };

  return (
    <IOSCard className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-200 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {trend && (
            <p className="text-xs text-gray-200 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`${colorClasses[color]} bg-black-secondary p-3 rounded-xl`}>
            {icon}
          </div>
        )}
      </div>
    </IOSCard>
  );
};

interface DashboardStatsGridProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-black-secondary rounded mb-4"></div>
            <div className="h-8 bg-black-secondary rounded mb-2"></div>
            <div className="h-3 bg-black-secondary rounded w-2/3"></div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Revenue"
          value="₹0"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          label="Total Orders"
          value="0"
          icon={<BarChart3 className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          label="Total Users"
          value="0"
          icon={<Users className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          label="Total Products"
          value="0"
          icon={<Package className="w-6 h-6" />}
          color="destructive"
        />
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(stats.orders.revenue)}
        icon={<DollarSign className="w-6 h-6" />}
        trend={`${stats.orders.completedRevenue > 0 ? '+' : ''}${formatCurrency(stats.orders.completedRevenue)} completed`}
        color="success"
      />
      <StatCard
        label="Total Orders"
        value={stats.orders.count}
        icon={<BarChart3 className="w-6 h-6" />}
        trend={`${stats.orders.completed} completed`}
        color="primary"
      />
      <StatCard
        label="Total Users"
        value={stats.users.count}
        icon={<Users className="w-6 h-6" />}
        color="warning"
      />
      <StatCard
        label="Total Products"
        value={stats.products.count}
        icon={<Package className="w-6 h-6" />}
        trend={`${stats.flashSales.count} flash sales`}
        color="destructive"
      />
    </div>
  );
};

export default DashboardStatsGrid;
