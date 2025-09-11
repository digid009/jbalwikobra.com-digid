import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, CreditCard, XCircle } from 'lucide-react';

type NotificationType = 'new_order' | 'payment_received' | 'order_cancelled';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: Date;
};

const FloatingNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) addRandomNotification();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addRandomNotification = () => {
    const types: NotificationType[] = ['new_order', 'payment_received', 'order_cancelled'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const orderId = `ORDER_${Date.now()}`;
    const titles: Record<NotificationType, string> = {
      new_order: 'Pesanan Baru',
      payment_received: 'Pembayaran Diterima',
      order_cancelled: 'Pesanan Dibatalkan'
    };
    const messages: Record<NotificationType, string> = {
      new_order: `Pesanan baru #${orderId} untuk Mobile Legends account`,
      payment_received: `Pembayaran diterima untuk pesanan #${orderId}`,
      order_cancelled: `Pesanan #${orderId} dibatalkan oleh customer`
    };
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type: randomType,
      title: titles[randomType],
      message: messages[randomType],
      orderId,
      isRead: false,
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const Icon = ({ type }: { type: NotificationType }) => {
    switch (type) {
      case 'new_order': return <ShoppingCart className="h-4 w-4" />;
      case 'payment_received': return <CreditCard className="h-4 w-4" />;
      case 'order_cancelled': return <XCircle className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className={`bg-white text-gray-900 rounded-lg shadow-lg border-l-4 ${n.isRead ? 'opacity-75' : ''}`}>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className={`p-1 rounded-full text-white ${n.type === 'new_order' ? 'bg-blue-500' : n.type === 'payment_received' ? 'bg-green-500' : 'bg-red-500'}`}>
                  <Icon type={n.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{n.title}</h4>
                    {!n.isRead && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200">Baru</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <button onClick={() => dismissNotification(n.id)} className="h-6 w-6 shrink-0 rounded hover:bg-gray-100 flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
            {!n.isRead && (
              <button onClick={() => markAsRead(n.id)} className="w-full mt-2 h-6 text-xs rounded hover:bg-gray-100">Tandai Sudah Dibaca</button>
            )}
          </div>
        </div>
      ))}
      {notifications.length > 5 && (
        <div className="bg-white text-gray-900 rounded-lg shadow-lg">
          <div className="p-2 text-center">
            <p className="text-xs text-gray-600">+{notifications.length - 5} notifikasi lainnya</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingNotifications;
