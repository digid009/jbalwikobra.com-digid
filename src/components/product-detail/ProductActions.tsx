/**
 * ProductActions - Purchase and interaction buttons
 * Features buy, rental, wishlist, and share functionality
 */

import React from 'react';
import { CreditCard, Calendar, Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { RentalOption } from '../../types';
import { PNButton, PNCard } from '../ui/PinkNeonDesignSystem';

interface ProductActionsProps {
  // Product data
  stock: number;
  
  // Rental
  cameFromFlashSaleCard: boolean;
  hasRental: boolean;
  selectedRental: RentalOption | null;
  
  // Event handlers
  onPurchase: () => void;
  onRental: (rental: RentalOption) => void;
}

export const ProductActions = React.memo(({
  stock,
  cameFromFlashSaleCard,
  hasRental,
  selectedRental,
  onPurchase,
  onRental
}: ProductActionsProps) => {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Purchase Button */}
        <PNButton
          variant={stock === 0 ? "secondary" : "primary"}
          size="lg"
          onClick={onPurchase}
          disabled={stock === 0}
          fullWidth
          className={`flex items-center justify-center space-x-2 ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CreditCard size={20} />
          <span>{stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}</span>
        </PNButton>

        {/* Rental Button - hidden if user came from flash sale card */}
        {!cameFromFlashSaleCard && hasRental && selectedRental && (
          <PNButton
            variant={stock === 0 ? "secondary" : "ghost"}
            size="lg"
            onClick={() => onRental(selectedRental)}
            disabled={stock === 0}
            fullWidth
            className={`flex items-center justify-center space-x-2 border-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/10 ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Calendar size={20} />
            <span>Rental {selectedRental.duration} - {formatCurrency(selectedRental.price)}</span>
          </PNButton>
        )}
      </div>

      {/* Trust Badges */}
      <PNCard className="mt-8 bg-black/50 border border-white/10 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Shield className="text-green-500" size={16} />
            <span>Garansi 100%</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <CheckCircle className="text-pink-400" size={16} />
            <span>Akun Terverifikasi</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Clock className="text-orange-500" size={16} />
            <span>Proses 24 Jam</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <MessageCircle className="text-green-500" size={16} />
            <span>Support 24/7</span>
          </div>
        </div>
      </PNCard>
    </div>
  );
});

ProductActions.displayName = 'ProductActions';
