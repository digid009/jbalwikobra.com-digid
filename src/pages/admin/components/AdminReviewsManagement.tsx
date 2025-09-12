import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, ThumbsUp, ThumbsDown, AlertCircle, Plus, Search, Filter, X } from 'lucide-react';
import { adminService, Review } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSPagination } from '../../../components/ios/IOSDesignSystem';
import { IOSAvatar } from '../../../components/ios/IOSAvatar';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';
import { getUserAvatarUrl, getUserDisplayName } from '../../../utils/avatarUtils';

export const AdminReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [tableExists, setTableExists] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    loadReviews();
  }, [currentPage, searchTerm, ratingFilter, dateFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasErrors(false);
      setErrorMessage('');
      const result = await adminService.getReviews(currentPage, itemsPerPage);
      setReviews(result.data);
      setTotalCount(result.count);
      setTableExists(true);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      setHasErrors(true);
      if (error.message?.includes('reviews') && error.message?.includes('schema cache')) {
        setTableExists(false);
        setError('Reviews table not found. Click "Setup Reviews" to initialize the reviews system.');
        setErrorMessage('Reviews table not found');
      } else {
        setError(error.message || 'Failed to load reviews');
        setErrorMessage(error.message || 'Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupReviewsTable = async () => {
    try {
      setLoading(true);
      // Create some sample reviews data
      await adminService.createSampleReviews();
      await loadReviews();
    } catch (error: any) {
      setError(error.message || 'Failed to setup reviews table');
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={hasErrors}
        errorMessage={errorMessage}
        statsLoaded={!loading}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader title="Reviews Management" subtitle="Manage customer reviews and feedback" />
        <div className="flex items-center space-x-2">
          {!tableExists && (
            <IOSButton 
              onClick={setupReviewsTable} 
              variant="primary"
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>Setup Reviews</span>
            </IOSButton>
          )}
          <IOSButton onClick={loadReviews} className="flex items-center space-x-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
        </div>
      </div>

      {error && (
        <IOSCard variant="elevated" padding="medium" className="bg-ios-warning/10 border border-ios-warning/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-ios-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-ios-warning mb-1">Setup Required</h3>
              <p className="text-sm text-gray-200">{error}</p>
            </div>
          </div>
        </IOSCard>
      )}

      {/* Filters */}
      {!error && (
        <IOSCard variant="elevated" padding="medium">
          <div className="space-y-4">
            {/* First Row - Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-200" />
              <input
                type="text"
                placeholder="Search reviews by customer name, product name, or review text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-xl transition-colors duration-200',
                  'bg-ios-surface border border-gray-700 text-ios-text placeholder-ios-text-secondary',
                  'focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                )}
              />
            </div>

            {/* Second Row - Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Rating Filter */}
              <div className="flex items-center space-x-3 min-w-[140px]">
                <Filter className="w-4 h-4 text-gray-200" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className={cn(
                    'border border-gray-700 rounded-xl px-4 py-2 bg-ios-surface',
                    'focus:ring-2 focus:ring-ios-primary focus:border-pink-500',
                    'transition-colors duration-200 text-ios-text'
                  )}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                  <option value="high">4+ Stars</option>
                  <option value="low">3 or Less</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-3 min-w-[140px]">
                <span className="text-sm font-medium text-gray-200">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={cn(
                    'border border-gray-700 rounded-xl px-4 py-2 bg-ios-surface',
                    'focus:ring-2 focus:ring-ios-primary focus:border-pink-500',
                    'transition-colors duration-200 text-ios-text'
                  )}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>

              {/* Clear Filters */}
              <IOSButton 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setRatingFilter('all');
                  setDateFilter('all');
                }}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </IOSButton>
            </div>
          </div>
        </IOSCard>
      )}

      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-accent" />
            <p className="text-gray-200 font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={cn(
                'bg-ios-surface border-b border-gray-700'
              )}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-ios-surface transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-ios-text">
                          {review.user_name || 'Anonymous'}
                        </div>
                        {review.user_id ? (
                          <div className="text-sm text-gray-200">
                            ID: {review.user_id.slice(-8)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-200 italic">No User ID</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-ios-text">
                          {review.product_name || 'Unknown Product'}
                        </div>
                        {review.product_id ? (
                          <div className="text-sm text-gray-200">
                            ID: {review.product_id.slice(-8)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-200 italic">No Product ID</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className={`text-sm font-medium ${
                          review.rating >= 4 ? 'text-ios-success' : 
                          review.rating >= 3 ? 'text-ios-warning' : 'text-ios-error'
                        }`}>
                          {review.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-ios-text max-w-xs">
                        {review.comment ? (
                          <p className="truncate" title={review.comment}>
                            {review.comment.length > 100 
                              ? `${review.comment.substring(0, 100)}...` 
                              : review.comment
                            }
                          </p>
                        ) : (
                          <span className="text-gray-200 italic">No comment</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-200">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IOSButton variant="ghost" size="small">
                          <ThumbsUp className="w-4 h-4 text-ios-success" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small">
                          <ThumbsDown className="w-4 h-4 text-ios-error" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-ios-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-200 font-medium">No reviews found</p>
            <p className="text-gray-200/70 text-sm">Reviews will appear here once customers leave feedback</p>
          </div>
        )}

        <IOSPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={true}
          onItemsPerPageChange={setItemsPerPage}
        />
      </IOSCard>
    </div>
  );
};
