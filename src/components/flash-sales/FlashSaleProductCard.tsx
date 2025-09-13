import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Product } from '../../types';
import { calculateTimeRemaining, formatCurrency } from '../../utils/helpers';
import { IOSCard } from '../ios/IOSDesignSystemV2';
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
    <IOSCard
      variant="elevated"
      padding="none"
      hoverable
      className="relative flex flex-col overflow-hidden bg-gradient-to-br from-pink-700/40 via-pink-700/30 to-fuchsia-700/40 border border-pink-500/30 group"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image */}
      <div className="aspect-square w-full bg-[linear-gradient(45deg,#1e1e1e,#2a2a2a)] flex items-center justify-center border-b border-pink-500/20">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-[10px] text-pink-200 tracking-wider">NO IMAGE</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
  <h3 className="text-white font-semibold text-sm leading-snug uppercase tracking-wide line-clamp-2 group-hover:text-white/90">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded-lg border border-pink-300/30 bg-black/40 text-pink-100 text-xs font-medium shadow-inner">
            {formatCurrency(product.price)}
          </div>
          {discountPct > 0 && (
            <div className="px-2 py-1 rounded-lg bg-white text-pink-600 text-[11px] font-bold shadow-sm tracking-wide">
              {discountPct}%
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-[11px] text-pink-100/60 line-through">
              {formatCurrency(product.originalPrice)}
            </div>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="px-3 pb-4">
  <div className="w-full flex items-center justify-center gap-2 text-pink-600 bg-white rounded-lg py-2 text-[11px] font-semibold tracking-wide group-hover:bg-white/90">
          <Clock className="w-4 h-4" />
          {remaining ? (
            remaining.isExpired ? (
              <span>Berakhir</span>
            ) : (
              <span>
                {remaining.days > 0 && `${remaining.days} Hari `}
                {`${remaining.hours.toString().padStart(2,'0')}:${remaining.minutes.toString().padStart(2,'0')}:${remaining.seconds.toString().padStart(2,'0')}`} tersisa
              </span>
            )
          ) : (
            <span>Memuat...</span>
          )}
        </div>
      </div>
    </IOSCard>
  );
};

export default FlashSaleProductCard;