import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, AlertCircle, RotateCcw, Calendar, Activity, Bell, BarChart, Package, TrendingDown } from 'lucide-react';
import { adminClient, AdminDashboardStats, AdminNotification, OrderStatusTimeSeries } from '../../../services/unifiedAdminClient';
import { prefetchManager } from '../../../services/intelligentPrefetch';
import { DashboardMetricsOverview } from './DashboardMetricsOverview';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { DashboardSection, DataPanel } from '../layout/DashboardPrimitives';
import { AdminPerformanceMonitor } from './AdminPerformanceMonitor';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import './AdminDashboardContent.css';

interface AdminDashboardContentProps {
  onRefreshStats?: () => void;
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ onRefreshStats }) => {
  const [recentNotifications, setRecentNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [series, setSeries] = useState<OrderStatusTimeSeries[]>([]);
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    // Set current page for intelligent prefetching
    prefetchManager.setCurrentPage('dashboard');
    
    loadDashboardData();
    // Prefetch dashboard data on mount
    adminClient.prefetchDashboardData();
  }, []);

  // Reload data when range changes
  useEffect(() => {
    loadDashboardData();
  }, [range]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use batch request for efficiency
      const batchResults = await adminClient.batchRequest([
        { id: 'stats', endpoint: 'dashboard-stats' },
        { id: 'notifications', endpoint: 'recent-notifications', params: { limit: 5 } }
      ]);

      if (batchResults.stats?.data) {
        setDashboardStats(batchResults.stats.data);
      }
      
      if (batchResults.notifications?.data) {
        setRecentNotifications(batchResults.notifications.data);
      }

      // Get time series data
      const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
      const timeSeriesOptions = customStart && customEnd 
        ? { startDate: customStart, endDate: customEnd }
        : { days };
      
      const timeSeries = await adminClient.getOrderStatusTimeSeries(timeSeriesOptions);
      setSeries(timeSeries);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Force refresh cached data using unified client
      adminClient.invalidateOrdersCaches();
      adminClient.invalidateUsersCaches();
      adminClient.invalidateProductsCaches();
      
      await loadDashboardData();
      await adminClient.prefetchDashboardData();
      
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
      case 'low_stock':
        return '⚠️';
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
      case 'low_stock':
        return 'bg-ios-warning/10 border-ios-warning/20';
      default:
        return 'bg-black/50 border-ios-primary/20';
    }
  };

  // Use 'total' instead of 'created' as it exists in OrderStatusTimeSeries
  const maxTotal = useMemo(() => Math.max(1, ...series.map(s => s.total)), [series]);
  const maxCompleted = useMemo(() => Math.max(1, ...series.map(s => s.completed)), [series]);

  const handleRangeChange = (val: '7d'|'14d'|'30d') => {
    setRange(val); setCustomStart(''); setCustomEnd('');
  };
  const applyCustomRange = () => { if (customStart && customEnd) loadDashboardData(); };

  return (
    <div className="space-y-8">
      <DashboardMetricsOverview onRefresh={onRefreshStats} />

      <DashboardSection title="" subtitle="" dense>
        <DataPanel>
          {/* Analytics Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border border-pink-500/30">
                <Calendar className="w-5 h-5 text-pink-400" />
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-6 bg-gradient-to-r from-black/40 via-gray-900/50 to-black/40 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-bold text-white">Time Range</h3>
              <div className="flex bg-black/60 backdrop-blur-sm rounded-xl border border-gray-600/50 overflow-hidden shadow-lg">
                {(['7d','14d','30d'] as const).map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleRangeChange(opt)} 
                    className={cn(
                      'px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                      range === opt 
                        ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/25' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {opt.replace('d', ' days')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-600/50">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e=>setCustomStart(e.target.value)} 
                  className="bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-400" 
                  placeholder="Start date"
                />
                <span className="text-gray-400 text-sm font-medium">to</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e=>setCustomEnd(e.target.value)} 
                  className="bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-400" 
                  placeholder="End date"
                />
              </div>
              <IOSButton 
                size="small" 
                onClick={applyCustomRange} 
                disabled={!customStart || !customEnd}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50"
              >
                Apply
              </IOSButton>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/20">
            <div className="p-8 pb-0">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-fuchsia-600/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                    <TrendingUp className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1">Orders Analytics</h4>
                    <p className="text-sm text-gray-400 font-medium">Track order creation and completion trends</p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-6 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-lg shadow-green-500/30"></div>
                    <span className="text-sm text-white font-semibold">Orders Created</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30"></div>
                    <span className="text-sm text-white font-semibold">Orders Completed</span>
                  </div>
                </div>
              </div>
            </div>
              
            {loading && series.length===0 ? (
              <div className="h-96 flex items-center justify-center px-8 pb-8">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-fuchsia-600 rounded-full animate-spin mx-auto"></div>
                  </div>
                  <p className="text-lg text-white font-semibold mb-2">Loading Analytics</p>
                  <p className="text-sm text-gray-400">Fetching your latest data...</p>
                </div>
              </div>
            ) : series.length===0 ? (
              <div className="h-96 flex items-center justify-center px-8 pb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-gray-600/30">
                    <BarChart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                  <p className="text-gray-400 max-w-md">No order data found for the selected time range. Try selecting a different period or check back later.</p>
                </div>
              </div>
            ) : (
              <div className="px-8 pb-8">
                <div className="h-96 relative bg-gradient-to-br from-gray-900/20 via-gray-800/10 to-transparent rounded-2xl border border-white/5 p-6">
                  <svg className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      {/* Enhanced gradients */}
                      <linearGradient id="createdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.1"/>
                      </linearGradient>
                      
                      <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#2563EB" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.1"/>
                      </linearGradient>

                      {/* Glow filters */}
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Orders created area chart */}
                    <path 
                      d={`M 0 100 ${series.map((d, i) => {
                        const x = (i / (series.length - 1)) * 100;
                        const y = 100 - (d.total / maxTotal) * 85;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 100 100 Z`}
                      fill="url(#createdGradient)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Orders completed area chart */}
                    <path 
                      d={`M 0 100 ${series.map((d, i) => {
                        const x = (i / (series.length - 1)) * 100;
                        const y = 100 - (d.completed / maxCompleted) * 75;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 100 100 Z`}
                      fill="url(#completedGradient)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Orders created line with glow */}
                    <path 
                      d={`M ${series.map((d, i) => {
                        const x = (i / (series.length - 1)) * 100;
                        const y = 100 - (d.total / maxTotal) * 85;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      filter="url(#glow)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Orders completed line with glow */}
                    <path 
                      d={`M ${series.map((d, i) => {
                        const x = (i / (series.length - 1)) * 100;
                        const y = 100 - (d.completed / maxCompleted) * 75;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}`}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      filter="url(#glow)"
                      className="drop-shadow-lg"
                    />
                    
                    {/* Enhanced data points for orders created */}
                    {series.map((d, i) => {
                      const x = (i / (series.length - 1)) * 100;
                      const y = 100 - (d.total / maxTotal) * 85;
                      return (
                        <g key={`created-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="0.5"
                            fill="#10B981"
                            stroke="#FFFFFF"
                            strokeWidth="0.50"
                            className="drop-shadow-lg"
                            filter="url(#glow)"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="0"
                            fill="#FFFFFF"
                            className="drop-shadow-md"
                          />
                        </g>
                      );
                    })}

                    {/* Enhanced data points for orders completed */}
                    {series.map((d, i) => {
                      const x = (i / (series.length - 1)) * 100;
                      const y = 100 - (d.completed / maxCompleted) * 75;
                      return (
                        <g key={`completed-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="0.5"
                            fill="#3B82F6"
                            stroke="#FFFFFF"
                            strokeWidth="0.5"
                            className="drop-shadow-lg"
                            filter="url(#glow)"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="0"
                            fill="#FFFFFF"
                            className="drop-shadow-md"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Mobile Legend */}
                  <div className="sm:hidden absolute top-6 left-6 right-6">
                    <div className="flex items-center justify-center gap-6 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400"></div>
                        <span className="text-xs text-white font-medium">Created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                        <span className="text-xs text-white font-medium">Completed</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Y-axis labels */}
                  <div className="absolute left-0 top-6 bottom-16 flex flex-col justify-between text-right pr-2">
                    <span className="text-xs text-gray-400 font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">{maxTotal}</span>
                    <span className="text-xs text-gray-500 font-medium">{Math.round(maxTotal * 0.8)}</span>
                    <span className="text-xs text-gray-500 font-medium">{Math.round(maxTotal * 0.6)}</span>
                    <span className="text-xs text-gray-500 font-medium">{Math.round(maxTotal * 0.4)}</span>
                    <span className="text-xs text-gray-500 font-medium">{Math.round(maxTotal * 0.2)}</span>
                    <span className="text-xs text-gray-400 font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">0</span>
                  </div>
                  
                  {/* Enhanced X-axis labels */}
                  <div className="absolute bottom-2 left-12 right-6 flex justify-between">
                    {series.map((d, i) => {
                      if (i % Math.max(1, Math.ceil(series.length / 6)) !== 0 && i !== series.length - 1) return null;
                      const date = new Date(d.date);
                      return (
                        <div key={d.date} className="text-center">
                          <span className="text-xs text-gray-400 font-semibold bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-6 pointer-events-none">
                    {[0.2, 0.4, 0.6, 0.8].map(percentage => (
                      <div
                        key={percentage}
                        className="absolute left-0 right-0 border-t border-white/5"
                        style={{ top: `${(1 - percentage) * 85}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DataPanel>
      </DashboardSection>

      {/* Performance Monitor */}
      {process.env.NODE_ENV === 'development' && (
        <AdminPerformanceMonitor />
      )}
    </div>
  );
};
