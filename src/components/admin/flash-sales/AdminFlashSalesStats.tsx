import React from 'react';
import { Zap, Plus, BarChart3 } from 'lucide-react';
import { IOSCard, IOSButton } from '../../ios/IOSDesignSystemV2';

interface AdminFlashSalesStatsProps {
  totalFlashSales: number;
  activeFlashSales: number;
  totalRevenue: number;
  onCreateNew: () => void;
}

export const AdminFlashSalesStats: React.FC<AdminFlashSalesStatsProps> = ({
  totalFlashSales,
  activeFlashSales,
  totalRevenue,
  onCreateNew
}) => {
  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}K`;
    }
    return `Rp ${amount.toLocaleString()}`;
  };

  return (
    <div className="mb-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Flash Sales Management</h1>
          <p className="text-gray-400">Kelola flash sales dan promo terbatas</p>
        </div>
        <IOSButton
          variant="primary"
          onClick={onCreateNew}
          icon={Plus}
          className="shrink-0"
        >
          Buat Flash Sale
        </IOSButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <IOSCard className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalFlashSales}</div>
              <div className="text-sm text-blue-300">Total Flash Sales</div>
            </div>
          </div>
        </IOSCard>

        <IOSCard className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeFlashSales}</div>
              <div className="text-sm text-green-300">Flash Sales Aktif</div>
            </div>
          </div>
        </IOSCard>

        <IOSCard className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatRevenue(totalRevenue)}</div>
              <div className="text-sm text-purple-300">Total Revenue</div>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
};
