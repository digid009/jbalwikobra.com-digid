import React from 'react';
import { Zap, Clock, TrendingUp, Calendar, Percent } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Total Flash Sales */}
      <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.totalFlashSales.toLocaleString()}</p>
            <p className="text-sm text-gray-400 font-medium">Total Flash Sales</p>
          </div>
        </div>
      </div>

      {/* Active Flash Sales */}
      <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.activeFlashSales.toLocaleString()}</p>
            <p className="text-sm text-gray-400 font-medium">Active Sales</p>
          </div>
        </div>
      </div>

      {/* Scheduled Flash Sales */}
      <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.scheduledFlashSales.toLocaleString()}</p>
            <p className="text-sm text-gray-400 font-medium">Scheduled</p>
          </div>
        </div>
      </div>

      {/* Average Discount */}
      <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.averageDiscount.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 font-medium">Average Discount</p>
          </div>
        </div>
      </div>

      {/* Expired Flash Sales */}
      <div className="group relative overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 hover:border-gray-500/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.expiredFlashSales.toLocaleString()}</p>
            <p className="text-sm text-gray-400 font-medium">Expired</p>
          </div>
        </div>
      </div>
    </div>
  );
};
