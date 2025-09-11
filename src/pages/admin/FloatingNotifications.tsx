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
        return 'border-l-blue-500 bg-blue-50';
      case 'payment_received':
      case 'payment_confirmed':
        return 'border-l-green-500 bg-green-50';
      case 'order_cancelled':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'new_order':
        return 'bg-blue-500';
      case 'payment_received':
      case 'payment_confirmed':
        return 'bg-green-500';
      case 'order_cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!items.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {items.slice(0, 5).map((n) => (
        <div key={n.id} className={`${getNotificationColor(n.type)} text-gray-900 rounded-lg shadow-lg border-l-4 transition-all duration-300`}>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className={`p-1 rounded-full text-white ${getIconBgColor(n.type)}`}>
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-900">{n.title}</h4>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2 mt-1">{n.body || n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => dismissNotification(n.id)} 
                className="h-6 w-6 shrink-0 rounded hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => markAsRead(n.id)} 
              className="w-full mt-2 h-6 text-xs rounded hover:bg-gray-200/50 text-gray-600"
            >
              Tandai Sudah Dibaca
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingNotifications;
