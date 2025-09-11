import { supabase } from './supabase';

export interface UserReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Join fields
  user_name?: string;
  user_avatar?: string;
  product_name?: string;
  product_image?: string;
  // Additional fields for editing
  canEdit?: boolean;
}

export interface ReviewsResponse {
  reviews: UserReview[];
  hasMore: boolean;
  total: number;
}

class ReviewService {
  // Get reviews for feed page with user and product details
  async getReviewsForFeed(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      const offset = (page - 1) * limit;
      
      // First attempt: verified reviews only (left joins to avoid dropping rows without related user/product)
      let { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          users(
            id,
            name,
            avatar_url
          ),
          products(
            id,
            name,
            image
          )
        `, { count: 'exact' })
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Fallback: if no verified reviews exist, load any reviews
      if ((count || 0) === 0) {
        const alt = await supabase
          .from('reviews')
          .select(`
            *,
            users(
              id,
              name,
              avatar_url
            ),
            products(
              id,
              name,
              image
            )
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        if (!alt.error) {
          data = alt.data;
          count = alt.count;
        }
      }

      const reviews: UserReview[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        rating: item.rating,
        comment: item.comment,
        is_verified: item.is_verified,
        helpful_count: item.helpful_count,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_name: item.users?.name || 'Anonymous',
        user_avatar: item.users?.avatar_url,
        product_name: item.products?.name || 'Unknown Product',
        product_image: item.products?.image,
        // Reviews can be edited within 5 minutes of creation
        canEdit: this.canEditReview(item.created_at)
      }));

      return {
        reviews,
        hasMore: (count || 0) > offset + limit,
        total: count || 0
      };
    } catch (error) {
      return {
        reviews: [],
        hasMore: false,
        total: 0
      };
    }
  }

  // Check if a review can be edited (within 5 minutes)
  private canEditReview(createdAt: string): boolean {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffInMinutes <= 5;
  }

  // Get user's own reviews with purchase history
  async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          products!inner(
            id,
            name,
            image
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }

      const reviews: UserReview[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        rating: item.rating,
        comment: item.comment,
        is_verified: item.is_verified,
        helpful_count: item.helpful_count,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product_name: item.products?.name || 'Unknown Product',
        product_image: item.products?.image,
        canEdit: this.canEditReview(item.created_at)
      }));

      return {
        reviews,
        hasMore: (count || 0) > offset + limit,
        total: count || 0
      };
    } catch (error) {
      console.error('Error in getUserReviews:', error);
      return {
        reviews: [],
        hasMore: false,
        total: 0
      };
    }
  }

  // Update a review (if within edit time limit)
  async updateReview(reviewId: string, comment: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the review can still be edited
      const { data: existingReview, error: fetchError } = await supabase
        .from('reviews')
        .select('created_at, user_id')
        .eq('id', reviewId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Review not found' };
      }

      if (!this.canEditReview(existingReview.created_at)) {
        return { success: false, error: 'Review can no longer be edited (time limit exceeded)' };
      }

      const { error } = await supabase
        .from('reviews')
        .update({ 
          comment: comment.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error updating review:', error);
        return { success: false, error: 'Failed to update review' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateReview:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Create a new review
  async createReview(
    userId: string, 
    productId: string, 
    rating: number, 
    comment: string
  ): Promise<{ success: boolean; error?: string; review?: UserReview }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          product_id: productId,
          rating,
          comment: comment.trim(),
          is_verified: false // Will be set to true after verification
        })
        .select(`
          *,
          users!inner(name, avatar_url),
          products!inner(name, image)
        `)
        .single();

      if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: 'Failed to create review' };
      }

      const review: UserReview = {
        id: data.id,
        user_id: data.user_id,
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment,
        is_verified: data.is_verified,
        helpful_count: data.helpful_count,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_name: data.users?.name || 'Anonymous',
        user_avatar: data.users?.avatar_url,
        product_name: data.products?.name || 'Unknown Product',
        product_image: data.products?.image,
        canEdit: true
      };

      return { success: true, review };
    } catch (error) {
      console.error('Error in createReview:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get current helpful_count
      const { data: currentReview, error: fetchError } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Review not found' };
      }

      const { error } = await supabase
        .from('reviews')
        .update({ 
          helpful_count: (currentReview.helpful_count || 0) + 1
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Error marking review as helpful:', error);
        return { success: false, error: 'Failed to mark review as helpful' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in markHelpful:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get time ago string
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
    return `${Math.floor(diffInMinutes / 1440)} hari lalu`;
  }
}

export const reviewService = new ReviewService();
