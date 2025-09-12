import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ShoppingCart, CreditCard, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import { notificationService, AppNotification } from '../../services/notificationService';
import { supabase } from '../../services/supabase';

type NotificationItem = AppNotification & { _ts: number };

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
        const latest = await notificationService.getLatest(5, user?.id);
        if (latest?.length) {
          lastSeenRef.current = latest[0].created_at;
          setItems(latest.map(n => ({ ...n, _ts: Date.now() })));
        }
      } catch { /* ignore */ }

      if (canRealtime && supabase) {
        // Subscribe to new notification inserts
        channel = supabase
          .channel('public:notifications:insert')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload: any) => {
              const n = payload?.new as AppNotification;
              // Show if global or for current user
              const visible = !n.user_id || (user?.id && n.user_id === user.id);
              if (!visible) return;
              push(n);
            }
          )
          .subscribe();
      }

      // Fallback polling if realtime not available
      if (!canRealtime) {
        pollingRef.current = window.setInterval(async () => {
          try {
            const latest = await notificationService.getLatest(1, user?.id);
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

  const push = (notif: AppNotification) => {
    setItems(prev => [{ ...notif, _ts: Date.now() }, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Just remove from UI anyway
      dismissNotification(id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'new_order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'payment_received':
      case 'payment_confirmed':
        return <CreditCard className="h-4 w-4" />;
      case 'order_cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'new_order':
        return 'border-l-pink-500 bg-pink-50';
      case 'payment_received':
      case 'payment_confirmed':
        return 'border-l-green-500 bg-pink-50';
      case 'order_cancelled':
        return 'border-l-red-500 bg-pink-50';
      default:
        return 'border-l-pink-500 bg-pink-50';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'new_order':
        return 'bg-pink-500';
      case 'payment_received':
      case 'payment_confirmed':
        return 'bg-green-500';
      case 'order_cancelled':
        return 'bg-red-500';
      default:
        return 'bg-pink-500';
    }
  };

  if (!items.length) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-4 max-w-md">
      {items.slice(0, 5).map((n) => (
        <div key={n.id} className="bg-black rounded-2xl shadow-2xl border border-pink-100 transition-all duration-300 hover:shadow-3xl hover:scale-105">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl text-white shadow-lg ${getIconBgColor(n.type)}`}>
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg text-white">{n.title}</h4>
                  </div>
                  <p className="text-base text-gray-700 line-clamp-2 mt-2 leading-relaxed">{n.body || n.title}</p>
                  <p className="text-sm text-pink-600 mt-3 font-semibold">
                    {new Date(n.created_at).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => dismissNotification(n.id)} 
                className="h-8 w-8 shrink-0 rounded-xl hover:bg-pink-600/20 flex items-center justify-center transition-colors duration-200"
              >
                <X className="h-5 w-5 text-pink-500" />
              </button>
            </div>
            <button 
              onClick={() => markAsRead(n.id)} 
              className="w-full mt-4 py-3 text-base rounded-xl hover:bg-pink-600/20 text-pink-600 font-semibold border-2 border-pink-200 transition-all duration-200 hover:border-pink-300"
            >
              Mark as Read
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingNotifications;
