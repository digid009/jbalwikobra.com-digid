import React, { useState, useEffect } from 'react';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystem';
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
import { cn } from '../../../styles/standardClasses';
import { DashboardSection } from '../layout/DashboardPrimitives';

interface NotificationItem {
  id: string;
  type: 'order' | 'user' | 'product' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Mock data - replace with actual service calls
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'user',
    title: 'Bang! ada yang DAFTAR akun nih!',
    message: 'namanya Ahmad Rizky Pratama nomor wanya 6281234567890',
    timestamp: '2025-09-13T10:05:00Z',
    read: false,
    priority: 'medium'
  },
  {
    id: '2',
    type: 'order',
    title: 'Bang! ada yang ORDER nih!',
    message: 'namanya Siti Nurhaliza, produknya FREE FIRE A - VAULT 645 PRIME 4 SG harganya Rp2.800.000, belum di bayar sih, tapi moga aja di bayar amin.',
    timestamp: '2025-09-13T11:24:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Bang! ALHAMDULILLAH ada yang BAYAR nih!',
    message: 'Payment has been received for order',
    timestamp: '2025-09-13T10:24:00Z',
    read: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'user',
    title: 'Bang! ada yang DAFTAR akun nih!',
    message: 'namanya {nama user terdaftar} nomor wanya {nomor whatsapp}',
    timestamp: '2025-09-13T09:24:00Z',
    read: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'review',
    title: 'Bang! ada yang REVIEW produk nih!',
    message: 'namanya {nama customer} memberikan ulasan untuk produk {nama produk}',
    timestamp: '2025-09-13T08:24:00Z',
    read: false,
    priority: 'medium'
  }
];

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-5 h-5" />;
      case 'user': return <User className="w-5 h-5" />;
      case 'product': return <Package className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    const colors = {
      order: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      user: 'text-green-400 bg-green-500/20 border-green-500/30',
      product: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      payment: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      review: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      system: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
    };
    return colors[type as keyof typeof colors] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'read' && notif.read) ||
      (filter === 'unread' && !notif.read);
    
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    
    const matchesSearch = searchTerm === '' || 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
              onClick={() => setLoading(true)}
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
                  notification.read 
                    ? 'bg-gradient-to-r from-black/40 to-gray-900/40 border-gray-500/20'
                    : 'bg-gradient-to-r from-black/80 to-gray-900/80 border-pink-500/30 shadow-md shadow-pink-500/10'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border',
                      getNotificationColor(notification.type, notification.priority)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={cn(
                          'text-lg font-semibold',
                          notification.read ? 'text-gray-300' : 'text-white'
                        )}>
                          {notification.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(notification.timestamp)}
                        </div>
                      </div>
                      
                      <p className={cn(
                        'text-sm mb-4',
                        notification.read ? 'text-gray-500' : 'text-gray-300'
                      )}>
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {!notification.read && (
                          <IOSButton
                            variant="ghost"
                            size="small"
                            onClick={() => markAsRead(notification.id)}
                            className="border-green-500/30 hover:bg-green-500/20 text-green-400"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Mark Read
                          </IOSButton>
                        )}
                        
                        <IOSButton
                          variant="ghost"
                          size="small"
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
