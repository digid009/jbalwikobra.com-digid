import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';
import { adminService, AdminNotification } from '../../../services/adminService';
import { IOSCard } from '../../../components/ios/IOSDesignSystem';
import { adminCache } from '../../../services/adminCache';

export const AdminDashboardContent: React.FC = () => {
  const [recentNotifications, setRecentNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RotateCcw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <span className="text-sm text-gray-500">Last 24 hours</span>
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
                  className={`p-4 rounded-lg border-2 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Rp {notification.amount.toLocaleString()}
                        </p>
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IOSCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Order Trends
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today's Orders</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Yesterday</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Week</span>
                <span className="font-medium">54</span>
              </div>
            </div>
          </div>
        </IOSCard>

        <IOSCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Products
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">FREE FIRE B1</p>
                  <p className="text-sm text-gray-600">Game Top-up</p>
                </div>
                <span className="text-sm font-medium">45 sales</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">MOBILE LEGENDS</p>
                  <p className="text-sm text-gray-600">Game Top-up</p>
                </div>
                <span className="text-sm font-medium">38 sales</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">PUBG Mobile</p>
                  <p className="text-sm text-gray-600">Game Top-up</p>
                </div>
                <span className="text-sm font-medium">29 sales</span>
              </div>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
};
