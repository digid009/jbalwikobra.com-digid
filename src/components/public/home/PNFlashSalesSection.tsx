import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PNSection, PNContainer, PNSectionHeader, PNCard, PNButton } from '../../ui/PinkNeonDesignSystem';
import { Product } from '../../../types';
import FlashSaleTimer from '../../FlashSaleTimer';

interface Props { products: Product[]; limit?: number }

const PNFlashSalesSection: React.FC<Props> = ({ products, limit = 8 }) => {
  if (!products || products.length === 0) return null;
  const list = products.slice(0, limit);
  return (
    <PNSection padding="md">
      <PNContainer>
        <PNSectionHeader
          title="Flash Sale"
          subtitle="Diskon hingga 70% - Terbatas!"
          action={
            <Link to="/flash-sales" className="text-sm text-pink-300 hover:text-pink-200 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          }
        />
        {/* Unified responsive container: horizontal grid on mobile, columns on md+ */}
        <PNContainer>
          <div className="grid gap-3 px-1 pb-2 auto-cols-[190px] grid-flow-col overflow-x-auto snap-x snap-mandatory scrollbar-hide md:auto-cols-auto md:grid-flow-row md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-x-visible md:px-0">
            {list.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="block snap-center md:snap-auto">
                <PNCard className="p-3 md:p-4 hover:bg-white/10 transition-colors h-full min-w-[190px] md:min-w-0">
                  <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30 mb-2 md:mb-3 overflow-hidden">
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="text-sm font-semibold text-white line-clamp-2 mb-2 md:mb-2 md:min-h-10">{p.name}</div>
                  <div className="flex items-end justify-between gap-3 mb-2">
                    <div className="flex flex-col leading-tight">
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-[11px] md:text-[12px] text-gray-400 line-through">Rp {p.originalPrice.toLocaleString('id-ID')}</div>
                      )}
                      <div className="text-pink-300 font-extrabold text-[15px] md:text-[16px]">Rp {p.price.toLocaleString('id-ID')}</div>
                    </div>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <div className="shrink-0 px-2 py-1 rounded-md bg-pink-600/20 border border-pink-500/40 text-pink-300 text-[11px] md:text-[12px] font-bold">
                        -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  {p.isFlashSale && p.flashSaleEndTime && (
                    <div className="mb-2 md:mb-3">
                      <FlashSaleTimer endTime={p.flashSaleEndTime} variant="card" />
                    </div>
                  )}
                  <PNButton variant="primary" size="sm" fullWidth>
                    Beli
                  </PNButton>
                </PNCard>
              </Link>
            ))}
          </div>
        </PNContainer>
      </PNContainer>
    </PNSection>
  );
};

export default React.memo(PNFlashSalesSection);
