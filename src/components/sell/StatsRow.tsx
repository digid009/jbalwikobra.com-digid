import React from 'react';
import { Star, TrendingUp, MessageCircle, LucideIcon } from 'lucide-react';
import { PNText } from '../ui/PinkNeonDesignSystem';

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
  gradient: string;
  iconColor: string;
}

interface StatsRowProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  {
    icon: Star,
    value: '4.9/5',
    label: 'Rating Pengguna',
    gradient: 'from-pink-500/10 to-purple-500/10 border-pink-500/20',
    iconColor: 'text-yellow-400'
  },
  {
    icon: TrendingUp,
    value: '1,350+',
    label: 'Akun Terjual',
    gradient: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    iconColor: 'text-green-400'
  },
  {
    icon: MessageCircle,
    value: '24 Jam',
    label: 'Respon Cepat',
    gradient: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    iconColor: 'text-blue-400'
  }
];

export const StatsRow: React.FC<StatsRowProps> = ({ stats = defaultStats }) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div 
            key={index}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-gradient-to-r ${stat.gradient} rounded-xl border`}
          >
            <IconComponent className={`${stat.iconColor}`} size={20} />
            <div className="text-center sm:text-left">
              <PNText className="text-white font-semibold text-sm sm:text-base">
                {stat.value}
              </PNText>
              <PNText className="text-gray-400 text-xs sm:text-sm">
                {stat.label}
              </PNText>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsRow;
