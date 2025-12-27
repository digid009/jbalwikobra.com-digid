/**
 * PriceDisplay - Price breakdown and payment summary component
 * Shows detailed pricing information for purchase or rental
 */

import React from 'react';
import { Calculator, Tag, Clock, CreditCard } from 'lucide-react';
import { PNText, PNCard, PNHeading } from '../ui/PinkNeonDesignSystem';
import { formatCurrency } from '../../utils/helpers';
import { RentalOption } from '../../types';

interface PriceDisplayProps {
  checkoutType: 'purchase' | 'rental';
  effectivePrice: number;
  originalPrice?: number;
  selectedRental: RentalOption | null;
  discount?: {
    amount: number;
    percentage: number;
    type: 'flash_sale' | 'promo';
  };
}

export const PriceDisplay = React.memo(({
  checkoutType,
  effectivePrice,
  originalPrice,
  selectedRental,
  discount
}: PriceDisplayProps) => {
  const isPurchase = checkoutType === 'purchase';
  const finalPrice = isPurchase ? effectivePrice : selectedRental?.price || 0;
  const hasDiscount = discount && discount.amount > 0;

  return (
    <PNCard className="space-y-4 p-5">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="text-pink-400" size={20} />
        <PNHeading level={3} className="!mb-0">Ringkasan Pembayaran</PNHeading>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        {isPurchase ? (
          <>
            {/* Purchase Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="text-gray-400" size={16} />
                <PNText className="text-gray-300">Harga Akun</PNText>
              </div>
              <PNText className={hasDiscount ? "line-through text-gray-500" : "text-white"}>
                {formatCurrency(originalPrice || effectivePrice)}
              </PNText>
            </div>

            {/* Discount */}
            {hasDiscount && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="text-green-400" size={16} />
                  <PNText className="text-green-400">
                    {discount.type === 'flash_sale' ? 'Diskon Flash Sale' : 'Diskon Promo'} ({discount.percentage}%)
                  </PNText>
                </div>
                <PNText className="text-green-400">
                  -{formatCurrency(discount.amount)}
                </PNText>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Rental Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="text-green-400" size={16} />
                <PNText className="text-gray-300">
                  Rental {selectedRental?.duration}
                </PNText>
              </div>
              <PNText className="text-white">
                {formatCurrency(selectedRental?.price || 0)}
              </PNText>
            </div>

            {/* Rental Benefits */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <PNText className="text-sm text-green-300">
                ✓ Akses penuh selama {selectedRental?.duration}
              </PNText>
              <PNText className="text-sm text-green-300">
                ✓ Support 24/7 via WhatsApp
              </PNText>
              <PNText className="text-sm text-green-300">
                ✓ Garansi keamanan akun
              </PNText>
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-white/20 my-4"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <PNText className="text-lg font-semibold">Total Pembayaran</PNText>
          <div className="text-right">
            <PNText className={`text-2xl font-bold ${
              isPurchase ? 'text-pink-400' : 'text-green-400'
            }`}>
              {formatCurrency(finalPrice)}
            </PNText>
            {hasDiscount && (
              <PNText className="text-sm text-green-400">
                Hemat {formatCurrency(discount.amount)}!
              </PNText>
            )}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <PNText className="text-sm text-blue-300">
          💳 Pembayaran aman dengan gateway Xendit
        </PNText>
        <PNText className="text-sm text-blue-300">
          💰 Mendukung semua metode pembayaran populer
        </PNText>
      </div>
    </PNCard>
  );
});

PriceDisplay.displayName = 'PriceDisplay';
