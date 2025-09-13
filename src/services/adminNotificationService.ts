import { supabase } from './supabase';
import { globalCache } from './globalCacheManager';

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'paid_order' | 'new_user' | 'order_cancelled' | 'new_review' | 'system';
  title: string;
  message: string;
  order_id?: string;
  user_id?: string;
  product_name?: string;
  amount?: number;
  customer_name?: string;
  created_at: string;
  is_read: boolean;
  metadata?: Record<string, any>;
}

class AdminNotificationService {
  private cacheTag = 'admin_notifications';

  // Get recent admin notifications
  async getAdminNotifications(limit = 10): Promise<AdminNotification[]> {
    const key = `${this.cacheTag}:recent:${limit}`;
    return globalCache.getOrSet(key, async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AdminNotification[];
    }, { ttl: 30_000, tags: [this.cacheTag] });
  }

  // Create new order notification
  async createOrderNotification(
    orderId: string, 
    customerName: string, 
    productName: string, 
    amount: number,
    type: 'new_order' | 'paid_order' | 'order_cancelled' = 'new_order',
    customerPhone?: string
  ): Promise<void> {
    try {
      const titles = {
        new_order: 'Bang! ada yang ORDER nih!',
        paid_order: 'Bang! Alhamdulillah udah di bayar nih',
        order_cancelled: 'Order Cancelled'
      };

      const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      };

      const messages = {
        new_order: `namanya ${customerName}, produknya ${productName} harganya ${formatAmount(amount)}, belum di bayar sih, tapi moga aja di bayar amin.`,
        paid_order: `ORDERAN produk ${productName}, harganya ${formatAmount(amount)} sama si ${customerName}`,
        order_cancelled: `Order dari ${customerName} telah dibatalkan`
      };

      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          type,
          title: titles[type],
          message: messages[type],
          order_id: orderId,
          customer_name: customerName,
          product_name: productName,
          amount,
          is_read: false,
          metadata: {
            priority: type === 'paid_order' ? 'high' : 'normal',
            category: 'order'
          }
        });

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to create order notification:', error);
    }
  }

  // Create new user signup notification
  async createUserSignupNotification(
    userId: string,
    userName: string,
    userPhone: string,
    email?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'new_user',
          title: 'Bang! ada yang DAFTAR akun nih!',
          message: `namanya ${userName} nomor wanya ${userPhone}`,
          user_id: userId,
          customer_name: userName,
          is_read: false,
          metadata: {
            email,
            phone: userPhone,
            priority: 'normal',
            category: 'user'
          }
        });

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to create user signup notification:', error);
    }
  }

  // Create review notification
  async createReviewNotification(
    productName: string,
    customerName: string,
    rating: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'new_review',
          title: 'New Product Review',
          message: `${customerName} left a ${rating}-star review for ${productName}`,
          product_name: productName,
          customer_name: customerName,
          is_read: false,
          metadata: {
            rating,
            priority: 'low',
            category: 'review'
          }
        });

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to create review notification:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('is_read', false);

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const key = `${this.cacheTag}:unread_count`;
    return globalCache.getOrSet(key, async () => {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    }, { ttl: 20_000, tags: [this.cacheTag] });
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      this.invalidateCache();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  private invalidateCache(): void {
    globalCache.invalidateByTags([this.cacheTag]);
  }
}

export const adminNotificationService = new AdminNotificationService();
