import React, { useState } from 'react';
import { Banner } from '../../../services/adminService';
import { 
  BannerHeader, 
  BannerSearch, 
  BannerTable, 
  BannerForm, 
  ImagePreviewModal,
  useBannerManagement,
  BannerFormData
} from './banners';

interface AdminBannersManagementProps {
  onRefresh?: () => void;
}

export const AdminBannersManagement: React.FC<AdminBannersManagementProps> = ({ onRefresh }) => {
  const {
    banners,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    handlePageChange,
    totalPages,
    submitting,
    loadBanners,
    toggleBannerStatus,
    deleteBanner,
    saveBanner
  } = useBannerManagement();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleCreateBanner = () => {
    setEditingBanner(null);
    setShowCreateModal(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setShowCreateModal(true);
  };

  const handleSubmitBanner = async (formData: BannerFormData) => {
    try {
      await saveBanner(formData, editingBanner);
      setShowCreateModal(false);
      onRefresh?.();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleToggleStatus = async (bannerId: string, currentStatus: boolean) => {
    await toggleBannerStatus(bannerId, currentStatus);
    onRefresh?.();
  };

  const handleDeleteBanner = async (bannerId: string) => {
    await deleteBanner(bannerId);
    onRefresh?.();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Diagnostics banner removed as part of DS migration */}

      {/* Header */}
      <BannerHeader
        loading={loading}
        onRefresh={loadBanners}
        onCreateBanner={handleCreateBanner}
      />

        {/* Error Banner */}
        {error && (
          <div className="group relative overflow-hidden bg-black border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

      {/* Search */}
      <BannerSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Banners Table */}
      <BannerTable
        banners={banners}
        loading={loading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onToggleStatus={handleToggleStatus}
        onDeleteBanner={handleDeleteBanner}
        onEditBanner={handleEditBanner}
        onImagePreview={setSelectedImage}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* Create/Edit Banner Modal */}
      <BannerForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        editingBanner={editingBanner}
        onSubmit={handleSubmitBanner}
        submitting={submitting}
      />
      </div>
    </div>
  );
};
