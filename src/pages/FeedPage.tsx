import React, { useState, useCallback, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Star, Edit2, Save, X, ArrowLeft, ChevronLeft, ChevronRight, Filter, Users, Sparkles, Calendar, Clock } from 'lucide-react';
import { enhancedFeedService, type FeedPost } from '../services/enhancedFeedService';
import { reviewService, type UserReview } from '../services/reviewService';
import { IOSContainer, IOSCard, IOSButton, IOSSectionHeader, IOSHero, IOSBadge } from '../components/ios/IOSDesignSystem';
import { ConsistentLayout, PageWrapper, ContentSection } from '../components/layout/ConsistentLayout';
import { ModernFeedCard } from '../components/ModernFeedCard';
import LinkifyText from '../components/LinkifyText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { standardClasses, cn } from '../styles/standardClasses';
import { scrollToPaginationContent } from '../utils/scrollUtils';

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

// Modern Tab component with glassmorphism design
const Tab: React.FC<TabProps> = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={cn(
      'relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 flex-1 text-sm backdrop-blur-xl border',
      isActive 
        ? 'bg-gradient-to-r from-pink-500/30 to-fuchsia-500/30 text-pink-100 border-pink-500/30 shadow-lg shadow-pink-500/10' 
        : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
    )}
  >
    <span className="truncate">{label}</span>
    {count !== undefined && (
      <IOSBadge 
        variant={isActive ? "primary" : "secondary"} 
        className="text-xs px-2 py-0.5"
      >
        {count}
      </IOSBadge>
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
    <div className={cn(standardClasses.flex.center, 'gap-1 sm:gap-2 mt-8')}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={cn(
          standardClasses.flex.center,
          `min-h-[${MIN_TOUCH_TARGET}px] min-w-[${MIN_TOUCH_TARGET}px] rounded-lg transition-all duration-200`,
          currentPage === 1 || loading 
            ? 'bg-black/50 text-white-secondary/50 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-black/80'
        )}
      >
        <ChevronLeft size={20} />
      </button>

      <div className={cn(standardClasses.flex.row, 'gap-1 mx-2')}>
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
            disabled={pageNum === '...' || loading}
            className={`
              min-h-[${MIN_TOUCH_TARGET}px] min-w-[${MIN_TOUCH_TARGET}px] rounded-lg font-medium transition-all duration-200 text-sm sm:text-base
              ${pageNum === currentPage
                ? 'bg-pink-500 text-white shadow-lg'
                : pageNum === '...'
                ? 'text-white-secondary cursor-default bg-transparent'
                : 'bg-black text-white hover:bg-black/80 disabled:opacity-50'
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
            ? 'bg-black/50 text-white-secondary/50 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-black/80'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Modern Hero Section with Glass Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-fuchsia-500/20 to-purple-500/20"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                  Feed Komunitas
                </h1>
                <p className="text-gray-400 mt-1">Bergabung dalam diskusi dan dapatkan update terbaru</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Modern Tab Navigation with Glass Effect */}
        <div id="content-tabs" className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl mb-8">
          <div className="flex gap-3">
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
                size="small" 
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
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-xl mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-100">{error}</p>
              </div>
              <IOSButton 
                onClick={loadInitialData}
                className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 text-red-100"
              >
                Coba Lagi
              </IOSButton>
            </div>
          </div>
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
              <ModernFeedCard
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
              <IOSCard key={review.id} padding="medium" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar}
                        alt={review.user_name || 'User'}
                        className="w-9 h-9 rounded-full object-cover border border-gray-700"
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
                        <span className="text-xs text-white-secondary">
                          {getTimeAgo(review.created_at)}
                        </span>
                      </div>
                      {review.product_name && (
                        <div className="text-xs text-white-secondary mt-1">
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
                <div className="grid grid-cols-[auto_1fr] gap-4 items-start mb-2">
                  <div className="w-fit">
                    {review.product_image ? (
                      <button
                        onClick={() => setImagePreview(review.product_image)}
                        className="block"
                        aria-label="Lihat gambar produk"
                      >
                        <img
                          src={review.product_image}
                          alt={review.product_name || 'Product'}
                          className="w-full max-w-[120px] h-auto rounded-xl object-cover border border-gray-700"
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <div className="w-[120px] h-[90px] rounded-xl bg-black-secondary border border-gray-700" />
                    )}
                  </div>
                  <div>
                    {editingReview === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Tulis review Anda..."
                      className="w-full min-h-[100px] p-3 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ios-accent"
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
                      <p className="text-xs text-white-secondary mt-2">Review dapat diedit dalam 5 menit</p>
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
            <img src={imagePreview} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-2xl border border-gray-700" />
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
            <MessageCircle className="h-12 w-12 text-white-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {activeFilter === 'semua' ? 'Belum ada postingan' : 
               activeFilter === 'pengumuman' ? 'Belum ada pengumuman' : 
               'Belum ada review'}
            </h3>
            <p className="text-white-secondary">
              {activeFilter === 'review' 
                ? 'Belum ada review untuk ditampilkan'
                : 'Jadilah yang pertama untuk berbagi di komunitas ini!'
              }
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-4">
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
      </div>
    </div>
  );
}


