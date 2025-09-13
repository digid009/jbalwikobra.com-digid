import React, { useState } from 'react';
import { Banner } from '../../../services/adminService';
import { IOSCard } from '../../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
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
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

      {/* Header */}
      <BannerHeader
        loading={loading}
        onRefresh={loadBanners}
        onCreateBanner={handleCreateBanner}
      />

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
        onPageChange={setCurrentPage}
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
  );
};
