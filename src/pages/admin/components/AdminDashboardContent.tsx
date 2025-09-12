import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, AlertCircle, RotateCcw, Calendar, Activity, Bell, BarChart, Package, TrendingDown } from 'lucide-react';
import { adminService, AdminNotification, OrderDayStat } from '../../../services/adminService';
import { DashboardMetricsOverview } from './DashboardMetricsOverview';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { DashboardSection, DataPanel } from '../layout/DashboardPrimitives';
import { adminCache } from '../../../services/adminCache';
import { cn } from '../../../styles/standardClasses';
import './AdminDashboardContent.css';

interface AdminDashboardContentProps {
  onRefreshStats?: () => void;
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ onRefreshStats }) => {
  const [recentNotifications, setRecentNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [series, setSeries] = useState<OrderDayStat[]>([]);
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    loadDashboardData();
    // Prefetch dashboard data on mount
    adminService.prefetchDashboardData();
  }, []);

  // Reload data when range changes
  useEffect(() => {
    loadDashboardData();
  }, [range]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Use cached notification data
      const notifications = await adminService.getNotifications(1, 5);
      setRecentNotifications(notifications);
      const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
      const ts = await adminService.getOrdersTimeSeries(customStart && customEnd ? { startDate: customStart, endDate: customEnd } : { days });
      setSeries(ts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Force refresh cached data
      adminCache.invalidatePattern('admin:');
      await loadDashboardData();
      await adminService.prefetchDashboardData();
      // Also refresh the main stats
      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'new_order':
        return '🛒';
      case 'paid_order':
        return '💰';
      case 'cancelled_order':
        return '❌';
      case 'new_user':
        return '👤';
      case 'new_review':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: AdminNotification['type']) => {
    switch (type) {
      case 'new_order':
        return 'bg-ios-primary/10 border-ios-primary/20';
      case 'paid_order':
        return 'bg-ios-success/10 border-ios-success/20';
      case 'cancelled_order':
        return 'bg-ios-danger/10 border-ios-danger/20';
      case 'new_user':
        return 'bg-ios-secondary/10 border-ios-secondary/20';
      case 'new_review':
        return 'bg-ios-warning/10 border-ios-warning/20';
      default:
        return 'bg-black/50 border-ios-primary/20';
    }
  };

  const maxCount = useMemo(() => Math.max(1, ...series.map(s => s.count)), [series]);
  const maxRevenue = useMemo(() => Math.max(1, ...series.map(s => s.revenue)), [series]);

  const handleRangeChange = (val: '7d'|'14d'|'30d') => {
    setRange(val); setCustomStart(''); setCustomEnd('');
  };
  const applyCustomRange = () => { if (customStart && customEnd) loadDashboardData(); };

  return (
    <div className="space-y-8">
      <DashboardMetricsOverview onRefresh={onRefreshStats} />

      <DashboardSection title="Analytics Dashboard" subtitle="Track your store performance" dense>
        <DataPanel>
          {/* Analytics Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/60 dark:bg-white/10 ring-1 ring-white/10">
                <Calendar className="w-5 h-5 text-pink-500" />
              </div>
              <span className="typescale-h4">Analytics</span>
            </div>
            <IOSButton 
              size="small" 
              variant="ghost" 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              className="flex items-center space-x-2 hover:bg-pink-500/20 border border-pink-500/30 rounded-xl"
            >
              <RotateCcw className={cn('w-4 h-4 text-pink-500', (refreshing || loading) && 'animate-spin')} /> 
              <span className="hidden sm:inline text-pink-300">Refresh</span>
            </IOSButton>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 grad-surface-sheen rounded-2xl border border-ios-background/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex bg-black/70 backdrop-blur-sm rounded-xl border border-gray-600 overflow-hidden shadow-lg shadow-black/50">
                {(['7d','14d','30d'] as const).map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleRangeChange(opt)} 
                    className={cn(
                      'px-4 py-2 text-sm font-semibold transition-all duration-200',
                      range === opt 
                        ? 'bg-ios-primary text-white shadow-lg' 
                        : 'text-gray-200 hover:bg-black/50 hover:text-white'
                    )}
                  >
                    {opt.replace('d', ' days')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-600">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e=>setCustomStart(e.target.value)} 
                  className="bg-transparent text-sm text-white focus:outline-none" 
                />
                <span className="text-gray-200 text-sm">to</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e=>setCustomEnd(e.target.value)} 
                  className="bg-transparent text-sm text-white focus:outline-none" 
                />
              </div>
              <IOSButton size="small" onClick={applyCustomRange} disabled={!customStart || !customEnd}>
                Apply
              </IOSButton>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Revenue Timeline Chart */}
            <div className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-gray-600">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-ios-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-ios-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Total revenue per team - timeline</h4>
                  <p className="text-sm text-gray-300 font-medium">Track your store performance</p>
                </div>
              </div>
              
              {loading && series.length===0 ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-ios-primary/20 border-t-ios-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-white font-medium">Loading analytics...</p>
                  </div>
                </div>
              ) : series.length===0 ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-ios-background/30 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                      <BarChart className="w-6 h-6 text-gray-200" />
                    </div>
                    <p className="text-sm text-white font-medium">No data available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-80 relative bg-gradient-to-br from-gray-900/30 to-gray-800/20 rounded-2xl border border-gray-700/30 backdrop-blur-sm p-6">
                    <svg className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        {/* Area gradient for main revenue */}
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6"/>
                          <stop offset="30%" stopColor="#A855F7" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.1"/>
                        </linearGradient>
                        
                        {/* Secondary area for contrast */}
                        <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Main revenue area chart */}
                      <path 
                        d={`M 0 100 ${series.map((d, i) => {
                          const x = (i / (series.length - 1)) * 100;
                          const y = 100 - (d.revenue / maxRevenue) * 85;
                          return `L ${x} ${y}`;
                        }).join(' ')} L 100 100 Z`}
                        fill="url(#areaGradient)"
                        className="drop-shadow-lg"
                      />
                      
                      {/* Secondary area (ghostbusters simulation) */}
                      <path 
                        d={`M 0 100 ${series.map((d, i) => {
                          const x = (i / (series.length - 1)) * 100;
                          const y = 100 - (d.count * 100 / maxCount) * 75; // Different scale
                          return `L ${x} ${y}`;
                        }).join(' ')} L 100 100 Z`}
                        fill="url(#secondaryGradient)"
                        className="drop-shadow-md"
                      />
                      
                      {/* Main revenue line (A-team) */}
                      <path 
                        d={`M ${series.map((d, i) => {
                          const x = (i / (series.length - 1)) * 100;
                          const y = 100 - (d.revenue / maxRevenue) * 85;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="3"
                        className="drop-shadow-lg"
                      />
                      
                      {/* Secondary line (Ghostbusters) */}
                      <path 
                        d={`M ${series.map((d, i) => {
                          const x = (i / (series.length - 1)) * 100;
                          const y = 100 - (d.count * 100 / maxCount) * 75;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeOpacity="0.8"
                        className="drop-shadow-md"
                      />
                      
                      {/* Data points for main line */}
                      {series.map((d, i) => {
                        const x = (i / (series.length - 1)) * 100;
                        const y = 100 - (d.revenue / maxRevenue) * 85;
                        return (
                          <circle
                            key={`main-${i}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#7C3AED"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="drop-shadow-md"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Chart Legend */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-gray-600/40">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
                        <span className="text-sm text-gray-200 font-medium">A-team</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-300 opacity-70"></div>
                        <span className="text-sm text-gray-300 font-medium">Ghostbusters</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-sm text-gray-400 font-medium">Little rascals</span>
                      </div>
                    </div>
                    
                    {/* Y-axis labels */}
                    <div className="absolute left-2 top-6 bottom-12 flex flex-col justify-between text-right">
                      <span className="text-xs text-gray-400 font-medium">€{Math.round(maxRevenue * 0.001).toLocaleString()}K</span>
                      <span className="text-xs text-gray-400 font-medium">€{Math.round(maxRevenue * 0.0008).toLocaleString()}K</span>
                      <span className="text-xs text-gray-400 font-medium">€{Math.round(maxRevenue * 0.0006).toLocaleString()}K</span>
                      <span className="text-xs text-gray-400 font-medium">€{Math.round(maxRevenue * 0.0004).toLocaleString()}K</span>
                      <span className="text-xs text-gray-400 font-medium">€{Math.round(maxRevenue * 0.0002).toLocaleString()}K</span>
                      <span className="text-xs text-gray-400 font-medium">€0</span>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-2 left-12 right-6 flex justify-between">
                      {series.map((d, i) => {
                        if (i % Math.max(1, Math.ceil(series.length / 8)) !== 0 && i !== series.length - 1) return null;
                        const date = new Date(d.date);
                        return (
                          <span key={d.date} className="text-xs text-gray-400 font-medium">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DataPanel>
      </DashboardSection>
    </div>
  );
};
