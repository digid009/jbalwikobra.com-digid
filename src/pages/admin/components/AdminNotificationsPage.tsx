import React, { useState, useEffect } from 'react';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystemV2';
import { 
  Bell, 
  Settings, 
  RefreshCw, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Search,
  Clock,
  Star,
  Package,
  User,
  CreditCard,
  MessageSquare,
  ShoppingBag
} from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import { DashboardSection } from '../layout/DashboardPrimitives';
import { adminNotificationService, AdminNotification } from '../../../services/adminNotificationService';

interface NotificationItem {
  id: string;
  type: 'new_order' | 'paid_order' | 'new_user' | 'order_cancelled' | 'new_review' | 'system';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  customer_name?: string;
  product_name?: string;
  amount?: number;
  metadata?: any;
}

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminNotificationService.getAdminNotifications(50);
      if (data) {
        // Convert AdminNotification to NotificationItem format
        const formattedNotifications: NotificationItem[] = data.map(notif => ({
          id: notif.id,
          type: notif.type as any,
          title: notif.title,
          message: notif.message,
          created_at: notif.created_at,
          is_read: notif.is_read,
          customer_name: notif.customer_name,
          product_name: notif.product_name,
          amount: notif.amount,
          metadata: notif.metadata
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order': return <ShoppingBag className="w-5 h-5" />;
      case 'paid_order': return <CreditCard className="w-5 h-5" />;
      case 'new_user': return <User className="w-5 h-5" />;
      case 'order_cancelled': return <Package className="w-5 h-5" />;
      case 'new_review': return <Star className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      new_order: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      paid_order: 'text-green-400 bg-green-500/20 border-green-500/30',
      new_user: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      order_cancelled: 'text-red-400 bg-red-500/20 border-red-500/30',
      new_review: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      system: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
    };
    return colors[type as keyof typeof colors] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  };

  const markAsRead = async (id: string) => {
    try {
      console.log(`🔄 AdminNotificationsPage: Marking notification ${id} as read...`);
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      
      // Make API call
      await adminNotificationService.markAsRead(id);
      console.log(`✅ AdminNotificationsPage: Successfully marked notification ${id} as read`);
    } catch (error) {
      console.error('❌ AdminNotificationsPage: Failed to mark notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: false } : notif
        )
      );
      // Show user that the operation failed
      alert('Gagal menandai notifikasi sebagai sudah dibaca. Silakan coba lagi.');
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('🔄 AdminNotificationsPage: Marking all notifications as read...');
      
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      console.log(`📊 Found ${unreadIds.length} unread notifications to mark as read`);
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Make API calls for all unread notifications
      await Promise.all(unreadIds.map(id => adminNotificationService.markAsRead(id)));
      console.log(`✅ AdminNotificationsPage: Successfully marked ${unreadIds.length} notifications as read`);
    } catch (error) {
      console.error('❌ AdminNotificationsPage: Failed to mark all notifications as read:', error);
      // Reload notifications on error
      loadNotifications();
      alert('Gagal menandai semua notifikasi sebagai sudah dibaca. Silakan coba lagi.');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const originalNotifications = [...notifications];
      // Optimistically remove from UI
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Note: We'd need a delete endpoint in adminNotificationService for this to work
      // For now, just keep the optimistic update
      console.log(`Notification ${id} removed from UI (delete endpoint not implemented)`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Restore notifications on error
      loadNotifications();
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'read' && notif.is_read) ||
      (filter === 'unread' && !notif.is_read);
    
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    
    const matchesSearch = searchTerm === '' || 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardSection>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-300">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <IOSButton
              variant="ghost"
              onClick={() => loadNotifications()}
              className="border-pink-500/30 hover:bg-pink-500/20"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </IOSButton>
            
            {unreadCount > 0 && (
              <IOSButton
                variant="primary"
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-pink-500 to-fuchsia-600"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </IOSButton>
            )}
          </div>
        </div>

        {/* Filters */}
        <IOSCard className="bg-gradient-to-r from-black/80 via-gray-950/80 to-black/80 backdrop-blur-sm border border-pink-500/20">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-black/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500/50"
              >
                <option value="all">All Types</option>
                <option value="order">Orders</option>
                <option value="user">Users</option>
                <option value="product">Products</option>
                <option value="payment">Payments</option>
                <option value="review">Reviews</option>
                <option value="system">System</option>
              </select>

              {/* Clear */}
              <IOSButton
                variant="ghost"
                onClick={() => {
                  setFilter('all');
                  setTypeFilter('all');
                  setSearchTerm('');
                }}
                className="border-gray-500/30 hover:bg-gray-700/50"
              >
                Clear Filters
              </IOSButton>
            </div>
          </div>
        </IOSCard>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <IOSCard className="bg-gradient-to-r from-black/50 to-gray-900/50 border-gray-500/20">
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
                <p className="text-gray-400">
                  {searchTerm || filter !== 'all' || typeFilter !== 'all'
                    ? 'No notifications match your current filters.'
                    : 'You\'re all caught up! No new notifications.'}
                </p>
              </div>
            </IOSCard>
          ) : (
            filteredNotifications.map((notification) => (
              <IOSCard 
                key={notification.id}
                className={cn(
                  'transition-all duration-200 hover:shadow-lg',
                  notification.is_read 
                    ? 'bg-gradient-to-r from-black/40 to-gray-900/40 border-gray-500/20'
                    : 'bg-gradient-to-r from-black/80 to-gray-900/80 border-pink-500/30 shadow-md shadow-pink-500/10'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border',
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={cn(
                          'text-lg font-semibold',
                          notification.is_read ? 'text-gray-300' : 'text-white'
                        )}>
                          {notification.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(notification.created_at)}
                        </div>
                      </div>
                      
                      <p className={cn(
                        'text-sm mb-4',
                        notification.is_read ? 'text-gray-500' : 'text-gray-300'
                      )}>
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {!notification.is_read && (
                          <IOSButton
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="border-green-500/30 hover:bg-green-500/20 text-green-400"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Tandai Sudah Dibaca
                          </IOSButton>
                        )}
                        
                        <IOSButton
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="border-red-500/30 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </IOSButton>
                      </div>
                    </div>
                  </div>
                </div>
              </IOSCard>
            ))
          )}
        </div>
      </div>
    </DashboardSection>
  );
};

export default AdminNotificationsPage;
