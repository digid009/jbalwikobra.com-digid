import React from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Star, 
  TrendingUp 
} from 'lucide-react';
import { AdminStats } from '../../../services/adminService';
import { IOSCard } from '../../../components/ios/IOSDesignSystem';

interface AdminStatsOverviewProps {
  stats: AdminStats | null;
  loading: boolean;
}

export const AdminStatsOverview: React.FC<AdminStatsOverviewProps> = ({
  stats,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <IOSCard key={i} className="animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-ios-background/50 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-ios-background/50 rounded w-3/4"></div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8">
        <IOSCard>
          <div className="p-6 text-center">
            <p className="text-ios-text/60">Failed to load statistics</p>
          </div>
        </IOSCard>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-ios-primary',
      bgColor: 'bg-ios-primary/10',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-ios-success',
      bgColor: 'bg-ios-success/10',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Revenue',
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '-2%',
      changeType: 'neutral' as const,
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-ios-success',
      bgColor: 'bg-ios-success/10',
      change: '+10%',
      changeType: 'positive' as const,
    },
    {
      title: 'Average Rating',
      value: `${stats.averageRating}/5`,
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      change: '+0.2',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      change: '+25%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ios-text">Dashboard Overview</h2>
        <p className="text-ios-text/70">Track your business performance and key metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <IOSCard key={index} className="hover:shadow-lg transition-shadow duration-200" variant="elevated">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className={`text-sm font-medium ${
                    card.changeType === 'positive' 
                      ? 'text-ios-success' 
                      : 'text-ios-text/60'
                  }`}>
                    {card.change}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-ios-text/70 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-ios-text">
                    {card.value}
                  </p>
                </div>
              </div>
            </IOSCard>
          );
        })}
      </div>
    </div>
  );
};
