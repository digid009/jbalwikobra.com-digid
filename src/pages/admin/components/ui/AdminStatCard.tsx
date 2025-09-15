import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  className?: string;
  loading?: boolean;
}

export const AdminStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  className,
  loading = false
}) => {
  if (loading) {
    return (
  <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl", className)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ds-text-tertiary/20 rounded-xl animate-pulse" />
          <div className="flex-1">
            <div className="h-8 bg-ds-text-tertiary/20 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-ds-text-tertiary/20 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl hover:shadow-lg transition-all duration-300", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-ds-text">{value}</p>
            {trend && (
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive 
                  ? "bg-green-500/20 text-green-700" 
                  : "bg-red-500/20 text-red-700"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          <p className="text-sm text-ds-text-secondary">{title}</p>
          {subtitle && (
            <p className="text-xs text-ds-text-tertiary mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-ds-text-tertiary mt-1">
              {trend.period}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
