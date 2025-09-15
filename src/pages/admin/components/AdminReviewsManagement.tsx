import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, ThumbsUp, ThumbsDown, AlertCircle, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { adminService, Review } from '../../../services/adminService';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../utils/cn';
import { getUserAvatarUrl, getUserDisplayName } from '../../../utils/avatarUtils';
import { scrollToPaginationContent } from '../../../utils/scrollUtils';
import { 
  AdminPageHeaderV2, 
  AdminStatCard, 
  AdminDataTable, 
  AdminFilters, 
  StatusBadge 
} from './ui';
import type { 
  TableColumn, 
  TableAction, 
  AdminFiltersConfig 
} from './ui';

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
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    rating: 'all',
    date: 'all'
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Statistics calculation
  const stats = {
    total: reviews.length,
    highRated: reviews.filter(review => review.rating >= 4).length,
    lowRated: reviews.filter(review => review.rating <= 2).length,
    recent: reviews.filter(review => {
      const reviewDate = new Date(review.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate > weekAgo;
    }).length
  };

  // Filter configuration
  const filtersConfig: AdminFiltersConfig = {
    searchPlaceholder: 'Search reviews...',
    filters: [
      {
        key: 'rating',
        label: 'Rating',
        options: [
          { value: 'all', label: 'All Ratings' },
          { value: '5', label: '5 Stars' },
          { value: '4', label: '4 Stars' },
          { value: '3', label: '3 Stars' },
          { value: '2', label: '2 Stars' },
          { value: '1', label: '1 Star' }
        ]
      },
      {
        key: 'date',
        label: 'Period',
        options: [
          { value: 'all', label: 'All Time' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'quarter', label: 'This Quarter' }
        ]
      }
    ],
    sortOptions: [
      { value: 'created_at', label: 'Date Created' },
      { value: 'rating', label: 'Rating' },
      { value: 'user_id', label: 'Customer' }
    ]
  };

  // Table columns configuration
  const columns: TableColumn<Review>[] = [
    {
      key: 'user',
      label: 'Customer',
      render: (review) => {
        const uid = (review as any)?.user_id || '';
        const avatar = uid ? getUserAvatarUrl(uid) : undefined;
        const name = uid ? getUserDisplayName(uid) : 'Unknown User';
        return (
          <div className="flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="User" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-xs text-gray-300">?
              </div>
            )}
            <span className="font-medium">{name}</span>
          </div>
        );
      }
    },
    {
      key: 'product',
      label: 'Product',
      render: (review) => (
        <span className="font-medium">{review.product?.name || 'Unknown Product'}</span>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (review) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "w-4 h-4",
                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
            />
          ))}
          <span className="ml-1 text-sm text-gray-600">({review.rating})</span>
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Review',
      render: (review) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 truncate">{review.comment}</p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (review) => (
        <span className="text-sm text-gray-600">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions
  const actions: TableAction<Review>[] = [
    {
      label: 'View',
      icon: <Eye size={16} />,
      onClick: (review) => console.log('View review:', review.id)
    },
    {
      label: 'Edit',
      icon: <Edit size={16} />,
      onClick: (review) => console.log('Edit review:', review.id)
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: (review) => console.log('Delete review:', review.id),
      variant: 'danger'
    }
  ];

  useEffect(() => {
    loadReviews();
  }, [currentPage, filters.search, filters.rating, filters.date]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasErrors(false);
      setErrorMessage('');
      const result = await adminService.getReviews(currentPage, itemsPerPage);
      setReviews(result.data);
      setTotalCount(result.count || 0);
      setTableExists(true);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      if (error.code === 'PGRST116') {
        setTableExists(false);
        setHasErrors(true);
        setErrorMessage('Reviews table does not exist. Click "Setup Reviews" to create it.');
      } else {
        setError('Failed to load reviews');
        setHasErrors(true);
        setErrorMessage(`Error loading reviews: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupReviewsTable = async () => {
    try {
      setLoading(true);
      // Setup functionality would go here
      await loadReviews();
    } catch (error: any) {
      console.error('Error setting up reviews table:', error);
      setError('Failed to setup reviews table');
      setHasErrors(true);
      setErrorMessage(`Error setting up table: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToPaginationContent();
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <RLSDiagnosticsBanner 
        hasErrors={hasErrors}
        errorMessage={errorMessage}
        statsLoaded={!loading}
      />

      <AdminPageHeaderV2
        title="Reviews Management"
        subtitle="Manage customer reviews and feedback"
        icon={Star}
        actions={[
          {
            key: 'refresh',
            label: 'Refresh',
            onClick: loadReviews,
            variant: 'secondary',
            icon: RefreshCw,
            loading: loading
          }
        ]}
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Total Reviews"
            value={stats.total}
            icon={Star}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <AdminStatCard
            title="High Rated (4-5★)"
            value={stats.highRated}
            icon={ThumbsUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <AdminStatCard
            title="Low Rated (1-2★)"
            value={stats.lowRated}
            icon={ThumbsDown}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <AdminStatCard
            title="Recent (This Week)"
            value={stats.recent}
            icon={AlertCircle}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Filters */}
        <AdminFilters
          config={filtersConfig}
          values={filters}
          onFiltersChange={handleFiltersChange}
          totalItems={totalCount}
          filteredItems={reviews.length}
          loading={loading}
          defaultCollapsed={true}
        />

        {/* Data Table */}
        <AdminDataTable
          data={reviews}
          columns={columns}
          actions={actions}
          loading={loading}
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
