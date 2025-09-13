import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { IOSCard } from '../ios/IOSDesignSystemV2';

interface FlashSalesStatsProps {
  totalProducts: number;
  maxDiscount: number;
}

export const FlashSalesStats: React.FC<FlashSalesStatsProps> = ({ 
  totalProducts, 
  maxDiscount 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <IOSCard className="p-6 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 backdrop-blur-sm border-pink-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalProducts}</div>
            <div className="text-sm text-pink-300">Produk Tersedia</div>
          </div>
        </div>
      </IOSCard>
      
      <IOSCard className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{maxDiscount}%</div>
            <div className="text-sm text-red-300">Diskon Maksimal</div>
          </div>
        </div>
      </IOSCard>
    </div>
  );
};
