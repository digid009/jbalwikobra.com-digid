import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, ThumbsUp, ThumbsDown, AlertCircle, Plus } from 'lucide-react';
import { adminService, Review } from '../../../services/adminService';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystem';

export const AdminReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [tableExists, setTableExists] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadReviews();
  }, [currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getReviews(currentPage, itemsPerPage);
      setReviews(result.data);
      setTotalCount(result.count);
      setTableExists(true);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      if (error.message?.includes('reviews') && error.message?.includes('schema cache')) {
        setTableExists(false);
        setError('Reviews table not found. Click "Setup Reviews" to initialize the reviews system.');
      } else {
        setError(error.message || 'Failed to load reviews');
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-gray-600">Manage customer reviews and feedback</p>
        </div>
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
        <IOSCard className="bg-yellow-50 border border-yellow-200">
          <div className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </IOSCard>
      )}

      <IOSCard>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {review.user_id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {review.product_id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {review.comment ? (
                          <p className="truncate" title={review.comment}>
                            {review.comment.length > 100 
                              ? `${review.comment.substring(0, 100)}...` 
                              : review.comment
                            }
                          </p>
                        ) : (
                          <span className="text-gray-400 italic">No comment</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IOSButton variant="ghost" size="small">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                        </IOSButton>
                        <IOSButton variant="ghost" size="small">
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </IOSButton>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <IOSButton
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </IOSButton>
              </div>
            </div>
          </div>
        )}
      </IOSCard>
    </div>
  );
};
