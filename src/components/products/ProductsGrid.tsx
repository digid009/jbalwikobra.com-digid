/**
 * ProductsGrid - Product grid display component
 * Features responsive grid layout with empty state
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { PNProductCard } from '../catalog';
import { PNButton } from '../ui/PinkNeonDesignSystem';
import { formatCurrency } from '../../utils/helpers';
import { IOSContainer, IOSGrid } from '../ios/IOSDesignSystemV2';
import { PNContainer } from '../ui/PinkNeonDesignSystem';
import { EmptyState } from './EmptyState';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductsGridProps {
  products: Product[];
  onResetFilters: () => void;
  density?: 'comfortable' | 'compact';
  loading?: boolean;
  skeletonCount?: number;
}

export const ProductsGrid = React.memo(({ products, onResetFilters, density = 'comfortable', loading = false, skeletonCount = 8 }: ProductsGridProps) => {
  const navigate = useNavigate();
  const gap = density === 'compact' ? 'sm' : 'md';
  return (
    <section className="mb-8">
      <PNContainer>
        {loading ? (
          <IOSGrid cols={4} gap={gap} className="mb-6">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductCardSkeleton key={i} density={density} />
            ))}
          </IOSGrid>
        ) : products.length > 0 ? (
          <IOSGrid cols={4} gap={gap} className="mb-6">
            {products.map(product => {
              const basePrice = product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price;
              const price = formatCurrency(basePrice);
              const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
              const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
              const discountPercent = hasDiscount && product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;
              const gameTitle = product.gameTitleData?.name;
              const tierSlug = product.tierData?.slug;
              const tierName = product.tierData?.name;
              const isRental = Boolean(product.hasRental || product.rentalOptions?.length);

      const tierClass = (() => {
                switch (tierSlug) {
                  case 'pelajar':
        return 'bg-blue-500/25 text-blue-100 border-blue-400/70';
                  case 'reguler':
        return 'bg-zinc-500/25 text-zinc-100 border-zinc-400/70';
                  case 'premium':
        return 'bg-amber-500/25 text-amber-100 border-amber-400/70';
                  default:
        return 'bg-white/15 text-white/90 border-white/25';
                }
              })();

  const imageFrameClassName = (() => {
                switch (tierSlug) {
                  case 'pelajar':
        return 'bg-gradient-to-br from-blue-600/80 via-blue-600/50 to-cyan-600/80 border border-blue-400/60 shadow-inner shadow-blue-500/20';
                  case 'reguler':
        return 'bg-gradient-to-br from-zinc-600/80 via-zinc-600/50 to-gray-600/80 border border-zinc-400/60 shadow-inner shadow-black/20';
                  case 'premium':
        return 'bg-gradient-to-br from-amber-600/80 via-amber-500/50 to-yellow-600/80 border border-amber-400/60 shadow-inner shadow-amber-500/20';
                  default:
        return 'bg-gradient-to-br from-slate-700/80 via-slate-700/50 to-gray-700/80 border border-slate-500/50 shadow-inner shadow-black/20';
                }
              })();

      const wrapperClassName = (() => {
                switch (tierSlug) {
                  case 'pelajar':
        return 'bg-blue-600/20 border-blue-400/50 hover:bg-blue-600/25 hover:ring-2 ring-blue-400/30';
                  case 'reguler':
        return 'bg-zinc-700/20 border-zinc-400/50 hover:bg-zinc-700/25 hover:ring-2 ring-zinc-400/30';
                  case 'premium':
        return 'bg-amber-600/20 border-amber-400/50 hover:bg-amber-600/25 hover:ring-2 ring-amber-400/30';
                  default:
        return 'bg-white/10 border-white/20 hover:bg-white/15 hover:ring-2 ring-white/20';
                }
              })();

      const tierAccentClassName = (() => {
                switch (tierSlug) {
                  case 'pelajar':
        return 'bg-blue-400';
                  case 'reguler':
        return 'bg-zinc-300';
                  case 'premium':
        return 'bg-amber-400';
                  default:
        return 'bg-white/70';
                }
              })();

              return (
                <PNProductCard
                  key={product.id}
                  id={String(product.id)}
                  title={product.name}
                  image={mainImage}
                  price={price}
                  density={density}
                  onClick={() => navigate(`/products/${product.id}`, { state: { fromCatalogPage: true } })}
                  rentalAvailable={isRental}
          imageFrameClassName={imageFrameClassName}
                  className={wrapperClassName}
          rentalBadgeClassName={'bg-black/80 text-white border border-white/15'}
          tierAccentClassName={tierAccentClassName}
                >
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    {gameTitle && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9px] font-medium border ${tierClass}`}>
                        {gameTitle}
                      </span>
                    )}
                    {(tierSlug || tierName) && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9px] font-medium border ${tierClass}`}>
                        {tierName || tierSlug?.toUpperCase() || 'REGULER'}
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <div className="mt-2 flex items-center gap-2">
                      {discountPercent !== null && (
                        <span className="px-2 py-1 rounded-lg bg-white text-red-600 text-[10px] font-bold shadow-sm">-{discountPercent}%</span>
                      )}
                      <span className="text-[11px] text-white/60 line-through">
                        {formatCurrency(product.originalPrice as number)}
                      </span>
                    </div>
                  )}
                  
                  <PNButton 
                    variant="primary" 
                    size="sm" 
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`, { state: { fromCatalogPage: true } });
                    }}
                    className="mt-3"
                  >
                    Beli Sekarang
                  </PNButton>
                </PNProductCard>
              );
            })}
          </IOSGrid>
        ) : (
      <EmptyState onReset={onResetFilters} />
        )}
    </PNContainer>
    </section>
  );
});

ProductsGrid.displayName = 'ProductsGrid';
