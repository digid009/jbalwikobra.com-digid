import React, { useState, useCallback, useEffect } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { enhancedFeedService, type FeedPost } from '../services/enhancedFeedService';
import { reviewService, type UserReview } from '../services/reviewService';
import { IOSButton } from '../components/ios/IOSDesignSystemV2';
import { FeedCard } from '../components/FeedCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { FeedHeader } from '../components/feed/FeedHeader';
import { FeedTabs } from '../components/feed/FeedTabs';
import { FeedPagination } from '../components/feed/FeedPagination';
import { FeedSkeleton, ErrorState, EmptyState, ImageLightbox } from '../components/feed/FeedStates';
import { ReviewCard } from '../components/feed/ReviewCard';
// Removed legacy standardClasses & cn helper – using a minimal local cls combiner
const cls = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
import { scrollToPaginationContent } from '../utils/scrollUtils';

// Mobile-first constants following iOS design guidelines
const MOBILE_CONSTANTS = {
  // iOS/Android recommended touch target sizes
  MIN_TOUCH_TARGET: 44, // 44dp/pt minimum touch target
  CONTENT_PADDING: 16,   // Standard content padding
  SECTION_SPACING: 24,   // Section spacing
  CARD_SPACING: 12,      // Card spacing
  
  // Performance optimizations
  ITEMS_PER_PAGE: 10,
  CACHE_DURATION: 5 * 60 * 1000,
  
  // Animation timing following platform standards
  ANIMATIONS: {
    FAST: 200,    // Quick interactions
    STANDARD: 300, // Standard transitions
    SLOW: 500,    // Complex transitions
  },
  
  // Safe area considerations
  HEADER_HEIGHT_MOBILE: 0,     // Hide header on mobile
  HEADER_HEIGHT_DESKTOP: 80,   // Standard header height on desktop
  BOTTOM_NAV_HEIGHT: 80,       // Bottom navigation height
} as const;

