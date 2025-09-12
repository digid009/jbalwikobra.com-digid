import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, AlertCircle, RotateCcw, Calendar, Activity, Bell, BarChart, Package, TrendingDown } from 'lucide-react';
import { adminService, AdminNotification, OrderDayStat, TopProductStat } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
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
  const [topProducts, setTopProducts] = useState<TopProductStat[]>([]);
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
      const tp = await adminService.getTopProducts(customStart && customEnd ? { startDate: customStart, endDate: customEnd } : {});
      setTopProducts(tp);
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
        return 'bg-ios-surface/50 border-ios-primary/20';
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
      {/* Enhanced Recent Activity Section */}
      <IOSCard variant="elevated" className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ios-primary/10 to-ios-primary/5 rounded-2xl flex items-center justify-center border border-ios-primary/10">
                <Bell className="w-5 h-5 text-ios-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ios-text">Recent Activity</h3>
                <p className="text-sm text-ios-text font-medium">Latest updates from your store</p>
              </div>
            </div>
            <IOSButton 
              size="small" 
              variant="ghost" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center space-x-2 hover:bg-ios-background/50 rounded-xl"
            >
              <RotateCcw className={cn('w-4 h-4', refreshing && 'animate-spin')} /> 
              <span className="hidden sm:inline">Refresh</span>
            </IOSButton>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 rounded-2xl bg-ios-background/30">
                  <div className="w-12 h-12 bg-ios-background/50 rounded-2xl"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-ios-background/50 rounded-full w-3/4"></div>
                    <div className="h-3 bg-ios-background/50 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotifications.length > 0 ? (
            <div className="space-y-3">
              {recentNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'notification-card p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
                    getNotificationColor(notification.type),
                    'bg-gradient-to-r from-transparent to-white/5 gradient-overlay'
                  )}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-lg border border-white/30 shadow-lg shadow-black/50">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-ios-text truncate pr-2">{notification.title}</h4>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/90 text-ios-text border border-white/40 backdrop-blur-sm whitespace-nowrap shadow-lg shadow-black/50">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-ios-text leading-relaxed font-medium">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-ios-success/10 border border-ios-success/20 text-xs font-bold text-ios-success">
                            Rp {notification.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-ios-background/30 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-200 font-medium">No recent activity</p>
              <p className="text-gray-200/60 text-sm mt-1">New updates will appear here</p>
            </div>
          )}
        </div>
      </IOSCard>

      {/* Enhanced Analytics Section */}
      <IOSCard variant="elevated" className="overflow-hidden">
        <div className="p-6">
          {/* Analytics Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ios-accent/10 to-ios-accent/5 rounded-2xl flex items-center justify-center border border-ios-accent/10">
                <Calendar className="w-5 h-5 text-ios-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ios-text">Analytics Dashboard</h3>
                <p className="text-sm text-ios-text font-medium">Track your store performance</p>
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 bg-gradient-to-r from-ios-background/50 to-white/20 rounded-2xl border border-ios-background/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex bg-black/70 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden shadow-lg shadow-black/50">
                {(['7d','14d','30d'] as const).map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => handleRangeChange(opt)} 
                    className={cn(
                      'px-4 py-2 text-sm font-semibold transition-all duration-200',
                      range === opt 
                        ? 'bg-ios-primary text-white shadow-lg' 
                        : 'text-gray-200 hover:bg-black/50 hover:text-ios-text'
                    )}
                  >
                    {opt.replace('d', ' days')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e=>setCustomStart(e.target.value)} 
                  className="bg-transparent text-sm text-ios-text focus:outline-none" 
                />
                <span className="text-gray-200 text-sm">to</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e=>setCustomEnd(e.target.value)} 
                  className="bg-transparent text-sm text-ios-text focus:outline-none" 
                />
              </div>
              <IOSButton size="small" onClick={applyCustomRange} disabled={!customStart || !customEnd}>
                Apply
              </IOSButton>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders & Revenue Chart */}
            <div className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-ios-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-ios-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-ios-text">Orders & Revenue</h4>
                  <p className="text-xs text-ios-text font-medium">Daily performance metrics</p>
                </div>
              </div>
              
              {loading && series.length===0 ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-ios-primary/20 border-t-ios-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-ios-text font-medium">Loading analytics...</p>
                  </div>
                </div>
              ) : series.length===0 ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-ios-background/30 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                      <BarChart className="w-6 h-6 text-gray-200" />
                    </div>
                    <p className="text-sm text-ios-text font-medium">No data available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-48 relative bg-gradient-to-t from-ios-background/10 to-transparent rounded-xl">
                    <svg className="absolute inset-0 w-full h-full overflow-visible p-2" preserveAspectRatio="none">
                      {/* Revenue bars */}
                      {series.map((d,i)=>{ 
                        const x=(i/(series.length-1))*100; 
                        const h=(d.revenue/maxRevenue)*100; 
                        const y=100-h; 
                        return (
                          <rect 
                            key={d.date+'r'} 
                            x={`calc(${x}% - 3px)`} 
                            y={y+'%'} 
                            width={6} 
                            height={h+'%'} 
                            fill="url(#revenueGradient)" 
                            className="drop-shadow-lg shadow-black/50"
                          />
                        );
                      })}
                      {/* Order line */}
                      {series.map((d,i)=>{ 
                        if(i===0) return null; 
                        const prev=series[i-1]; 
                        const x1=((i-1)/(series.length-1))*100; 
                        const x2=(i/(series.length-1))*100; 
                        const y1=100-(prev.count/maxCount)*100; 
                        const y2=100-(d.count/maxCount)*100; 
                        return (
                          <line 
                            key={d.date+'l'} 
                            x1={x1+'%'} 
                            y1={y1+'%'} 
                            x2={x2+'%'} 
                            y2={y2+'%'} 
                            stroke="#007AFF" 
                            strokeWidth={3}
                            className="drop-shadow-lg shadow-black/50"
                          />
                        );
                      })}
                      {/* Order points */}
                      {series.map((d,i)=>{ 
                        const x=(i/(series.length-1))*100; 
                        const y=100-(d.count/maxCount)*100; 
                        return (
                          <circle 
                            key={d.date+'c'} 
                            cx={x+'%'} 
                            cy={y+'%'} 
                            r={4} 
                            fill="#007AFF" 
                            className="drop-shadow-lg shadow-black/50"
                          />
                        );
                      })}
                      <defs>
                        <linearGradient id="revenueGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#34C759" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#34C759" stopOpacity="0.3"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-ios-primary rounded-full shadow-lg shadow-black/50"></div>
                      <span className="text-sm font-medium text-ios-text">Orders</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-3 bg-gradient-to-t from-ios-success to-ios-success/50 rounded-sm shadow-lg shadow-black/50"></div>
                      <span className="text-sm font-medium text-ios-text">Revenue</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-ios-success/10 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-ios-success" />
                </div>
                <div>
                  <h4 className="font-bold text-ios-text">Top Products</h4>
                  <p className="text-xs text-ios-text font-medium">Best performing items</p>
                </div>
              </div>
              
              {loading && topProducts.length===0 ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_,i)=>(
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-ios-background/30 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-ios-background/30 rounded w-24"></div>
                          <div className="h-2 bg-ios-background/30 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-ios-background/30 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length===0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-ios-background/30 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-sm text-gray-200">No product data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((p, index) => (
                    <div key={p.product_id} className="group" 
                         style={{ 
                           animationDelay: `${index * 150}ms`,
                           animation: 'slideInLeft 0.6s ease-out forwards'
                         }}>
                      <div className="product-card flex items-center justify-between p-3 rounded-xl hover:bg-black/30 transition-all duration-200 gradient-overlay">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-ios-primary/10 to-ios-primary/5 rounded-xl flex items-center justify-center border border-ios-primary/10 text-sm font-bold text-ios-primary">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-ios-text group-hover:text-ios-primary transition-colors">
                              {p.product_name}
                            </p>
                            <p className="text-xs text-ios-text font-medium">
                              {p.count} orders sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-ios-success">
                            Rp {p.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </IOSCard>
    </div>
  );
};
