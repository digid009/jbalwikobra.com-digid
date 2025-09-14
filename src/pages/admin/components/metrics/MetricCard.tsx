import React from 'react';
/**
 * DEPRECATED COMPONENT
 * --------------------
 * MetricCard has been superseded by `AdminStatCard` (tokenized variant system).
 * Do not add new usages. Migrate existing references to `AdminStatCard` and then remove this file.
 */
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  large?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  sub, 
  icon, 
  accent = 'from-pink-500/30 via-pink-600/20 to-fuchsia-600/10', 
  large,
  className 
}) => {
  // Get specific styling based on label
  const getCardStyling = (label: string) => {
    switch (label.toLowerCase()) {
      case 'total revenue':
        return {
          bg: 'bg-gradient-to-br from-emerald-600/90 via-emerald-700/80 to-emerald-800/70',
          border: 'border-emerald-500/30',
          iconBg: 'bg-emerald-500/20 border-emerald-400/30',
          iconColor: 'text-emerald-300',
          textGradient: 'from-white to-emerald-100'
        };
      case 'total orders':
        return {
          bg: 'bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-blue-800/70',
          border: 'border-blue-500/30',
          iconBg: 'bg-blue-500/20 border-blue-400/30',
          iconColor: 'text-blue-300',
          textGradient: 'from-white to-blue-100'
        };
      case 'products':
        return {
          bg: 'bg-gradient-to-br from-purple-600/90 via-purple-700/80 to-purple-800/70',
          border: 'border-purple-500/30',
          iconBg: 'bg-purple-500/20 border-purple-400/30',
          iconColor: 'text-purple-300',
          textGradient: 'from-white to-purple-100'
        };
      case 'reviews & ratings':
        return {
          bg: 'bg-gradient-to-br from-amber-600/90 via-amber-700/80 to-amber-800/70',
          border: 'border-amber-500/30',
          iconBg: 'bg-amber-500/20 border-amber-400/30',
          iconColor: 'text-amber-300',
          textGradient: 'from-white to-amber-100'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-600/90 via-gray-700/80 to-gray-800/70',
          border: 'border-gray-500/30',
          iconBg: 'bg-gray-500/20 border-gray-400/30',
          iconColor: 'text-gray-300',
          textGradient: 'from-white to-gray-100'
        };
    }
  };

  const styling = getCardStyling(label);

  return (
    <div className={cn(
      'relative rounded-2xl p-6 border backdrop-blur-md overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]',
      styling.bg,
      styling.border,
      large ? 'lg:col-span-2 flex flex-col justify-between min-h-[180px]' : 'min-h-[140px] flex flex-col justify-between',
      'hover:shadow-2xl',
      className
    )}>
      {/* Background pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.3),transparent_70%)]" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold tracking-wider text-white/70 uppercase">
            {label}
          </p>
          <h3 className={cn(
            'font-bold bg-gradient-to-r bg-clip-text text-transparent',
            styling.textGradient,
            large ? 'text-4xl xl:text-5xl' : 'text-2xl xl:text-3xl'
          )}>
            {value}
          </h3>
          {sub && (
            <p className="text-sm font-medium text-white/60">
              {sub}
            </p>
          )}
        </div>
        <div className={cn(
          'w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg backdrop-blur-sm',
          styling.iconBg,
          styling.iconColor
        )}>
          {icon}
        </div>
      </div>
      
      {/* Enhanced glow effect for large cards */}
      {large && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
      )}
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
};

export default MetricCard;
