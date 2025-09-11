import React, { useState, useCallback, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Star, Edit2, Save, X, ArrowLeft, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { enhancedFeedService, type FeedPost } from '../services/enhancedFeedService';
import { reviewService, type UserReview } from '../services/reviewService';
import { IOSContainer, IOSCard, IOSButton, IOSSectionHeader } from '../components/ios/IOSDesignSystem';
import { ConsistentLayout, PageWrapper, ContentSection } from '../components/layout/ConsistentLayout';
import LinkifyText from '../components/LinkifyText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';

// Mobile-first constants
const MIN_TOUCH_TARGET = 44; // iOS HIG minimum 44pt touch target

// Tab filter type
type FeedFilter = 'semua' | 'pengumuman' | 'review';

// Items per page
const ITEMS_PER_PAGE = 10;

// Tab component
interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-3 min-h-[${MIN_TOUCH_TARGET}px] rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-1 text-sm sm:text-base
      ${isActive 
        ? 'bg-ios-accent text-white shadow-lg' 
        : 'bg-ios-surface text-ios-text-secondary hover:bg-ios-surface/80 hover:text-ios-text'
      }
    `}
  >
    <span className="truncate">{label}</span>
    {count !== undefined && (
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-bold
        ${isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-ios-text-secondary/20 text-ios-text-secondary'
        }
      `}>
        {count}
      </span>
    )}
  </button>
);

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = window.innerWidth < 768 ? 1 : 2; // Fewer pages on mobile
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={`
          min-h-[${MIN_TOUCH_TARGET}px] min-w-[${MIN_TOUCH_TARGET}px] rounded-lg flex items-center justify-center transition-all duration-200
          ${currentPage === 1 || loading 
            ? 'bg-ios-surface/50 text-ios-text-secondary/50 cursor-not-allowed' 
            : 'bg-ios-surface text-ios-text hover:bg-ios-surface/80'
          }
        `}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
            disabled={pageNum === '...' || loading}
            className={`
              min-h-[${MIN_TOUCH_TARGET}px] min-w-[${MIN_TOUCH_TARGET}px] rounded-lg font-medium transition-all duration-200 text-sm sm:text-base
              ${pageNum === currentPage
                ? 'bg-ios-accent text-white shadow-lg'
                : pageNum === '...'
                ? 'text-ios-text-secondary cursor-default bg-transparent'
                : 'bg-ios-surface text-ios-text hover:bg-ios-surface/80 disabled:opacity-50'
              }
            `}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className={`
          min-h-[${MIN_TOUCH_TARGET}px] min-w-[${MIN_TOUCH_TARGET}px] rounded-lg flex items-center justify-center transition-all duration-200
          ${currentPage === totalPages || loading 
            ? 'bg-ios-surface/50 text-ios-text-secondary/50 cursor-not-allowed' 
            : 'bg-ios-surface text-ios-text hover:bg-ios-surface/80'
          }
        `}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

