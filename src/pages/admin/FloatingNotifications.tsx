import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ShoppingCart, CreditCard, XCircle, User, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import { adminNotificationService, AdminNotification } from '../../services/adminNotificationService';
import { IOSCard, IOSButton } from '../../components/ios/IOSDesignSystemV2';
import { supabase } from '../../services/supabase';

type NotificationItem = AdminNotification & { _ts: number };

const FloatingNotifications: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const lastSeenRef = useRef<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const canRealtime = useMemo(() => !!supabase, []);

  useEffect(() => {
    let channel: any = null;

    async function bootstrap() {
      try {
        const latest = await adminNotificationService.getAdminNotifications(5);
        if (latest?.length) {
          lastSeenRef.current = latest[0].created_at;
          setItems(latest.map(n => ({ ...n, _ts: Date.now() })));
        }
      } catch { /* ignore */ }

      if (canRealtime && supabase) {
        // Subscribe to new admin notification inserts
        channel = supabase
          .channel('public:admin_notifications:insert')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
            (payload: any) => {
              const n = payload?.new as AdminNotification;
              if (n) {
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
            if (latest?.[0] && latest[0].created_at !== lastSeenRef.current) {
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
    };
  }, [user?.id, canRealtime]);

  const push = (notif: AdminNotification) => {
    setItems(prev => [{ ...notif, _ts: Date.now() }, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistically remove from UI
      setItems(prev => prev.filter(n => n.id !== notificationId));
      
      // Make API call to mark as read
      await adminNotificationService.markAsRead(notificationId);
      console.log(`Successfully marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      
      // Re-fetch latest notifications if error occurs to restore state
      try {
        const latest = await adminNotificationService.getAdminNotifications(5);
        if (latest?.length) {
          setItems(latest.map(n => ({ ...n, _ts: Date.now() })));
        }
      } catch (refetchError) {
        console.error('Failed to refetch notifications:', refetchError);
      }
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
        
        return (
          <IOSCard 
            key={notification.id} 
            variant="elevated" 
            padding="md"
            className={`
              relative overflow-hidden transition-all duration-300 
              bg-gradient-to-br ${config.bgGradient} 
              backdrop-blur-xl border ${config.borderColor}
              hover:scale-[1.02] hover:shadow-2xl
              shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            `}
          >
            {/* Notification Content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`
                p-3 rounded-xl text-white shadow-lg shrink-0
                ${config.iconBg} 
                ring-1 ring-white/10
              `}>
                {config.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`font-bold text-lg leading-tight ${config.titleColor}`}>
                    {notification.title}
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
                  {notification.message}
                </p>
                
                <p className={`text-xs mt-3 font-medium ${config.timeColor}`}>
                  {new Date(notification.created_at).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-4">
              <IOSButton 
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => markAsRead(notification.id)}
                className="
                  bg-white/5 hover:bg-white/10 active:bg-white/15
                  border border-white/20 hover:border-white/30
                  text-white font-medium
                  transition-all duration-200
                "
              >
                Tandai Sudah Dibaca
              </IOSButton>
            </div>
          </IOSCard>
        );
      })}
    </div>
  );
};

export default FloatingNotifications;
