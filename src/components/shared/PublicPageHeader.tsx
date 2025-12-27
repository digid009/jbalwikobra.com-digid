/**
 * PublicPageHeader - Consistent header component for all public pages
 * Based on FlashSaleProductDetailPage header design
 * 
 * Features:
 * - Back navigation button
 * - Wishlist and share actions
 * - Consistent PN styling
 * - Responsive design
 */

import React from 'react';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { PNButton } from '../ui/PinkNeonDesignSystem';

interface PublicPageHeaderProps {
  /** Back button label */
  backLabel: string;
  /** Back button click handler */
  onBack: () => void;
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Wishlist click handler */
  onWishlistToggle?: () => void;
  /** Is item in wishlist */
  isInWishlist?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Share click handler */
  onShare?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({
  backLabel,
  onBack,
  showWishlist = false,
  onWishlistToggle,
  isInWishlist = false,
  showShare = false,
  onShare,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <PNButton
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </PNButton>
      </div>
      
      {/* Action Buttons */}
      {(showWishlist || showShare) && (
        <div className="flex items-center gap-3">
          {showWishlist && onWishlistToggle && (
            <PNButton
              variant="ghost"
              size="sm"
              onClick={onWishlistToggle}
              className={`p-2 ${isInWishlist ? 'text-pink-400 border-pink-400' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </PNButton>
          )}
          {showShare && onShare && (
            <PNButton
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </PNButton>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicPageHeader;
