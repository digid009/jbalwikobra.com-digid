/**
 * ProductActions - Purchase and interaction buttons
 * Features buy, rental, wishlist, and share functionality
 */

import React from 'react';
import { CreditCard, Calendar, Heart, Share2, Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { RentalOption } from '../../types';
import { IOSButton, IOSCard } from '../ios/IOSDesignSystemV2';

interface ProductActionsProps {
  // Product data
  stock: number;
  isInWishlist: boolean;
  
  // Rental
  cameFromFlashSaleCard: boolean;
  hasRental: boolean;
  selectedRental: RentalOption | null;
  
  // Event handlers
  onPurchase: () => void;
  onRental: (rental: RentalOption) => void;
  onWishlistToggle: () => void;
  onShare: () => void;
}

export const ProductActions = React.memo(({
  stock,
  isInWishlist,
  cameFromFlashSaleCard,
  hasRental,
  selectedRental,
  onPurchase,
  onRental,
  onWishlistToggle,
  onShare
}: ProductActionsProps) => {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Purchase Button */}
        <IOSButton
          variant={stock === 0 ? "secondary" : "primary"}
          size="lg"
          icon={CreditCard}
          onClick={onPurchase}
          disabled={stock === 0}
          className="w-full"
        >
          {stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
        </IOSButton>

        {/* Rental Button - hidden if user came from flash sale card */}
        {!cameFromFlashSaleCard && hasRental && selectedRental && (
          <IOSButton
            variant={stock === 0 ? "secondary" : "ghost"}
            size="lg"
            icon={Calendar}
            onClick={() => onRental(selectedRental)}
            disabled={stock === 0}
            className="w-full border-2 border-pink-600 text-pink-400 hover:bg-pink-600/10"
          >
            Rental {selectedRental.duration} - {formatCurrency(selectedRental.price)}
          </IOSButton>
        )}
      </div>

      {/* Additional Actions */}
      <div className="flex items-center space-x-4 text-white-secondary">
        <button 
          onClick={onWishlistToggle}
          className={`flex items-center space-x-1 transition-colors hover:scale-105 active:scale-95 ${
            isInWishlist 
              ? 'text-red-400 hover:text-red-300' 
              : 'hover:text-red-400'
          }`}
        >
          <Heart 
            size={16} 
            className={isInWishlist ? 'fill-current' : ''} 
          />
          <span>Favorit</span>
        </button>
        <button 
          onClick={onShare}
          className="flex items-center space-x-1 hover:text-pink-400 transition-colors hover:scale-105 active:scale-95"
        >
          <Share2 size={16} />
          <span>Bagikan</span>
        </button>
      </div>

      {/* Trust Badges */}
      <IOSCard variant="outlined" className="mt-8 bg-black/50 border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-white-secondary">
            <Shield className="text-green-500" size={16} />
            <span>Garansi 100%</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white-secondary">
            <CheckCircle className="text-pink-400" size={16} />
            <span>Akun Terverifikasi</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white-secondary">
            <Clock className="text-orange-500" size={16} />
            <span>Proses 24 Jam</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white-secondary">
            <MessageCircle className="text-green-500" size={16} />
            <span>Support 24/7</span>
          </div>
        </div>
      </IOSCard>
    </div>
  );
});

ProductActions.displayName = 'ProductActions';