// Tab filter type
type FeedFilter = 'semua' | 'pengumuman' | 'review';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} dtk`;
  if (diff < 3600) return `${Math.floor(diff / 60)} m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} j`;
  return `${Math.floor(diff / 86400)} h`;
}

export default function FeedPage() {
  const { user } = useAuth();
  
  // State management
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Filter and pagination state
  const [activeFilter, setActiveFilter] = useState<'semua' | 'pengumuman' | 'review'>('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCounts, setTotalCounts] = useState({
    semua: 0,
    pengumuman: 0,
    review: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 12;
  const navigate = useNavigate();

  // Set body attribute for CSS targeting and mobile optimizations
  useEffect(() => {
    document.body.setAttribute('data-page', 'feed');
    document.body.classList.add('feed-mobile-optimized', 'ios-scroll');
    
    return () => {
      document.body.removeAttribute('data-page');
      document.body.classList.remove('feed-mobile-optimized', 'ios-scroll');
    };
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (activeFilter === 'semua') {
        // Load both posts and reviews
        const [postsResult, reviewsResult] = await Promise.all([
          enhancedFeedService.list({ limit: ITEMS_PER_PAGE }),
          reviewService.getReviewsForFeed(currentPage, ITEMS_PER_PAGE)
        ]);
        setFeedPosts(postsResult.posts);
        setUserReviews(reviewsResult.reviews);
        
        // Calculate total pages for combined data
        const totalItems = postsResult.total + reviewsResult.total;
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
      } else if (activeFilter === 'pengumuman') {
        // Load only posts
        const postsResult = await enhancedFeedService.list({ limit: ITEMS_PER_PAGE });
        setFeedPosts(postsResult.posts);
        setUserReviews([]);
        setTotalPages(Math.ceil(postsResult.total / ITEMS_PER_PAGE));
      } else if (activeFilter === 'review') {
        // Load only reviews
        const reviewsResult = await reviewService.getReviewsForFeed(currentPage, ITEMS_PER_PAGE);
        setFeedPosts([]);
        setUserReviews(reviewsResult.reviews);
        setTotalPages(Math.ceil(reviewsResult.total / ITEMS_PER_PAGE));
      }
      
      // Update total counts for tabs
      const [allPosts, allReviews] = await Promise.all([
        enhancedFeedService.list({ limit: 1 }),
        reviewService.getReviewsForFeed(1, 1)
      ]);
      
      setTotalCounts({
        semua: allPosts.total + allReviews.total,
        pengumuman: allPosts.total,
        review: allReviews.total
      });
      
    } catch (err: any) {
      console.error('Failed to load feed:', err);
      setError(err.message || 'Gagal memuat feed');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, currentPage]);

  useEffect(() => { 
    loadInitialData(); 
  }, [loadInitialData]);
  
  // Handle filter change
  const handleFilterChange = (filter: FeedFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page
    // Scroll to content tabs when filter changes
    scrollToPaginationContent();
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to content tabs when page changes
    scrollToPaginationContent();
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      alert('Silakan login untuk memberikan like');
      return;
    }

    try {
      // Optimistic update
      setFeedPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, counts: { ...p.counts, likes: p.counts.likes + 1 } } 
          : p
      ));
      
      await enhancedFeedService.toggleLike(postId, true);
    } catch (err: any) {
      console.error('Failed to like post:', err);
      // Revert optimistic update on error
      setFeedPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, counts: { ...p.counts, likes: Math.max(0, p.counts.likes - 1) } } 
          : p
      ));
    }
  };

  const addComment = async (postId: string) => {
    if (!user) {
      alert('Silakan login untuk memberikan komentar');
      return;
    }

    const content = prompt('Tulis komentar:');
    if (!content?.trim()) return;
    
    try {
      const result = await enhancedFeedService.addComment(postId, content);
      if (result.success) {
        setFeedPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, counts: { ...p.counts, comments: p.counts.comments + 1 } } 
            : p
        ));
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err);
    }
  };

  const startEditReview = (review: UserReview) => {
    if (!review.canEdit) {
      alert('Review tidak dapat diedit lagi (lebih dari 5 menit)');
      return;
    }
    setEditingReview(review.id);
    setEditContent(review.comment);
  };

  const saveEditReview = async (reviewId: string) => {
    try {
      const result = await reviewService.updateReview(reviewId, editContent);
      if (result.success) {
        setUserReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, comment: editContent }
            : review
        ));
        setEditingReview(null);
        setEditContent('');
        alert('Review berhasil diupdate');
      } else {
        alert(result.error || 'Gagal mengupdate review');
      }
    } catch (error) {
      alert('Gagal mengupdate review');
    }
  };

  const cancelEditReview = () => {
    setEditingReview(null);
    setEditContent('');
  };

  // Helpers moved into ReviewCard component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 page-content-mobile">
  <FeedHeader totalCounts={totalCounts} />

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 lg:py-8 pb-24 lg:pb-8">
        {/* Tabs */}
        <div className="mb-6 lg:mb-8">
          <FeedTabs active={activeFilter} counts={totalCounts} onChange={handleFilterChange} />
        </div>

        {/* Login Notice for Guests */}
        {!user && (
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/30 shadow-xl mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-100 font-semibold">Login Required</p>
                  <p className="text-amber-200/70 text-sm">Masuk untuk like, komentar, dan memberikan review</p>
                </div>
              </div>
              <IOSButton 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-100"
              >
                Masuk
              </IOSButton>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <FeedSkeleton />}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState message={error} onRetry={loadInitialData} />
        )}

        {/* Posts Section */}
        {!isLoading && (activeFilter === 'semua' || activeFilter === 'pengumuman') && feedPosts.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {activeFilter === 'semua' ? 'Pengumuman' : 'Pengumuman'}
              </h2>
            </div>
            
            {feedPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title || 'Pengumuman',
                  content: post.content || '',
                  author: post.authorName || 'Admin',
                  created_at: post.created_at,
                  type: 'announcement',
                  media: post.media?.map(m => m.url) || [],
                  counts: post.counts,
                  isLiked: (post as any).isLiked || false
                }}
                onLike={toggleLike}
                onComment={addComment}
                onImageClick={setImagePreview}
                canInteract={!!user}
              />
            ))}
          </div>
        )}

        {/* Reviews Section */}
        {!isLoading && (activeFilter === 'semua' || activeFilter === 'review') && userReviews.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">
              {activeFilter === 'semua' ? 'Review Pembelian' : 'Review'}
            </h2>
            {userReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                isEditing={editingReview === review.id}
                editValue={editContent}
                onStartEdit={startEditReview}
                onChangeEdit={setEditContent}
                onSaveEdit={saveEditReview}
                onCancelEdit={cancelEditReview}
                onImageClick={(src) => setImagePreview(src)}
              />
            ))}
          </div>
        )}

        {/* Fullscreen image modal */}
        {imagePreview && (
          <ImageLightbox src={imagePreview} onClose={() => setImagePreview(null)} />
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center py-6">
            <FeedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={isLoading}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && feedPosts.length === 0 && userReviews.length === 0 && (
          <EmptyState
            label={activeFilter === 'semua' ? 'Belum ada postingan' : activeFilter === 'pengumuman' ? 'Belum ada pengumuman' : 'Belum ada review'}
            description={activeFilter === 'review' ? 'Belum ada review untuk ditampilkan' : 'Jadilah yang pertama untuk berbagi di komunitas ini!'}
          />
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-4 pb-6 lg:pb-4">
          <IOSButton 
            onClick={loadInitialData} 
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 hover:from-pink-500/30 hover:to-fuchsia-500/30"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border border-pink-400 border-t-transparent" />
                Memuat…
              </span>
            ) : 'Muat ulang'}
          </IOSButton>
        </div>
        
        {/* Extra spacing for mobile navigation */}
        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}


