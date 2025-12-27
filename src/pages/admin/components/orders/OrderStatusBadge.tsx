import React from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Package, Truck } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const getStatusConfig = (status: string) => {
  const configs = {
    pending:   { icon: Clock,      label: 'Pending',   iconColor: 'text-amber-500' },
    confirmed: { icon: CheckCircle, label: 'Confirmed', iconColor: 'text-blue-500' },
    preparing: { icon: Package,     label: 'Preparing', iconColor: 'text-pink-400' },
    ready:     { icon: Truck,       label: 'Ready',     iconColor: 'text-emerald-500' },
    completed: { icon: CheckCircle, label: 'Completed', iconColor: 'text-emerald-500' },
    cancelled: { icon: XCircle,     label: 'Cancelled', iconColor: 'text-rose-500' }
  } as const;

  return configs[status as keyof typeof configs] || {
    icon: AlertCircle,
    label: status || 'Unknown',
    iconColor: 'text-ds-text-secondary'
  };
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-token bg-[var(--bg-tertiary)] text-ds-text',
      className
    )}>
      <Icon className={cn('w-3.5 h-3.5', config.iconColor)} />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
