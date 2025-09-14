import React from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Package, Truck } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const getStatusConfig = (status: string) => {
  const configs = {
    pending: {
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      icon: Clock,
      label: 'Pending'
    },
    confirmed: {
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    preparing: {
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      icon: Package,
      label: 'Preparing'
    },
    ready: {
      color: 'bg-green-500/20 text-green-300 border-green-500/40',
      icon: Truck,
      label: 'Ready'
    },
    completed: {
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      color: 'bg-red-500/20 text-red-300 border-red-500/40',
      icon: XCircle,
      label: 'Cancelled'
    }
  };
  
  return configs[status as keyof typeof configs] || {
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    icon: AlertCircle,
    label: status || 'Unknown'
  };
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm',
      config.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
