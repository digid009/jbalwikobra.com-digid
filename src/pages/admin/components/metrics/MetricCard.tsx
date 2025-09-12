import React from 'react';
import { cn } from '../../../../styles/standardClasses';

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
  return (
    <div className={cn(
      'relative rounded-2xl p-6 border border-pink-500/20 bg-gradient-to-br backdrop-blur-md overflow-hidden shadow-lg shadow-pink-500/10',
      accent,
      large ? 'lg:col-span-2 flex flex-col justify-between min-h-[180px]' : 'min-h-[140px] flex flex-col justify-between',
      'hover:shadow-xl hover:shadow-pink-500/20 hover:border-pink-500/30 transition-all duration-300 hover:scale-[1.02]',
      className
    )}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.3),transparent_70%)]" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold tracking-wider text-pink-200/80 uppercase">
            {label}
          </p>
          <h3 className={cn(
            'font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent',
            large ? 'text-4xl xl:text-5xl' : 'text-2xl xl:text-3xl'
          )}>
            {value}
          </h3>
          {sub && (
            <p className="text-sm font-medium text-pink-200/70">
              {sub}
            </p>
          )}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/30 to-fuchsia-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300 shadow-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      
      {/* Enhanced shimmer effect for large cards */}
      {large && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
      )}
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-pink-500/20 pointer-events-none" />
    </div>
  );
};

export default MetricCard;
