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
import { IOSCard, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { cn } from '../../../styles/standardClasses';

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
      <div className="mb-8">
        <IOSSectionHeader 
          title="Dashboard Overview" 
          subtitle="Loading your business metrics..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[...Array(8)].map((_, i) => (
            <IOSCard key={i} variant="elevated" className="animate-pulse">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-ios-background/50 rounded-2xl"></div>
                  <div className="w-12 h-4 bg-ios-background/50 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-ios-background/50 rounded w-2/3"></div>
                  <div className="h-6 bg-ios-background/50 rounded w-4/5"></div>
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8">
        <IOSCard variant="elevated" className="text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-ios-error/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-ios-error" />
            </div>
            <p className="text-ios-text font-medium mb-2">Unable to load statistics</p>
            <p className="text-gray-200 text-sm">Please check your connection and try again</p>
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
      bgColor: 'bg-gradient-to-br from-ios-primary/10 to-ios-primary/5',
      borderColor: 'border-ios-primary/20',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-ios-success',
      bgColor: 'bg-gradient-to-br from-ios-success/10 to-ios-success/5',
      borderColor: 'border-ios-success/20',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-ios-secondary',
      bgColor: 'bg-gradient-to-br from-ios-secondary/10 to-ios-secondary/5',
      borderColor: 'border-ios-secondary/20',
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Revenue',
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-ios-warning',
      bgColor: 'bg-gradient-to-br from-ios-warning/10 to-ios-warning/5',
      borderColor: 'border-ios-warning/20',
      change: '-2%',
      changeType: 'neutral' as const,
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-ios-success',
      bgColor: 'bg-gradient-to-br from-ios-success/10 to-ios-success/5',
      borderColor: 'border-ios-success/20',
      change: '+10%',
      changeType: 'positive' as const,
    },
    {
      title: 'Average Rating',
      value: `${stats.averageRating}/5`,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      change: '+0.2',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: TrendingUp,
      color: 'text-ios-primary',
      bgColor: 'bg-gradient-to-br from-ios-primary/10 to-ios-primary/5',
      borderColor: 'border-ios-primary/20',
      change: '+25%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="mb-8">
      <IOSSectionHeader 
        title="Dashboard Overview" 
        subtitle="Track your business performance and key metrics"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <IOSCard 
              key={index} 
              variant="elevated" 
              className={cn(
                'group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1',
                'border border-transparent hover:border-gray-700/20'
              )}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    'p-3 rounded-2xl transition-all duration-300 group-hover:scale-110',
                    card.bgColor,
                    'border',
                    card.borderColor
                  )}>
                    <Icon className={cn('w-6 h-6 transition-colors duration-300', card.color)} />
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-bold transition-all duration-300',
                    card.changeType === 'positive' 
                      ? 'text-ios-success bg-ios-success/10' 
                      : 'text-gray-200 bg-ios-background'
                  )}>
                    {card.change}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-2 transition-colors duration-300 group-hover:text-ios-text">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-ios-text transition-all duration-300 group-hover:scale-105">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
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
