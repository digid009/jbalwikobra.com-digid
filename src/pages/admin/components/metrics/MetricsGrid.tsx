import React from 'react';
import { TrendingUp, Users, Package, Star, Clock, Zap } from 'lucide-react';
import { AdminStats } from '../../../../services/adminService';
import { MetricCard } from './MetricCard';
import { formatMetrics, getMetricAccentColor } from './metricsUtils';
import { cn } from '../../../../styles/standardClasses';

interface MetricsGridProps {
  stats: AdminStats;
  loading?: boolean;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats, loading, className }) => {
  const metrics = formatMetrics(stats);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              'rounded-2xl h-40 bg-gradient-to-br from-pink-500/10 to-fuchsia-600/5 border border-pink-500/20',
              i === 0 && 'lg:col-span-2 h-48'
            )} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      <MetricCard
        large
        label="Total Revenue"
        value={metrics.revenue.formatted}
        sub={metrics.revenue.subtitle}
        icon={<TrendingUp className="w-7 h-7" />}
        accent={getMetricAccentColor('revenue')}
      />
      
      <MetricCard
        label="Total Orders"
        value={metrics.orders.formatted}
        sub={metrics.orders.subtitle}
        icon={<Clock className="w-6 h-6" />}
        accent={getMetricAccentColor('orders')}
      />
      
      <MetricCard
        label="Users"
        value={metrics.users.formatted}
        sub={metrics.users.subtitle}
        icon={<Users className="w-6 h-6" />}
        accent={getMetricAccentColor('users')}
      />
      
      <MetricCard
        label="Products"
        value={metrics.products.formatted}
        sub={metrics.products.subtitle}
        icon={<Package className="w-6 h-6" />}
        accent={getMetricAccentColor('products')}
      />
      
      <MetricCard
        label="Flash Sales"
        value={metrics.flashSales?.formatted || "0"}
        sub={metrics.flashSales?.subtitle || "active sales"}
        icon={<Zap className="w-6 h-6" />}
        accent={getMetricAccentColor('flashSales')}
      />
      
      <MetricCard
        label="Reviews & Ratings"
        value={metrics.reviews.formatted}
        sub={metrics.reviews.subtitle}
        icon={<Star className="w-6 h-6" />}
        accent={getMetricAccentColor('reviews')}
      />
    </div>
  );
};

export default MetricsGrid;
