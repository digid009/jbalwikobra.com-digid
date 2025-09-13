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

  const markAsRead = async (id: string) => {
    try {
      await adminNotificationService.markAsRead(id);
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Just remove from UI anyway
      dismissNotification(id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'paid_order':
        return <CreditCard className="h-4 w-4" />;
      case 'new_user':
        return <User className="h-4 w-4" />;
      case 'order_cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'new_review':
        return <Star className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'border-l-gray-500 bg-gray-900/95 backdrop-blur-sm';
      case 'paid_order':
        return 'border-l-pink-500 bg-pink-950/95 backdrop-blur-sm';
      case 'new_user':
        return 'border-l-blue-500 bg-blue-950/95 backdrop-blur-sm';
      case 'order_cancelled':
        return 'border-l-red-500 bg-red-950/95 backdrop-blur-sm';
      case 'new_review':
        return 'border-l-yellow-500 bg-yellow-950/95 backdrop-blur-sm';
      default:
        return 'border-l-gray-500 bg-gray-900/95 backdrop-blur-sm';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'bg-gray-600';
      case 'paid_order':
        return 'bg-pink-500';
      case 'new_user':
        return 'bg-blue-500';
      case 'order_cancelled':
        return 'bg-red-500';
      case 'new_review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'text-gray-200';
      case 'paid_order':
        return 'text-pink-200';
      case 'new_user':
        return 'text-blue-200';
      case 'order_cancelled':
        return 'text-red-200';
      case 'new_review':
        return 'text-yellow-200';
      default:
        return 'text-gray-200';
    }
  };

  if (!items.length) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-4 max-w-md">
      {items.slice(0, 5).map((n) => (
        <div key={n.id} className={`rounded-2xl shadow-2xl border-l-4 transition-all duration-300 hover:shadow-3xl hover:scale-105 ${getNotificationColor(n.type)}`}>
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
                  <p className={`text-base line-clamp-2 mt-2 leading-relaxed ${getTextColor(n.type)}`}>
                    {n.message}
                  </p>
                  <p className="text-sm text-pink-400 mt-3 font-semibold">
                    {new Date(n.created_at).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => dismissNotification(n.id)} 
                className="h-8 w-8 shrink-0 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
              >
                <X className="h-5 w-5 text-white/80" />
              </button>
            </div>
            <button 
              onClick={() => markAsRead(n.id)} 
              className="w-full mt-4 py-3 text-base rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border-2 border-white/20 transition-all duration-200 hover:border-white/30"
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
