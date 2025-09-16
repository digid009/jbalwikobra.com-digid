import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Product } from '../../types';
import { calculateTimeRemaining, formatCurrency } from '../../utils/helpers';
import { PNCard, PNButton } from '../ui/PinkNeonDesignSystem';
import { useNavigate } from 'react-router-dom';

interface FlashSaleProductCardProps {
  product: Product;
}

interface Remaining {
  days: number; hours: number; minutes: number; seconds: number; isExpired: boolean;
}

export const FlashSaleProductCard: React.FC<FlashSaleProductCardProps> = ({ product }) => {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!product.flashSaleEndTime) return;
    const update = () => setRemaining(calculateTimeRemaining(product.flashSaleEndTime!));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [product.flashSaleEndTime]);

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <PNCard className="p-3 md:p-4 hover:bg-white/10 transition-colors h-full min-w-[190px] md:min-w-0">
      {/* Image with homepage styling - exactly matching PNFlashSalesSection */}
      <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30 mb-2 md:mb-3 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 tracking-wider">NO IMAGE</div>
        )}
      </div>

      {/* Content with homepage styling - exactly matching PNFlashSalesSection */}
      <div className="text-sm font-semibold text-white line-clamp-2 mb-2 md:mb-2 md:min-h-10">{product.name}</div>
      
      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="flex flex-col leading-tight">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-[11px] md:text-[12px] text-gray-400 line-through">{formatCurrency(product.originalPrice)}</div>
          )}
          <div className="text-pink-300 font-extrabold text-[15px] md:text-[16px]">{formatCurrency(product.price)}</div>
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="shrink-0 px-2 py-1 rounded-md bg-pink-600/20 border border-pink-500/40 text-pink-300 text-[11px] md:text-[12px] font-bold">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Timer with homepage styling - exactly matching PNFlashSalesSection */}
      {product.isFlashSale && product.flashSaleEndTime && (
        <div className="mb-2 md:mb-3">
          <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-black/60 border border-pink-500/30 text-pink-300 text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5" />
            {remaining ? (
              remaining.isExpired ? (
                <span>Berakhir</span>
              ) : (
                <span>
                  {remaining.days > 0 && `${remaining.days}h `}
                  {`${remaining.hours.toString().padStart(2,'0')}:${remaining.minutes.toString().padStart(2,'0')}:${remaining.seconds.toString().padStart(2,'0')}`}
                </span>
              )
            ) : (
              <span>Memuat...</span>
            )}
          </div>
        </div>
      )}
      
      {/* CTA Button with homepage styling - exactly matching PNFlashSalesSection */}
      <PNButton 
        variant="primary" 
        size="sm" 
        fullWidth
        onClick={() => navigate(`/flash-sales/${product.id}`, { 
          state: { 
            fromFlashSaleCard: true,
            flashSaleData: {
              id: product.id,
              productId: product.id,
              originalPrice: product.originalPrice,
              salePrice: product.price,
              endTime: product.flashSaleEndTime,
              isActive: product.isFlashSale && remaining && !remaining.isExpired,
              discountPercentage: discountPct
            }
          } 
        })}
      >
        Beli
      </PNButton>
    </PNCard>
  );
};

export default FlashSaleProductCard;