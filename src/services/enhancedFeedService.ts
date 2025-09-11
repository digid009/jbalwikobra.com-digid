/**
 * Enhanced Feed Service with iOS-compatible caching and data fetching
 */

import { supabase } from './supabase';
import { globalCache } from './globalCacheManager';

export type FeedPost = {
  id: string;
  user_id: string;
  type: string;
  product_id?: string | null;
  title?: string | null;
  content: string | null;
  rating?: number | null;
  image_url?: string | null;
  likes_count: number;
  comments_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  // Computed fields for UI compatibility
  authorName?: string;
  authorAvatarUrl?: string;
  media?: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    position: number;
  }>;
  counts: {
    likes: number;
    comments: number;
  };
  reacted?: boolean;
};

export interface FeedListResult {
  posts: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export class EnhancedFeedService {
  private static instance: EnhancedFeedService;
  private static readonly CACHE_TAGS = {
    FEED_POSTS: 'feed-posts',
    FEED_LIST: 'feed-list'
  } as const;

  private async getCurrentUserId(): Promise<string | undefined> {
    if (!supabase) return undefined;
    const { data } = await supabase.auth.getUser();
    return data.user?.id;
  }

  static getInstance(): EnhancedFeedService {
    if (!this.instance) {
      this.instance = new EnhancedFeedService();
    }
    return this.instance;
  }

  /**
   * List feed posts with iOS-optimized caching
   */
  async list({ limit = 10, cursor }: { limit?: number; cursor?: string } = {}): Promise<FeedListResult> {
    const cacheKey = `feed:list:${limit}:${cursor || 'initial'}`;
    
    return globalCache.getOrSet(
      cacheKey,
      async () => {
        try {
          if (supabase) {
            console.log('[FeedService] Fetching from Supabase...', { limit, cursor });
            
            let query = supabase
              .from('feed_posts')
              .select(`
                *,
                users:user_id (
                  id,
                  name,
                  avatar_url
                )
              `, { count: 'exact' })
              .eq('is_deleted', false)
              .order('created_at', { ascending: false })
              .limit(limit);

            if (cursor) {
              query = query.lt('created_at', cursor);
            }

            const { data, count, error } = await query;

            if (error) {
              console.error('[FeedService] Database error:', error);
              throw error;
            }

            console.log('[FeedService] Fetched posts:', { count, posts: data?.length });

            // Transform the data to match the expected format
            const posts = (data || []).map(post => {
              const user = Array.isArray(post.users) ? post.users[0] : post.users;
              return {
                ...post,
                // Map database fields to expected interface
                authorName: user?.name || 'Anonymous User',
                authorAvatarUrl: user?.avatar_url || undefined,
                media: post.image_url ? [{
                  id: post.id + '_img',
                  type: 'image' as const,
                  url: post.image_url,
                  position: 0
                }] : [],
                counts: {
                  likes: post.likes_count || 0,
                  comments: post.comments_count || 0
                },
                reacted: false // TODO: Check if current user liked this post
              };
            });

            const hasMore = (posts.length === limit) && (count || 0) > posts.length;
            const nextCursor = hasMore ? posts[posts.length - 1]?.created_at : undefined;

            return {
              posts,
              nextCursor,
              hasMore,
              total: count || 0
            };
          }
          
          console.warn('[FeedService] Supabase not configured');
          return {
            posts: [],
            hasMore: false,
            total: 0
          };
        } catch (err) {
          console.error('[FeedService] Error fetching posts:', err);
          throw err;
        }
      },
      {
        ttl: 2 * 60 * 1000, // 2 minutes
        tags: [EnhancedFeedService.CACHE_TAGS.FEED_LIST]
      }
    );
  }

  /**
   * Create a new feed post
   */
  async create(post: Omit<FeedPost, 'id' | 'created_at' | 'updated_at'>): Promise<FeedPost> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create post');

    await this.invalidateCache();
    return data;
  }

  /**
   * Update an existing feed post
   */
  async update(id: string, updates: Partial<FeedPost>): Promise<FeedPost> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Post not found');

    await this.invalidateCache();
    return data;
  }

  /**
   * Delete a feed post
   */
  async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await this.invalidateCache();
  }

  /**
   * Invalidate all feed-related caches
   */
  private async invalidateCache(): Promise<void> {
    await globalCache.invalidateByTags([
      EnhancedFeedService.CACHE_TAGS.FEED_POSTS,
      EnhancedFeedService.CACHE_TAGS.FEED_LIST
    ]);
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: string, liked: boolean): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('feed_post_likes')
      .upsert({
        post_id: postId,
        user_id: await this.getCurrentUserId(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    await this.invalidateCache();
  }

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, content: string): Promise<{ success: boolean }> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase
      .from('feed_post_comments')
      .insert([{
        post_id: postId,
        user_id: await this.getCurrentUserId(),
        content,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    await this.invalidateCache();
    return { success: true };
  }
}

// Export singleton instance
export const enhancedFeedService = EnhancedFeedService.getInstance();
