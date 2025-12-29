import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, 
  X,
  Check,
  ShoppingBag,
  CreditCard,
  User,
  XCircle,
  Star,
  Package,
  Settings,
  Sparkles
} from 'lucide-react';
import { adminNotificationService, AdminNotification } from '../../services/adminNotificationService';
import { supabase } from '../../services/supabase';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface NotificationItem extends AdminNotification {
  dismissed?: boolean;
  reappearAt?: number;
}

const MAX_VISIBLE = 3; // Show max 3 floating notifications at once
const AUTO_DISMISS_TIME = 8000; // 8 seconds
const REAPPEAR_TIME = 30000; // 30 seconds

export const AdminFloatingNotificationsV2: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const lastSeenRef = useRef<string | null>(null);
  const dismissTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const reappearTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const loadLatestNotifications = useCallback(async () => {
    try {
      const data = await adminNotificationService.getAdminNotifications(20);
      if (data && data.length > 0) {
        const filtered = data.filter(n => 
          !n.type.includes('test') && 
          !n.type.includes('debug')
        );
        
        // Find new notifications
        const lastId = lastSeenRef.current;
        const newNotifs = lastId 
          ? filtered.filter(n => n.created_at > (filtered.find(x => x.id === lastId)?.created_at || ''))
          : filtered.slice(0, 5);

        if (newNotifs.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const toAdd = newNotifs
              .filter(n => !existingIds.has(n.id))
              .map(n => ({ ...n, dismissed: false }));
            
            return [...toAdd, ...prev].slice(0, 20);
          });
          
          // Update last seen
          lastSeenRef.current = filtered[0].id;
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Initial load and realtime subscription
  useEffect(() => {
    loadLatestNotifications();

    // Setup realtime subscription
    let channel: any = null;
    
    if (supabase) {
      channel = supabase
        .channel('admin-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'admin_notifications'
          },
          (payload) => {
            const newNotif = payload.new as AdminNotification;
            if (!newNotif.type.includes('test') && !newNotif.type.includes('debug')) {
              setNotifications(prev => [{ ...newNotif, dismissed: false }, ...prev].slice(0, 20));
              lastSeenRef.current = newNotif.id;
            }
          }
        )
        .subscribe();
    }

    // Fallback polling
    const pollInterval = setInterval(() => {
      loadLatestNotifications();
    }, 5000);

    return () => {
      if (channel) channel.unsubscribe();
      clearInterval(pollInterval);
      Object.values(dismissTimersRef.current).forEach(clearTimeout);
      Object.values(reappearTimersRef.current).forEach(clearTimeout);
    };
  }, [loadLatestNotifications]);

  // Auto-dismiss unread notifications
  useEffect(() => {
    notifications.forEach(notif => {
      if (!notif.is_read && !notif.dismissed && !dismissTimersRef.current[notif.id]) {
        dismissTimersRef.current[notif.id] = setTimeout(() => {
          handleDismiss(notif.id, true); // Auto-dismiss with reappear
        }, AUTO_DISMISS_TIME);
      }
    });
  }, [notifications]);

  const handleDismiss = (id: string, withReappear: boolean = false) => {
    // Clear existing timers
    if (dismissTimersRef.current[id]) {
      clearTimeout(dismissTimersRef.current[id]);
      delete dismissTimersRef.current[id];
    }

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );

    // Set reappear timer for unread notifications
    if (withReappear) {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.is_read) {
        reappearTimersRef.current[id] = setTimeout(() => {
          setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, dismissed: false, reappearAt: Date.now() } : n)
          );
          delete reappearTimersRef.current[id];
        }, REAPPEAR_TIME);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    handleDismiss(id, false);

    // Clear reappear timer
    if (reappearTimersRef.current[id]) {
      clearTimeout(reappearTimersRef.current[id]);
      delete reappearTimersRef.current[id];
    }

    try {
      await adminNotificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      new_order: ShoppingBag,
      paid_order: CreditCard,
      new_user: User,
      order_cancelled: XCircle,
      new_review: Star,
      new_rent: Package,
      paid_rent: CreditCard,
      system: Settings,
    };
    const Icon = icons[type as keyof typeof icons] || Bell;
    return Icon;
  };

  const getNotificationStyle = (type: string) => {
    const styles = {
      new_order: {
        gradient: 'from-blue-500 to-cyan-600',
        glow: 'shadow-blue-500/50',
        border: 'border-blue-500/50',
        bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        pulse: 'bg-blue-500',
      },
      paid_order: {
        gradient: 'from-emerald-500 to-green-600',
        glow: 'shadow-emerald-500/50',
        border: 'border-emerald-500/50',
        bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
        pulse: 'bg-emerald-500',
      },
      new_user: {
        gradient: 'from-purple-500 to-violet-600',
        glow: 'shadow-purple-500/50',
        border: 'border-purple-500/50',
        bg: 'bg-gradient-to-br from-purple-500/20 to-violet-500/20',
        pulse: 'bg-purple-500',
      },
      order_cancelled: {
        gradient: 'from-red-500 to-rose-600',
        glow: 'shadow-red-500/50',
        border: 'border-red-500/50',
        bg: 'bg-gradient-to-br from-red-500/20 to-rose-500/20',
        pulse: 'bg-red-500',
      },
      new_review: {
        gradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/50',
        border: 'border-amber-500/50',
        bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
        pulse: 'bg-amber-500',
      },
      system: {
        gradient: 'from-pink-500 to-fuchsia-600',
        glow: 'shadow-pink-500/50',
        border: 'border-pink-500/50',
        bg: 'bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20',
        pulse: 'bg-pink-500',
      },
    };
    return styles[type as keyof typeof styles] || styles.system;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}j`;
    
    return `${Math.floor(diffHours / 24)}h`;
  };

  // Get visible notifications (not dismissed, limit to MAX_VISIBLE)
  const visibleNotifications = notifications
    .filter(n => !n.dismissed && !n.is_read)
    .slice(0, MAX_VISIBLE);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3 max-w-md w-full pointer-events-none">
      {visibleNotifications.map((notification, index) => {
        const style = getNotificationStyle(notification.type);
        const Icon = getNotificationIcon(notification.type);
        const isReappearing = notification.reappearAt && Date.now() - notification.reappearAt < 3000;

        return (
          <div
            key={notification.id}
            className={cn(
              'pointer-events-auto relative overflow-hidden rounded-2xl backdrop-blur-xl',
              'transform transition-all duration-500 ease-out',
              'animate-in slide-in-from-right-full',
              `animation-delay-${index * 100}`,
              style.bg,
              'border-2',
              style.border,
              'shadow-2xl',
              style.glow,
              isReappearing && 'ring-4 ring-pink-500/50 animate-pulse'
            )}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Glow effect */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-r opacity-30 blur-xl',
              style.gradient
            )} />

            {/* Content */}
            <div className="relative p-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  style.gradient,
                  'relative'
                )}>
                  <Icon className="w-6 h-6 text-white" />
                  
                  {/* Pulse indicator */}
                  <div className={cn(
                    'absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse',
                    style.pulse,
                    'shadow-lg'
                  )}>
                    <div className={cn(
                      'absolute inset-0 rounded-full animate-ping',
                      style.pulse,
                      'opacity-75'
                    )} />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {notification.title}
                    </h4>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Meta info */}
                  {(notification.customer_name || notification.amount) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {notification.customer_name && (
                        <div className="px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
                          <span className="text-xs text-white font-medium">
                            {notification.customer_name}
                          </span>
                        </div>
                      )}
                      {notification.amount && (
                        <div className="px-2 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-sm">
                          <span className="text-xs text-emerald-300 font-bold">
                            Rp {notification.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3 h-3" />
                      Tandai Dibaca
                    </button>
                    
                    <button
                      onClick={() => handleDismiss(notification.id, true)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reappearing indicator */}
                  {isReappearing && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-pink-300 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-medium">Belum dibaca - muncul kembali</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom progress bar for auto-dismiss */}
            {!notification.is_read && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                <div 
                  className={cn('h-full bg-gradient-to-r', style.gradient)}
                  style={{
                    animation: `progress ${AUTO_DISMISS_TIME}ms linear`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-in {
          animation: slide-in-from-right 0.5s ease-out;
        }
        
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminFloatingNotificationsV2;
