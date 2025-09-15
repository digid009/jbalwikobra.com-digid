import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, RefreshCw } from 'lucide-react';
import { adminService, Review } from '../../../services/adminService';
import { ReviewsStatsComponent } from '../../../components/admin/reviews/ReviewsStatsComponent';
import { ReviewsFiltersComponent } from '../../../components/admin/reviews/ReviewsFiltersComponent';
import { ReviewsTable } from '../../../components/admin/reviews/ReviewsTable';
import { ReviewFormModal } from '../../../components/admin/reviews/ReviewFormModal';

export const AdminReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage] = useState(20);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filterState, setFilterState] = useState({
    searchTerm: '',
    ratingFilter: 'all' as 'all' | '5' | '4' | '3' | '2' | '1' | 'high' | 'low',
    dateFilter: 'all' as 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year',
    sortBy: 'created_at' as 'created_at' | 'rating' | 'user_name' | 'product_name',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Statistics calculation
  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0,
    highRatedReviews: reviews.filter(review => review.rating >= 4).length,
    lowRatedReviews: reviews.filter(review => review.rating <= 2).length,
    recentReviews: reviews.filter(review => {
      const reviewDate = new Date(review.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate > weekAgo;
    }).length
  };

  // Convert filter state to component props format
  const filtersForComponent = {
    searchTerm: filterState.searchTerm,
    ratingFilter: filterState.ratingFilter,
    dateFilter: filterState.dateFilter,
    sortBy: filterState.sortBy,
    sortOrder: filterState.sortOrder
  };

  useEffect(() => {
    loadReviews();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [reviews, filterState]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getReviews(currentPage, itemsPerPage);
      setReviews(result.data);
      setTotalCount(result.count || 0);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Search filter
    if (filterState.searchTerm) {
      const searchLower = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchLower) ||
        review.user_name?.toLowerCase().includes(searchLower) ||
        review.product_name?.toLowerCase().includes(searchLower)
      );
    }

    // Rating filter
    if (filterState.ratingFilter !== 'all') {
      if (filterState.ratingFilter === 'high') {
        filtered = filtered.filter(review => review.rating >= 4);
      } else if (filterState.ratingFilter === 'low') {
        filtered = filtered.filter(review => review.rating <= 2);
      } else {
        filtered = filtered.filter(review => review.rating === parseInt(filterState.ratingFilter));
      }
    }

    // Date range filter
    if (filterState.dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filterState.dateFilter) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(review => new Date(review.created_at) >= cutoffDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[filterState.sortBy as keyof Review];
      let bValue: any = b[filterState.sortBy as keyof Review];

      if (filterState.sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (filterState.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReviews(filtered);
  };

  const handleFiltersChange = (newFilters: any) => {
    // Convert component filters back to internal state
    setFilterState({
      searchTerm: newFilters.searchTerm || '',
      ratingFilter: newFilters.ratingFilter || 'all',
      dateFilter: newFilters.dateFilter || 'all',
      sortBy: newFilters.sortBy || 'created_at',
      sortOrder: newFilters.sortOrder || 'desc'
    });
    setCurrentPage(1);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCreateReview = () => {
    setSelectedReview(null);
    setIsModalOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleViewReview = (review: Review) => {
    // You could implement a view-only modal or navigate to a detail page
    console.log('View review:', review);
  };

  const handleDeleteReview = async (id: string) => {
    try {
      setLoading(true);
      // Mock delete for now - replace with actual service call
      console.log('Delete review:', id);
      await loadReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (reviewData: Review) => {
    try {
      setModalLoading(true);
      
      // Mock CRUD operations for now - replace with actual service calls
      if (selectedReview) {
        console.log('Update review:', selectedReview.id, reviewData);
      } else {
        console.log('Create review:', reviewData);
      }
      
      setIsModalOpen(false);
      await loadReviews();
    } catch (error: any) {
      console.error('Error saving review:', error);
      setError('Failed to save review');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Reviews Management</h1>
              <p className="text-gray-400">Manage customer reviews and feedback</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadReviews}
              disabled={loading}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleCreateReview}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Review
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <ReviewsStatsComponent
          stats={stats}
          loading={loading}
        />

        {/* Filters */}
        <ReviewsFiltersComponent
          filters={filtersForComponent}
          onFiltersChange={handleFiltersChange}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
          resultCount={filteredReviews.length}
        />

        {/* Reviews Table */}
        <ReviewsTable
          reviews={filteredReviews}
          loading={loading}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          onView={handleViewReview}
        />

        {/* Pagination would go here if needed */}
        {totalPages > 1 && (
          <div className="bg-black border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        review={selectedReview}
        loading={modalLoading}
      />
    </div>
  );
};
