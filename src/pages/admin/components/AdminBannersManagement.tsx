import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Image, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import { adminService, Banner } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSPagination } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

interface AdminBannersManagementProps {
  onRefresh?: () => void;
}

export const AdminBannersManagement: React.FC<AdminBannersManagementProps> = ({ onRefresh }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadBanners();
  }, [currentPage, searchTerm]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getBanners();
      setBanners(result.data || []);
      setTotalPages(Math.ceil((result.data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading banners:', error);
      setError(error instanceof Error ? error.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      // Note: updateBanner method needs to be implemented in adminService
      // For now, we'll just refresh the data
      await loadBanners();
      onRefresh?.();
    } catch (error) {
      console.error('Error updating banner status:', error);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      // Note: deleteBanner method needs to be implemented in adminService
      // For now, we'll just refresh the data
      await loadBanners();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Banner Management"
          subtitle="Manage homepage banners and promotional content"
        />
        <div className="flex items-center space-x-3">
          <IOSButton 
            variant="ghost" 
            onClick={loadBanners}
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton 
            variant="primary" 
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </IOSButton>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <IOSCard variant="elevated" padding="medium" className="border-ios-error/20 bg-ios-error/5">
          <div className="flex items-center space-x-3 text-ios-error">
            <div className="w-2 h-2 rounded-full bg-ios-error"></div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </IOSCard>
      )}

      {/* Search */}
      <IOSCard variant="elevated" padding="medium">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search banners by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-ios-background border border-gray-700 rounded-xl 
                       focus:ring-2 focus:ring-ios-primary focus:border-pink-500 
                       transition-colors duration-200 text-white placeholder-ios-text/60"
          />
        </div>
      </IOSCard>

      {/* Banners Table */}
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white/60" />
            <p className="text-white/60 font-medium">Loading banners...</p>
          </div>
        ) : paginatedBanners.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ios-background/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ios-border/30">
                  {paginatedBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-ios-background/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-white">
                            {banner.title}
                          </div>
                          <div className="text-sm text-white/70">
                            {banner.description}
                          </div>
                          {banner.link_url && (
                            <div className="text-xs text-ios-primary truncate max-w-xs">
                              {banner.link_url}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-16 h-10 rounded-2xl object-cover cursor-pointer hover:opacity-80 
                                       transition-all duration-200 border border-gray-700/30
                                       hover:border-ios-primary/50"
                            onClick={() => setSelectedImage(banner.image_url)}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <IOSButton
                            variant="ghost"
                            size="small"
                            onClick={() => setSelectedImage(banner.image_url)}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </IOSButton>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                         bg-ios-primary/10 text-ios-primary border border-ios-primary/20">
                          #{banner.sort_order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                            className="p-1 rounded-full hover:bg-ios-background/50 transition-colors"
                          >
                            {banner.is_active ? (
                              <ToggleRight className="w-5 h-5 text-ios-success" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-white/40" />
                            )}
                          </button>
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            banner.is_active 
                              ? 'bg-ios-success/10 text-ios-success border-ios-success/30' 
                              : 'bg-ios-error/10 text-ios-error border-ios-error/30'
                          }`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white/70">
                          {new Date(banner.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <IOSButton variant="ghost" size="small" className="p-2">
                            <Eye className="w-4 h-4 text-white/70" />
                          </IOSButton>
                          <IOSButton variant="ghost" size="small" className="p-2">
                            <Edit className="w-4 h-4 text-white/70" />
                          </IOSButton>
                          <IOSButton 
                            variant="ghost" 
                            size="small" 
                            className="p-2"
                            onClick={() => handleDeleteBanner(banner.id)}
                          >
                            <Trash2 className="w-4 h-4 text-ios-error hover:text-ios-error/80" />
                          </IOSButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700/30 bg-ios-background/50">
                <IOSPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredBanners.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ios-background flex items-center justify-center">
              <Image className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 font-medium mb-1">No banners found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or add your first banner</p>
          </div>
        )}
      </IOSCard>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/60 hover:bg-black/80 
                         text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={() => setSelectedImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
