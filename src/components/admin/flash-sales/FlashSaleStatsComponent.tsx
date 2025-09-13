import React from 'react';
import { Zap, Clock, TrendingUp, Calendar, Percent } from 'lucide-react';
import { IOSCard } from '../../ios/IOSDesignSystemV2';
import { FlashSaleStats } from '../../../types/flashSales';

interface FlashSaleStatsComponentProps {
  stats: FlashSaleStats;
  loading?: boolean;
}

export const FlashSaleStatsComponent: React.FC<FlashSaleStatsComponentProps> = ({
  stats,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-800 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded-lg w-48 mt-2 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-800 rounded-xl w-40 animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Flash Sales */}
        <IOSCard variant="elevated" className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white">
                {stats.totalFlashSales.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200">Total Flash Sales</div>
            </div>
          </div>
        </IOSCard>

        {/* Active Flash Sales */}
        <IOSCard variant="elevated" className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white">
                {stats.activeFlashSales.toLocaleString()}
              </div>
              <div className="text-sm text-green-200">Sedang Berlangsung</div>
            </div>
          </div>
        </IOSCard>

        {/* Scheduled Flash Sales */}
        <IOSCard variant="elevated" className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm border-orange-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white">
                {stats.scheduledFlashSales.toLocaleString()}
              </div>
              <div className="text-sm text-orange-200">Terjadwal</div>
            </div>
          </div>
        </IOSCard>

        {/* Average Discount */}
        <IOSCard variant="elevated" className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-sm border-pink-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shrink-0">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white">
                {stats.averageDiscount.toFixed(1)}%
              </div>
              <div className="text-sm text-pink-200">Rata-rata Diskon</div>
            </div>
          </div>
        </IOSCard>

        {/* Expired Flash Sales */}
        <IOSCard variant="elevated" className="p-6 bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-sm border-gray-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-white">
                {stats.expiredFlashSales.toLocaleString()}
              </div>
              <div className="text-sm text-gray-200">Berakhir</div>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
};
