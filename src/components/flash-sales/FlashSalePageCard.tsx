/**
 * FlashSalePageCard - Flash sale product card with homepage styling
 * Matches the exact styling from PNFlashSalesSection.tsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PNCard, PNButton } from '../ui/PinkNeonDesignSystem';
import { Product, FlashSale } from '../../types';
import FlashSaleTimer from '../FlashSaleTimer';

interface FlashSalePageCardProps {
  product: Product;
  flashSale?: FlashSale;
}

const FlashSalePageCard: React.FC<FlashSalePageCardProps> = ({ product, flashSale }) => {
  return (
    <Link to={`/products/${product.id}`} className="block">
      <PNCard className="p-3 md:p-4 hover:bg-white/10 transition-colors h-full min-w-[190px] md:min-w-0">
        <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30 mb-2 md:mb-3 overflow-hidden">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          )}
        </div>
        
        <div className="text-sm font-semibold text-white line-clamp-2 mb-2 md:mb-2 md:min-h-10">
          {product.name}
        </div>
        
        <div className="flex items-end justify-between gap-3 mb-2">
          <div className="flex flex-col leading-tight">
            {flashSale && flashSale.originalPrice && flashSale.originalPrice > flashSale.salePrice && (
              <div className="text-[11px] md:text-[12px] text-gray-400 line-through">
                Rp {flashSale.originalPrice.toLocaleString('id-ID')}
              </div>
            )}
            <div className="text-pink-300 font-extrabold text-[15px] md:text-[16px]">
              Rp {(flashSale?.salePrice || product.price).toLocaleString('id-ID')}
            </div>
          </div>
          {flashSale && flashSale.originalPrice && flashSale.originalPrice > flashSale.salePrice && (
            <div className="shrink-0 px-2 py-1 rounded-md bg-pink-600/20 border border-pink-500/40 text-pink-300 text-[11px] md:text-[12px] font-bold">
              -{Math.round(((flashSale.originalPrice - flashSale.salePrice) / flashSale.originalPrice) * 100)}%
            </div>
          )}
        </div>
        
        {flashSale && flashSale.endTime && (
          <div className="mb-2 md:mb-3">
            <FlashSaleTimer endTime={flashSale.endTime} variant="card" />
          </div>
        )}
        
        <PNButton variant="primary" size="sm" fullWidth>
          Beli
        </PNButton>
      </PNCard>
    </Link>
  );
};

export default React.memo(FlashSalePageCard);
