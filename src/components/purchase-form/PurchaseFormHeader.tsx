/**
 * PurchaseFormHeader - Header component for purchase/rental forms
 * Displays transaction type, product info, and pricing
 */

import React from 'react';
import { X, ShoppingCart, Calendar, Crown } from 'lucide-react';
import { PNHeading, PNText, PNButton } from '../ui/PinkNeonDesignSystem';
import { formatCurrency } from '../../utils/helpers';
import { RentalOption } from '../../types';

interface PurchaseFormHeaderProps {
  checkoutType: 'purchase' | 'rental';
  productName: string;
  effectivePrice: number;
  selectedRental: RentalOption | null;
  onClose: () => void;
}

export const PurchaseFormHeader = React.memo(({
  checkoutType,
  productName,
  effectivePrice,
  selectedRental,
  onClose
}: PurchaseFormHeaderProps) => {
  const isPurchase = checkoutType === 'purchase';
  const price = isPurchase ? effectivePrice : selectedRental?.price || 0;
  const duration = selectedRental?.duration;

  return (
    <div className="relative">
      {/* Close Button */}
      <PNButton
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-400 hover:text-white z-10"
      >
        <X size={20} />
      </PNButton>

      {/* Header Content */}
      <div className="space-y-4">
        {/* Transaction Type Badge */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isPurchase 
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30' 
              : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
          }`}>
            {isPurchase ? (
              <ShoppingCart className="text-pink-400" size={20} />
            ) : (
              <Calendar className="text-green-400" size={20} />
            )}
          </div>
          <div>
            <PNHeading level={3} className="mb-1">
              {isPurchase ? 'Pembelian Akun' : 'Rental Akun'}
            </PNHeading>
            <PNText className="text-sm text-gray-400">
              {isPurchase ? 'Akses permanen ke akun' : `Akses sementara ${duration}`}
            </PNText>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="text-yellow-400" size={16} />
                <PNText className="font-medium">{productName}</PNText>
              </div>
              <PNText className="text-sm text-gray-400">
                {isPurchase ? 'Kepemilikan penuh akun game' : `Akses rental untuk ${duration}`}
              </PNText>
            </div>
            <div className="text-right">
              <PNText className={`text-2xl font-bold ${
                isPurchase ? 'text-pink-400' : 'text-green-400'
              }`}>
                {formatCurrency(price)}
              </PNText>
              {!isPurchase && (
                <PNText className="text-sm text-gray-400">
                  /{duration}
                </PNText>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PurchaseFormHeader.displayName = 'PurchaseFormHeader';
