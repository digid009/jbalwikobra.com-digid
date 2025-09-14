/**
 * ProductInfo - Product details and pricing information
 * Displays name, price, tier, game title, and flash sale timer
 */

import React from 'react';
import { Clock, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { Product } from '../../types';
import { IOSCard } from '../ios/IOSDesignSystemV2';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface ProductInfoProps {
  product: Product;
  effectivePrice: number;
  isFlashSaleActive: boolean;
  timeRemaining?: TimeRemaining | null;
}

export const ProductInfo = React.memo(({
  product,
  effectivePrice,
  isFlashSaleActive,
  timeRemaining
}: ProductInfoProps) => {
  return (
    <div className="mt-6">
      {/* Tags: Game Title and Tier */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Game Title - with fallback */}
        <span className="bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-sm font-medium border border-pink-500/30">
          {product.gameTitleData?.name || 'GAME'}
        </span>

        {/* Tier - always show */}
        <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium border border-gray-700">
          {product.tierData?.name || (
            product.tierData?.name || 'Reguler'
          )}
        </span>
      </div>

      {/* Product Name */}
      <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

      {/* Price */}
      <div className="mb-6">
        {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-pink-400">
                {formatCurrency(product.price)}
              </span>
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-sm font-medium whitespace-nowrap leading-none">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </div>
            <span className="text-lg text-white-secondary line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-white">
            {formatCurrency(effectivePrice)}
          </span>
        )}
      </div>

      {/* Flash Sale Timer */}
      {isFlashSaleActive && timeRemaining && (
        <IOSCard variant="outlined" className="mb-6 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center space-x-2 text-red-300 font-semibold mb-2">
            <Clock size={20} />
            <span>Flash Sale berakhir dalam:</span>
          </div>
          <div className="flex space-x-3">
            <div className="text-center">
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
                {timeRemaining.days.toString().padStart(2, '0')}
              </div>
              <span className="text-xs text-red-300 mt-1 block">Hari</span>
            </div>
            <div className="text-center">
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
                {timeRemaining.hours.toString().padStart(2, '0')}
              </div>
              <span className="text-xs text-red-300 mt-1 block">Jam</span>
            </div>
            <div className="text-center">
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
                {timeRemaining.minutes.toString().padStart(2, '0')}
              </div>
              <span className="text-xs text-red-300 mt-1 block">Menit</span>
            </div>
            <div className="text-center">
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
                {timeRemaining.seconds.toString().padStart(2, '0')}
              </div>
              <span className="text-xs text-red-300 mt-1 block">Detik</span>
            </div>
          </div>
        </IOSCard>
      )}

      {/* Account Details */}
      {product.accountLevel && (
        <IOSCard variant="outlined" className="mb-6 bg-black border-gray-700">
          <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
            <Star className="text-yellow-400" size={16} />
            <span>Detail Akun</span>
          </h3>
          <p className="text-white-secondary">
            <strong>Level:</strong> {product.accountLevel}
          </p>
          {product.accountDetails && (
            <p className="text-white-secondary mt-1">{product.accountDetails}</p>
          )}
        </IOSCard>
      )}
    </div>
  );
});

ProductInfo.displayName = 'ProductInfo';
