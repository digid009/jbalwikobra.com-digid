import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../../../services/adminService';

export interface AdminNotification {
  id: string;
  orderId: string;
  type: 'new_order' | 'status_change' | 'payment_received';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface AdminNotificationsContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextType | undefined>(undefined);

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationsContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
  }
  return context;
};

interface AdminNotificationsProviderProps {
  children: ReactNode;
}

export const AdminNotificationsProvider: React.FC<AdminNotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [processedOrders, setProcessedOrders] = useState<Set<string>>(new Set());

  // Create notifications from order changes
  const processOrderUpdates = (orders: Order[]) => {
    const newNotifs: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>[] = [];

    orders.forEach(order => {
      const orderKey = `${order.id}-${order.status}`;
      
      if (!processedOrders.has(orderKey)) {
        // New order notification
        if (!processedOrders.has(order.id)) {
          newNotifs.push({
            orderId: order.id,
            type: 'new_order',
            title: 'New Order Received',
            message: `Order from ${order.customer_name} for ${formatCurrency(order.amount)}`
          });
        }

        // Status change notifications
        if (order.status === 'completed') {
          newNotifs.push({
            orderId: order.id,
            type: 'payment_received',
            title: 'Order Completed',
            message: `Order from ${order.customer_name} for ${formatCurrency(order.amount)} has been completed`
          });
        } else if (order.status === 'cancelled') {
          newNotifs.push({
            orderId: order.id,
            type: 'status_change',
            title: 'Order Cancelled',
            message: `Order from ${order.customer_name} has been cancelled`
          });
        } else if (order.status === 'processing') {
          newNotifs.push({
            orderId: order.id,
            type: 'status_change',
            title: 'Order Processing',
            message: `Order from ${order.customer_name} is now being processed`
          });
        }

        setProcessedOrders(prev => new Set(prev).add(orderKey));
      }
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [
        ...newNotifs.map(notif => ({
          ...notif,
          id: `${notif.orderId}-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: false
        })),
        ...prev
      ]);
    }
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

  const addNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      {
        ...notification,
        id: `${notification.orderId}-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false
      },
      ...prev
    ]);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminNotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
};
