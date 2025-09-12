import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { IOSButton } from '../../../components/ios/IOSDesignSystem';
import { RotateCcw } from 'lucide-react';
import { cn } from '../../../styles/standardClasses';
import { MetricsGrid, defaultStats } from './metrics';

export const DashboardMetricsOverview: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [stats, setStats] = useState(() => ({ ...defaultStats }));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const s = await adminService.getDashboardStats();
      // Guard against undefined/null returns so rendering never breaks
      setStats(s ? { ...defaultStats, ...s } : { ...defaultStats });
    } catch (e) {
      console.error('[DashboardMetricsOverview] load error', e);
      // Ensure we always have safe stats object
      setStats({ ...defaultStats });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
      onRefresh?.();
    } finally { 
      setRefreshing(false); 
    }
  };

  return (
    <div className="space-y-6" aria-label="Store performance metrics">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
          Overview
        </h2>
        <IOSButton 
          size="small" 
          variant="ghost" 
          onClick={handleRefresh} 
          disabled={refreshing || loading} 
          className="flex items-center gap-2 hover:bg-pink-500/20 border border-pink-500/30"
        >
          <RotateCcw className={cn('w-4 h-4 text-pink-500', (refreshing || loading) && 'animate-spin')} />
          <span className="hidden sm:inline text-pink-300">Refresh</span>
        </IOSButton>
      </div>
      
      <MetricsGrid 
        stats={stats} 
        loading={loading} 
        className="transition-all duration-500"
      />
    </div>
  );
};

export default DashboardMetricsOverview;
