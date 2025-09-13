import React from 'react';
import { RefreshCw, Image, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { IOSCard, IOSButton, IOSPagination } from '../../../../components/ios/IOSDesignSystem';
import { BannerTableProps } from './types';

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  onToggleStatus,
  onDeleteBanner,
  onEditBanner,
  onImagePreview
}) => {
  if (loading) {
    return (
      <IOSCard variant="elevated" padding="none">
        <div className="p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white/60" />
          <p className="text-white/60 font-medium">Loading banners...</p>
        </div>
      </IOSCard>
    );
  }

  if (banners.length === 0) {
    return (
      <IOSCard variant="elevated" padding="none">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ios-background flex items-center justify-center">
            <Image className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/60 font-medium mb-1">No banners found</p>
          <p className="text-white/40 text-sm">Try adjusting your search or add your first banner</p>
        </div>
      </IOSCard>
    );
  }

  return (
    <IOSCard variant="elevated" padding="none">
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
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-ios-background/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">
                      {banner.title}
                    </div>
                    <div className="text-sm text-white/70">
                      {banner.subtitle}
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
                      onClick={() => onImagePreview(banner.image_url)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <IOSButton
                      variant="ghost"
                      size="small"
                      onClick={() => onImagePreview(banner.image_url)}
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
                      onClick={() => onToggleStatus(banner.id, banner.is_active)}
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
                    <IOSButton 
                      variant="ghost" 
                      size="small" 
                      className="p-2"
                      onClick={() => onEditBanner(banner)}
                    >
                      <Edit className="w-4 h-4 text-white/70" />
                    </IOSButton>
                    <IOSButton 
                      variant="ghost" 
                      size="small" 
                      className="p-2"
                      onClick={() => onDeleteBanner(banner.id)}
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
            totalItems={banners.length}
            itemsPerPage={10}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </IOSCard>
  );
};
