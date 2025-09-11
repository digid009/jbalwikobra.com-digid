import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { adminService, Order } from '../../../services/adminService';

export type AdminNotificationKind = 'new_order' | 'status_paid' | 'status_cancelled';

export interface AdminNotification {
  id: string; // internal notification id
  orderId: string;
  kind: AdminNotificationKind;
  amount: number;
  status: string;
  createdAt: string; // ISO
  read: boolean;
}

interface AdminNotificationsContextValue {
  notifications: AdminNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  markAllRead: () => void;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

// Poll interval ms
const POLL_INTERVAL = 20000; // 20s

export const AdminNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const lastSnapshotRef = useRef<Record<string, Order>>({});
  const pollingRef = useRef<number | null>(null);

  const snapshotOrders = (orders: Order[]) => {
    const map: Record<string, Order> = {};
    for (const o of orders) map[o.id] = o as Order;
    return map;
  };

  const generateNotifications = (orders: Order[]) => {
    const prev = lastSnapshotRef.current;
    const nextMap = snapshotOrders(orders);
    const newNotifs: AdminNotification[] = [];

    for (const o of orders) {
      const existed = prev[o.id];
      if (!existed) {
        newNotifs.push({
          id: `notif-${o.id}-new-${Date.now()}`,
            orderId: o.id,
          kind: 'new_order',
          amount: (o as any).amount || 0,
          status: (o as any).status || 'pending',
          createdAt: new Date().toISOString(),
          read: false
        });
      } else if (existed.status !== o.status) {
        if (o.status === 'paid') {
          newNotifs.push({
            id: `notif-${o.id}-paid-${Date.now()}`,
            orderId: o.id,
            kind: 'status_paid',
            amount: (o as any).amount || 0,
            status: o.status,
            createdAt: new Date().toISOString(),
            read: false
          });
        } else if (o.status === 'cancelled') {
          newNotifs.push({
            id: `notif-${o.id}-cancel-${Date.now()}`,
            orderId: o.id,
            kind: 'status_cancelled',
            amount: (o as any).amount || 0,
            status: o.status,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    lastSnapshotRef.current = nextMap;
    if (newNotifs.length) {
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
    }
  };

  const poll = async () => {
    try {
      // page 1, limit 15 to capture recent changes
      const { data } = await adminService.getOrders(1, 15, undefined as any);
      generateNotifications(data || []);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    poll(); // initial
    pollingRef.current = window.setInterval(poll, POLL_INTERVAL);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const value: AdminNotificationsContextValue = {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markRead,
    dismiss,
    markAllRead
  };

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
  return ctx;
};
