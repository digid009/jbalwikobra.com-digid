// Example: How to use the refactored banner components individually

import React from 'react';
import { 
  BannerHeader, 
  BannerSearch, 
  BannerTable, 
  BannerForm,
  useBannerManagement 
} from './index';

// Example: Using components individually for a custom layout
export const CustomBannerManagement = () => {
  const {
    banners,
    loading,
    searchTerm,
    setSearchTerm,
    loadBanners,
    // ... other hook values
  } = useBannerManagement();

  return (
    <div className="custom-layout">
      {/* Custom header with additional buttons */}
      <div className="flex justify-between items-center">
        <BannerHeader 
          loading={loading}
          onRefresh={loadBanners}
          onCreateBanner={() => console.log('Create banner')}
        />
        <div className="additional-controls">
          {/* Custom buttons or controls */}
        </div>
      </div>

      {/* Search in sidebar */}
      <div className="sidebar">
        <BannerSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Main content */}
      <div className="main-content">
        <BannerTable
          banners={banners}
          loading={loading}
          totalPages={1}
          currentPage={1}
          onPageChange={() => {}}
          onToggleStatus={() => {}}
          onDeleteBanner={() => {}}
          onEditBanner={() => {}}
          onImagePreview={() => {}}
        />
      </div>
    </div>
  );
};

// Example: Using the custom hook for banner statistics
export const BannerStats = () => {
  const { banners, loading } = useBannerManagement();
  
  if (loading) return <div>Loading stats...</div>;
  
  const activeBanners = banners.filter(b => b.is_active).length;
  const totalBanners = banners.length;
  
  return (
    <div className="stats-widget">
      <h3>Banner Statistics</h3>
      <p>Active: {activeBanners}</p>
      <p>Total: {totalBanners}</p>
      <p>Inactive: {totalBanners - activeBanners}</p>
    </div>
  );
};
