import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PNSection, PNContainer, PNSectionHeader } from '../../ui/PinkNeonDesignSystem';
import { Product } from '../../../types';
import FlashSaleCard from '../../shared/FlashSaleCard';

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
              <FlashSaleCard
                key={p.id}
                product={p}
              />
            ))}
          </div>
        </PNContainer>
      </PNContainer>
    </PNSection>
  );
};

export default React.memo(PNFlashSalesSection);
