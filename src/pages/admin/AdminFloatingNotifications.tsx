import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ShoppingCart, CreditCard, XCircle, User, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import { adminNotificationService, AdminNotification } from '../../services/adminNotificationService';
import { supabase } from '../../services/supabase';

type NotificationItem = AdminNotification & { 
  _ts: number;
  _dismissedAt?: number;
  _reappearCount?: number;
};

const AdminFloatingNotifications: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Map<string, number>>(new Map());
  const lastSeenRef = useRef<string | null>(null);
  const pollingRef = useRef<number | null>(null);
  const reappearTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const canRealtime = useMemo(() => !!supabase, []);

  useEffect(() => {
    let channel: any = null;

    async function bootstrap() {
      try {
        // Only fetch unread notifications, excluding test notifications
        const latest = await adminNotificationService.getAdminNotifications(20);
        if (latest?.length) {
          // Filter out read notifications and test/debug notifications
          const unreadNonTest = latest.filter(n => 
            !n.is_read && 
            (!n.metadata?.test || n.metadata?.test !== true) &&
            (!n.metadata?.debug_mode || n.metadata?.debug_mode !== true) &&
            (!n.metadata?.auto_read || n.metadata?.auto_read !== true) &&
            !n.title.toLowerCase().includes('[debug]') &&
            !n.title.toLowerCase().includes('test') &&
            !n.message.toLowerCase().includes('[debug mode]')
          ).slice(0, 5);
          
          if (unreadNonTest.length > 0) {
            lastSeenRef.current = unreadNonTest[0].created_at;
            setItems(unreadNonTest.map(n => ({ ...n, _ts: Date.now() })));
          }
        }
      } catch { /* ignore */ }

      if (canRealtime && supabase) {
        channel = supabase
          .channel('public:admin_notifications:insert')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
            (payload: any) => {
              const n = payload?.new as AdminNotification;
              // Only show if it's not a test/debug notification and not already read
              if (n && 
                  !n.is_read && 
                  (!n.metadata?.test || n.metadata?.test !== true) &&
                  (!n.metadata?.debug_mode || n.metadata?.debug_mode !== true) &&
                  (!n.metadata?.auto_read || n.metadata?.auto_read !== true) &&
                  !n.title.toLowerCase().includes('[debug]') &&
                  !n.title.toLowerCase().includes('test') &&
                  !n.message.toLowerCase().includes('[debug mode]')) {
                push(n);
              }
            }
          )
          .subscribe();
      }

      // Fallback polling if realtime not available
      if (!canRealtime) {
        pollingRef.current = window.setInterval(async () => {
          try {
            const latest = await adminNotificationService.getAdminNotifications(1);
            if (latest?.[0] && 
                latest[0].created_at !== lastSeenRef.current &&
                !latest[0].is_read &&
                (!latest[0].metadata?.test || latest[0].metadata?.test !== true) &&
                (!latest[0].metadata?.debug_mode || latest[0].metadata?.debug_mode !== true) &&
                (!latest[0].metadata?.auto_read || latest[0].metadata?.auto_read !== true) &&
                !latest[0].title.toLowerCase().includes('[debug]') &&
                !latest[0].title.toLowerCase().includes('test') &&
                !latest[0].message.toLowerCase().includes('[debug mode]')) {
              lastSeenRef.current = latest[0].created_at;
              push(latest[0]);
            }
          } catch { /* ignore */ }
        }, 5000); // Poll every 5 seconds
      }
    }

    bootstrap();

    return () => {
      if (channel) channel.unsubscribe();
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      // Clear all reappear timers
      reappearTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      reappearTimersRef.current.clear();
    };
  }, [user?.id, canRealtime]);

  const push = (notif: AdminNotification) => {
    setItems(prev => [{ ...notif, _ts: Date.now() }, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    const existingTimer = reappearTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    setItems(prev => prev.filter(n => n.id !== id));
    
    const dismissalTime = Date.now();
    setDismissedNotifications(prev => new Map(prev.set(id, dismissalTime)));

    // Set timer to reappear in 30 seconds if not marked as read
    const reappearTimer = setTimeout(async () => {
      try {
        // Check if notification still exists and is unread
        const notifications = await adminNotificationService.getAdminNotifications(20);
        const notification = notifications.find(n => n.id === id);
        
        if (notification && !notification.is_read) {
          // Check if it's not a test/debug notification
          const isTestOrDebug = 
            (notification.metadata?.test === true) ||
            (notification.metadata?.debug_mode === true) ||
            (notification.metadata?.auto_read === true) ||
            notification.title.toLowerCase().includes('[debug]') ||
            notification.title.toLowerCase().includes('test') ||
            notification.message.toLowerCase().includes('[debug mode]');

          if (!isTestOrDebug) {
            // Reappear the notification
            const reappearCount = (notification as any)._reappearCount || 0;
            setItems(prev => {
              // Don't add if already exists
              if (prev.some(n => n.id === id)) return prev;
              
              const newNotif = { 
                ...notification, 
                _ts: Date.now(),
                _reappearCount: reappearCount + 1
              } as NotificationItem;
              return [newNotif, ...prev.slice(0, 4)];
            });
            
            // Remove from dismissed tracking
            setDismissedNotifications(prev => {
              const newMap = new Map(prev);
              newMap.delete(id);
              return newMap;
            });
          }
        }
      } catch (error) {
        console.error('Error checking notification for reappear:', error);
      }
      
      // Clean up timer reference
      reappearTimersRef.current.delete(id);
    }, 30000); // 30 seconds

    reappearTimersRef.current.set(id, reappearTimer);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log(`🔄 AdminFloatingNotifications: Marking notification ${notificationId} as read...`);
      
      // Clear any existing reappear timer
      const existingTimer = reappearTimersRef.current.get(notificationId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        reappearTimersRef.current.delete(notificationId);
      }

      // Remove from dismissed tracking
      setDismissedNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(notificationId);
        return newMap;
      });

      // Optimistically remove from UI
      setItems(prev => prev.filter(n => n.id !== notificationId));
      
      // Make API call to mark as read
      await adminNotificationService.markAsRead(notificationId);
      console.log(`✅ AdminFloatingNotifications: Successfully marked notification ${notificationId} as read - will not reappear`);
    } catch (error) {
      console.error('❌ AdminFloatingNotifications: Failed to mark notification as read:', error);
      
      // Re-fetch latest notifications if error occurs to restore state
      try {
        console.log('🔄 AdminFloatingNotifications: Attempting to restore state after error...');
        const latest = await adminNotificationService.getAdminNotifications(5);
        if (latest?.length) {
          const unreadFiltered = latest.filter(n => 
            !n.is_read && 
            (!n.metadata?.test || n.metadata?.test !== true) &&
            (!n.metadata?.debug_mode || n.metadata?.debug_mode !== true) &&
            (!n.metadata?.auto_read || n.metadata?.auto_read !== true) &&
            !n.title.toLowerCase().includes('[debug]') &&
            !n.title.toLowerCase().includes('test') &&
            !n.message.toLowerCase().includes('[debug mode]')
          );
          setItems(unreadFiltered.map(n => ({ ...n, _ts: Date.now() })));
          console.log('✅ AdminFloatingNotifications: State restored after error');
        }
      } catch (refetchError) {
        console.error('❌ AdminFloatingNotifications: Failed to refetch notifications:', refetchError);
      }
    }
  };

  const getNotificationTemplate = (notification: AdminNotification) => {
    // If already has Indonesian template, use it
    if (notification.title.toLowerCase().includes('bang!') || 
        notification.title.toLowerCase().includes('alhamdulillah')) {
      return {
        title: notification.title,
        message: notification.message
      };
    }

    // Convert English templates to Indonesian
    switch (notification.type) {
      case 'new_order':
        return {
          title: 'Bang! ada yang ORDER nih!',
          message: `namanya ${notification.customer_name || 'Customer'}, produknya ${notification.product_name || 'Product'} harganya Rp${notification.amount?.toLocaleString('id-ID') || '0'}, belum di bayar sih, tapi moga aja di bayar amin.`
        };
      case 'paid_order':
        return {
          title: 'Bang! ALHAMDULILLAH udah di bayar nih',
          message: `namanya ${notification.customer_name || 'Customer'}, produknya ${notification.product_name || 'Product'} harganya Rp${notification.amount?.toLocaleString('id-ID') || '0'}, udah di bayar Alhamdulillah.`
        };
      case 'new_user':
        return {
          title: 'Bang! ada yang DAFTAR akun nih!',
          message: `namanya ${notification.customer_name || 'User baru'} nomor wanya ${notification.metadata?.phone || 'tidak ada'}`
        };
      case 'order_cancelled':
        return {
          title: 'Bang! ada yang CANCEL order nih!',
          message: `namanya ${notification.customer_name || 'Customer'}, produktnya ${notification.product_name || 'Product'} di cancel nih.`
        };
      case 'new_review':
        return {
          title: 'Bang! ada yang REVIEW produk nih!',
          message: `namanya ${notification.customer_name || 'Customer'} memberikan ulasan untuk produk ${notification.product_name || 'Product'}`
        };
      default:
        return {
          title: notification.title,
          message: notification.message
        };
    }
  };

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'new_order':
        return {
          icon: <ShoppingCart className="h-5 w-5" />,
          bgGradient: 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/50',
          iconBg: 'bg-blue-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-blue-400'
        };
      case 'paid_order':
        return {
          icon: <CreditCard className="h-5 w-5" />,
          bgGradient: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/50',
          iconBg: 'bg-green-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-green-400'
        };
      case 'new_user':
        return {
          icon: <User className="h-5 w-5" />,
          bgGradient: 'from-pink-500/20 to-rose-500/20',
          borderColor: 'border-pink-500/50',
          iconBg: 'bg-pink-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-pink-400'
        };
      case 'order_cancelled':
        return {
          icon: <XCircle className="h-5 w-5" />,
          bgGradient: 'from-red-500/20 to-rose-500/20',
          borderColor: 'border-red-500/50',
          iconBg: 'bg-red-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-red-400'
        };
      case 'new_review':
        return {
          icon: <Star className="h-5 w-5" />,
          bgGradient: 'from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-500/50',
          iconBg: 'bg-yellow-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-yellow-400'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgGradient: 'from-zinc-500/20 to-gray-500/20',
          borderColor: 'border-zinc-500/50',
          iconBg: 'bg-zinc-500',
          titleColor: 'text-white',
          messageColor: 'text-zinc-300',
          timeColor: 'text-zinc-400'
        };
    }
  };

  if (!items.length) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-4 max-w-md w-full sm:max-w-sm">
      {items.slice(0, 5).map((notification) => {
        const config = getNotificationConfig(notification.type);
        const template = getNotificationTemplate(notification);
        const isReappeared = (notification._reappearCount || 0) > 0;
        
        return (
          <div
            key={`${notification.id}-${notification._ts}`}
            className={`
              dashboard-data-panel padded
              relative overflow-hidden transition-all duration-300 
              bg-gradient-to-br ${config.bgGradient} 
              backdrop-blur-xl border ${config.borderColor}
              hover:scale-[1.02] hover:shadow-2xl
              shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              ${isReappeared ? 'ring-2 ring-pink-400/50 shadow-pink-400/30' : ''}
            `}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-3 rounded-xl text-white shadow-lg shrink-0
                ${config.iconBg} 
                ring-1 ring-white/10
                ${isReappeared ? 'ring-pink-400/30' : ''}
              `}>
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`font-bold text-lg leading-tight ${config.titleColor}`}>
                    {template.title}
                  </h4>
                  <button 
                    onClick={() => dismissNotification(notification.id)} 
                    className="
                      h-8 w-8 shrink-0 rounded-lg 
                      hover:bg-white/10 active:bg-white/20
                      flex items-center justify-center 
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-white/20
                    "
                  >
                    <X className="h-4 w-4 text-white/80" />
                  </button>
                </div>
                
                <p className={`
                  text-sm leading-relaxed mt-2 line-clamp-3
                  ${config.messageColor}
                `}>
                  {template.message}
                </p>
                
                <p className={`text-xs mt-3 font-medium ${config.timeColor}`}>
                  {new Date(notification.created_at).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                  {isReappeared && (
                    <span className="ml-2 text-pink-400">
                      • Belum dibaca
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => markAsRead(notification.id)}
                className={`
                  btn btn-ghost btn-sm w-full transition-all duration-200
                  ${isReappeared 
                    ? 'bg-pink-400/10 hover:bg-pink-400/20 active:bg-pink-400/30 border border-pink-400/30 hover:border-pink-400/50 text-pink-300 font-bold animate-bounce shadow-lg shadow-pink-400/20'
                    : 'bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 hover:border-white/30 text-white font-medium'
                  }
                `}
              >
                {isReappeared ? '⚠️ Tandai Sudah Dibaca (Penting!)' : 'Tandai Sudah Dibaca'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminFloatingNotifications;