// Fallback loading component
const FeedSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <IOSCard key={i} padding="medium">
        <div className="ios-skeleton h-4 w-32 mb-3"></div>
        <div className="ios-skeleton h-40 w-full mb-4 rounded-lg"></div>
        <div className="flex gap-3">
          <div className="ios-skeleton h-8 w-16 rounded-md"></div>
          <div className="ios-skeleton h-8 w-20 rounded-md"></div>
          <div className="ios-skeleton h-8 w-24 rounded-md"></div>
        </div>
      </IOSCard>
    ))}
  </div>
);

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
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
    return `${Math.floor(diffInMinutes / 1440)} hari lalu`;
  };

  return (
    <div className="min-h-screen bg-ios-background text-ios-text">
      <IOSContainer maxWidth="md" className="pt-2 pb-24 with-bottom-nav">
        <IOSSectionHeader 
          title="Feed Komunitas" 
          subtitle={user ? 'Bergabunglah dalam diskusi' : 'Login untuk berinteraksi'}
          className="mb-2"
        />
        {/* Mobile-First Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-ios-bg-secondary rounded-xl overflow-x-auto">
          <Tab
            label="Semua"
            isActive={activeFilter === 'semua'}
            onClick={() => handleFilterChange('semua')}
            count={totalCounts.semua}
          />
          <Tab
            label="Pengumuman"
            isActive={activeFilter === 'pengumuman'}
            onClick={() => handleFilterChange('pengumuman')}
            count={totalCounts.pengumuman}
          />
          <Tab
            label="Review"
            isActive={activeFilter === 'review'}
            onClick={() => handleFilterChange('review')}
            count={totalCounts.review}
          />
        </div>

        {/* Login Notice for Guests */}
        {!user && (
          <IOSCard padding="medium" className="mb-6 border border-pink-200 bg-pink-50">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-pink-800">
                <strong>Info:</strong> Anda sebagai guest. Masuk untuk like, komentar, dan review.
              </p>
              <IOSButton size="small" variant="primary" onClick={() => navigate('/auth')}>
                Masuk
              </IOSButton>
            </div>
          </IOSCard>
        )}

        {/* Loading State */}
        {isLoading && <FeedSkeleton />}

        {/* Error State */}
        {error && !isLoading && (
          <IOSCard padding="medium" className="border border-ios-border mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ios-text-secondary">{error}</p>
              <IOSButton variant="secondary" size="small" onClick={loadInitialData}>Coba lagi</IOSButton>
            </div>
          </IOSCard>
        )}

        {/* Posts Section */}
        {!isLoading && (activeFilter === 'semua' || activeFilter === 'pengumuman') && feedPosts.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold">
              {activeFilter === 'semua' ? 'Postingan & Pengumuman' : 'Pengumuman'}
            </h2>
            
            {feedPosts.map((post) => (
              <IOSCard key={post.id} padding="medium" className="hover:shadow-md transition-shadow">
                {/* User row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {post.authorAvatarUrl ? (
                      <img
                        src={post.authorAvatarUrl}
                        alt={post.authorName || 'User'}
                        className="w-9 h-9 rounded-full object-cover border border-ios-border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ios-accent to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                        {(post.authorName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{post.authorName || 'Postingan'}</div>
                      <div className="text-xs text-ios-text-secondary">{timeAgo(post.created_at)}</div>
                    </div>
                  </div>
                  <button className="text-ios-text-secondary hover:text-ios-text" aria-label="More">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Content */}
                {post.content && (
                  <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                    <LinkifyText text={post.content} />
                  </div>
                )}

                {/* Media grid */}
                {post.media && post.media.length > 0 && (
                  <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
                    {post.media.map((m) => (
                      <div key={m.id} className="overflow-hidden rounded-lg border border-ios-border">
                        {m.type === 'image' ? (
                          <img src={m.url} alt={`media`} className="w-full h-60 object-cover" loading="lazy" />
                        ) : (
                          <video src={m.url} className="w-full h-60 object-cover" controls />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => toggleLike(post.id)}
                    aria-label="Suka"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Heart size={16} className="text-ios-accent" />
                      <span className="text-ios-text-secondary">{post.counts.likes}</span>
                    </div>
                  </IOSButton>
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => addComment(post.id)}
                    aria-label="Komentar"
                  >
                    <div className="inline-flex items-center gap-2">
                      <MessageCircle size={16} />
                      <span className="text-ios-text-secondary">{post.counts.comments}</span>
                    </div>
                  </IOSButton>
                  <IOSButton variant="ghost" size="small" aria-label="Bagikan">
                    <div className="inline-flex items-center gap-2">
                      <Share2 size={16} />
                      <span className="text-ios-text-secondary">Bagikan</span>
                    </div>
                  </IOSButton>
                </div>
              </IOSCard>
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
              <IOSCard key={review.id} padding="medium" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar}
                        alt={review.user_name || 'User'}
                        className="w-9 h-9 rounded-full object-cover border border-ios-border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ios-accent to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                        {(review.user_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{review.user_name || 'Anonymous'}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-xs text-ios-text-secondary">
                          {getTimeAgo(review.created_at)}
                        </span>
                      </div>
                      {review.product_name && (
                        <div className="text-xs text-ios-text-secondary mt-1">
                          Review untuk: {review.product_name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {review.user_id === user?.id && review.canEdit && (
                    <IOSButton
                      variant="ghost"
                      size="small"
                      onClick={() => startEditReview(review)}
                      className="gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </IOSButton>
                  )}
                </div>
                
                {/* 2-column content: image left, review right */}
                <div className="grid grid-cols-2 gap-4 items-start mb-2">
                  <div>
                    {review.product_image ? (
                      <button
                        onClick={() => setImagePreview(review.product_image)}
                        className="block"
                        aria-label="Lihat gambar produk"
                      >
                        <img
                          src={review.product_image}
                          alt={review.product_name || 'Product'}
                          className="w-full max-w-[160px] h-auto rounded-xl object-cover border border-ios-border"
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <div className="w-full max-w-[160px] h-[120px] rounded-xl bg-ios-surface-secondary border border-ios-border" />
                    )}
                  </div>
                  <div>
                    {editingReview === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Tulis review Anda..."
                      className="w-full min-h-[100px] p-3 border border-ios-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ios-accent"
                    />
                    <div className="flex gap-2">
                      <IOSButton
                        size="small"
                        onClick={() => saveEditReview(review.id)}
                        className="gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Simpan
                      </IOSButton>
                      <IOSButton
                        variant="secondary"
                        size="small"
                        onClick={cancelEditReview}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        Batal
                      </IOSButton>
                    </div>
                  </div>
                    ) : (
                      <p className="text-base leading-relaxed">{review.comment}</p>
                    )}
                    {review.canEdit && editingReview !== review.id && (
                      <p className="text-xs text-ios-text-secondary mt-2">Review dapat diedit dalam 5 menit</p>
                    )}
                  </div>
                </div>
              </IOSCard>
            ))}
          </div>
        )}

        {/* Fullscreen image modal */}
        {imagePreview && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center" onClick={() => setImagePreview(null)}>
            <img src={imagePreview} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-2xl border border-ios-border" />
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center py-6">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={isLoading}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && feedPosts.length === 0 && userReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-ios-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {activeFilter === 'semua' ? 'Belum ada postingan' : 
               activeFilter === 'pengumuman' ? 'Belum ada pengumuman' : 
               'Belum ada review'}
            </h3>
            <p className="text-ios-text-secondary">
              {activeFilter === 'review' 
                ? 'Belum ada review untuk ditampilkan'
                : 'Jadilah yang pertama untuk berbagi di komunitas ini!'
              }
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-4">
          <IOSButton variant="secondary" onClick={loadInitialData} disabled={isLoading}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border border-ios-border border-t-ios-accent" />
                Memuat…
              </span>
            ) : 'Muat ulang'}
          </IOSButton>
        </div>
      </IOSContainer>
    </div>
  );
}


