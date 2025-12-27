import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
}

export const AdminBadge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className
}) => {
  const variantClasses = {
    default: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    success: 'bg-green-500/20 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-500/20 text-red-700 dark:text-red-400',
    info: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-400'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-lg font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
};

// Status Badge Helpers
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'draft';
  customLabel?: string;
}> = ({ status, customLabel }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Aktif' },
    inactive: { variant: 'error' as const, label: 'Tidak Aktif' },
    pending: { variant: 'warning' as const, label: 'Menunggu' },
    archived: { variant: 'default' as const, label: 'Diarsipkan' },
    draft: { variant: 'info' as const, label: 'Draft' }
  };

  const config = statusConfig[status];
  
  return (
    <AdminBadge variant={config.variant}>
      {customLabel || config.label}
    </AdminBadge>
  );
};

export const PaymentBadge: React.FC<{
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  customLabel?: string;
}> = ({ status, customLabel }) => {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'Menunggu' },
    paid: { variant: 'success' as const, label: 'Lunas' },
    failed: { variant: 'error' as const, label: 'Gagal' },
    refunded: { variant: 'info' as const, label: 'Refund' },
    cancelled: { variant: 'default' as const, label: 'Dibatalkan' }
  };

  const config = statusConfig[status];
  
  return (
    <AdminBadge variant={config.variant}>
      {customLabel || config.label}
    </AdminBadge>
  );
};
