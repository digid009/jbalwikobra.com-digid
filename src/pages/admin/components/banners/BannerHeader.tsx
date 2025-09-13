import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { IOSButton, IOSSectionHeader } from '../../../../components/ios/IOSDesignSystem';
import { BannerHeaderProps } from './types';

export const BannerHeader: React.FC<BannerHeaderProps> = ({ 
  loading, 
  onRefresh, 
  onCreateBanner 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <IOSSectionHeader
        title="Banner Management"
        subtitle="Manage homepage banners and promotional content"
      />
      <div className="flex items-center space-x-3">
        <IOSButton 
          variant="ghost" 
          onClick={onRefresh}
          className="flex items-center space-x-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </IOSButton>
        <IOSButton 
          variant="primary" 
          className="flex items-center space-x-2"
          onClick={onCreateBanner}
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </IOSButton>
      </div>
    </div>
  );
};
