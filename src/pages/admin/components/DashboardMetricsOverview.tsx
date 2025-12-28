import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { IOSButton } from '../../../components/ios/IOSDesignSystemV2';
import { RotateCcw, AlertCircle } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import { MetricsGrid, defaultStats } from './metrics/index';

export const DashboardMetricsOverview: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [stats, setStats] = useState(() => ({ ...defaultStats }));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    console.log('🔄 [DashboardMetricsOverview] Starting to load dashboard stats...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache before loading
      adminService.clearStatsCache();
      console.log('🗑️ [DashboardMetricsOverview] Cache cleared');
      
      const s = await adminService.getDashboardStats();
      console.log('📊 [DashboardMetricsOverview] Stats received:', JSON.stringify(s, null, 2));
      
      // Guard against undefined/null returns so rendering never breaks
      if (!s) {
        console.warn('⚠️ [DashboardMetricsOverview] Stats returned null/undefined, using defaults');
        setStats({ ...defaultStats });
        setError('No data received from server');
      } else {
        setStats({ ...defaultStats, ...s });
        console.log('✅ [DashboardMetricsOverview] Stats set successfully');
      }
    } catch (e) {
      console.error('❌ [DashboardMetricsOverview] load error:', e);
      console.error('❌ [DashboardMetricsOverview] Error details:', {
        message: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined
      });
      
      // Ensure we always have safe stats object
      setStats({ ...defaultStats });
      setError(e instanceof Error ? e.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('🚀 [DashboardMetricsOverview] Component mounted, loading stats...');
    load(); 
  }, []);

  const handleRefresh = async () => {
    console.log('🔄 [DashboardMetricsOverview] Manual refresh triggered');
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
          size="sm" 
          variant="ghost" 
          onClick={handleRefresh} 
          disabled={refreshing || loading} 
          className="flex items-center gap-2 hover:bg-pink-500/20 border border-pink-500/30"
        >
          <RotateCcw className={cn('w-4 h-4 text-pink-500', (refreshing || loading) && 'animate-spin')} />
          <span className="hidden sm:inline text-pink-300">Refresh</span>
        </IOSButton>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error Loading Dashboard Data</h3>
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-red-300/70 text-xs mt-2">
              Check the browser console for detailed error logs.
            </p>
          </div>
        </div>
      )}
      
      <MetricsGrid 
        stats={stats} 
        loading={loading} 
        className="transition-all duration-500"
      />
    </div>
  );
};

export default DashboardMetricsOverview;
