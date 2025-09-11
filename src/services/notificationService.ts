import { supabase } from './supabase';
import { globalCache } from './globalCacheManager';

export interface AppNotification {
  id: string;
  user_id?: string | null;
  type: 'product' | 'feed_post' | 'system';
  title: string;
  body?: string | null;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

class NotificationService {
  private cacheTag = 'notifications';

  async getLatest(limit = 10, userId?: string | null): Promise<AppNotification[]> {
    const key = `${this.cacheTag}:latest:${limit}:${userId || 'guest'}`;
    return globalCache.getOrSet(key, async () => {
      let query = supabase
        .from('notifications')
        .select('id,user_id,type,title,body,link_url,is_read,created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        // For signed-in users: show user-specific and global (user_id is null)
        // Supabase does not support OR easily in client; fetch two small lists and merge.
        const [userRes, globalRes, readsRes] = await Promise.all([
          query.eq('user_id', userId),
          supabase
            .from('notifications')
            .select('id,user_id,type,title,body,link_url,is_read,created_at')
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(limit),
          supabase
            .from('notification_reads')
            .select('notification_id')
            .eq('user_id', userId)
        ]);
        const readMap = new Set<string>((readsRes.data || []).map((r: any) => r.notification_id));
        const merged = [...(userRes.data || []), ...(globalRes.data || [])] as AppNotification[];
        // For global notifications, compute is_read for this user using notification_reads
        const list = merged
          .map(n => ({
            ...n,
            is_read: n.user_id ? n.is_read : readMap.has(n.id)
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit) as AppNotification[];
        return list;
      }

      // Guests: show only global notifications
      const { data, error } = await query.is('user_id', null);
      if (error) throw error;
      return (data || []) as AppNotification[];
  }, { ttl: 30_000 });
  }

  async getUnreadCount(userId?: string | null): Promise<number> {
    const key = `${this.cacheTag}:unread-count:${userId || 'guest'}`;
    return globalCache.getOrSet(key, async () => {
      if (!userId) {
        // Guests: count all global as unread, but limit egress by fetching only count
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .is('user_id', null);
        if (error) throw error;
        return count || 0;
      }
      // Use RPC to minimize round trips
      const { data, error } = await supabase.rpc('get_unread_notification_count', { u_id: userId });
      if (error) throw error;
      return (data as number) ?? 0;
    }, { ttl: 20_000 });
  }

  async markAsRead(notificationId: string, userId?: string | null): Promise<void> {
    if (!userId) return; // guests: skip
    try {
      // Use RPC that handles both owned and global notifications
      const { error } = await supabase.rpc('mark_notification_read', { n_id: notificationId, u_id: userId });
      if (error) throw error;
      // Invalidate related caches
      await Promise.resolve(
        ['latest', 'unread-count'].forEach(tag => {
          globalCache.delete(`${this.cacheTag}:${tag}:10:${userId}`);
          globalCache.delete(`${this.cacheTag}:${tag}:10:${userId || 'guest'}`);
          globalCache.delete(`${this.cacheTag}:${tag}:*:${userId}`);
        })
      );
    } catch (e) {
      console.warn('markAsRead failed:', e);
    }
  }

  async markAllAsRead(userId?: string | null): Promise<void> {
    if (!userId) return; // guests: skip
    try {
      const { error } = await supabase.rpc('mark_all_notifications_read', { u_id: userId });
      if (error) throw error;
      // Invalidate caches for this user
      ['latest', 'unread-count'].forEach(tag => {
        globalCache.delete(`${this.cacheTag}:${tag}:10:${userId}`);
        globalCache.delete(`${this.cacheTag}:${tag}:*:${userId}`);
      });
    } catch (e) {
      console.warn('markAllAsRead failed:', e);
    }
  }
}

export const notificationService = new NotificationService();
