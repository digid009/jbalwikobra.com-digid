import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, AlertCircle, RotateCcw, Calendar } from 'lucide-react';
import { adminService, AdminNotification, OrderDayStat, TopProductStat } from '../../../services/adminService';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystem';
import { adminCache } from '../../../services/adminCache';

export const AdminDashboardContent: React.FC = () => {
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
        return 'bg-blue-50 border-blue-200';
      case 'paid_order':
        return 'bg-green-50 border-green-200';
      case 'cancelled_order':
        return 'bg-red-50 border-red-200';
      case 'new_user':
        return 'bg-purple-50 border-purple-200';
      case 'new_review':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
      {/* Recent Activity */}
      <IOSCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="flex items-center space-x-2">
              <IOSButton size="small" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="flex items-center">
                <RotateCcw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </IOSButton>
              <span className="text-sm text-gray-500 hidden sm:inline">Last 24 hours</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotifications.length > 0 ? (
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border ${getNotificationColor(notification.type)} shadow-sm hover:shadow transition`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl leading-none pt-0.5">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 text-gray-600 border border-gray-200 backdrop-blur">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-sm font-semibold text-green-600 mt-1">Rp {notification.amount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </IOSCard>

      {/* Analytics Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
              {(['7d','14d','30d'] as const).map(opt => (
                <button key={opt} onClick={() => handleRangeChange(opt)} className={`px-3 py-1.5 text-sm font-medium transition-colors ${range===opt ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" />
            <span className="text-gray-500 text-sm">to</span>
            <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" />
            <IOSButton size="small" onClick={applyCustomRange} disabled={!customStart || !customEnd}>Apply</IOSButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IOSCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Orders & Revenue</h3>
            {loading && series.length===0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>
            ) : series.length===0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>
            ) : (
              <div className="space-y-4">
                <div className="h-40 relative">
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    {series.map((d,i)=>{ const x=(i/(series.length-1))*100; const y=100-(d.count/maxCount)*100; return <circle key={d.date+'c'} cx={x+'%'} cy={y+'%'} r={3} fill="#2563eb" />; })}
                    {series.map((d,i)=>{ if(i===0) return null; const prev=series[i-1]; const x1=((i-1)/(series.length-1))*100; const x2=(i/(series.length-1))*100; const y1=100-(prev.count/maxCount)*100; const y2=100-(d.count/maxCount)*100; return <line key={d.date+'l'} x1={x1+'%'} y1={y1+'%'} x2={x2+'%'} y2={y2+'%'} stroke="#2563eb" strokeWidth={2} />; })}
                    {series.map((d,i)=>{ const x=(i/(series.length-1))*100; const h=(d.revenue/maxRevenue)*100; const y=100-h; return <rect key={d.date+'r'} x={`calc(${x}% - 2px)`} y={y+'%'} width={4} height={h+'%'} fill="#16a34a" opacity={0.4} />; })}
                  </svg>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> <span>Orders</span></div>
                  <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> <span>Revenue</span></div>
                </div>
              </div>
            )}
          </div>
        </IOSCard>

        <IOSCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            {loading && topProducts.length===0 ? (
              <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : topProducts.length===0 ? (
              <p className="text-sm text-gray-500">No product data</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map(p => (
                  <div key={p.product_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{p.product_name}</p>
                      <p className="text-xs text-gray-500">{p.count} orders</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Rp {p.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </IOSCard>
        </div>
      </div>
    </div>
  );
};
