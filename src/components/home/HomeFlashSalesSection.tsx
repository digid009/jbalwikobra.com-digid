import React from 'react';
import { Link } from 'react-router-dom';
import FlashSaleProductCard from '../flash-sales/FlashSaleProductCard';
import { Product } from '../../types';
import { ChevronRight } from 'lucide-react';
import HomeSectionHeader from './shared/HomeSectionHeader';

interface Props {
  products: Product[];
  limit?: number;
}

const HomeFlashSalesSection: React.FC<Props> = ({ products, limit = 8 }) => {
  if (!products.length) return null;
  return (
    <section className="py-8">
      <HomeSectionHeader
        title="Flash Sale"
        subtitle="Diskon hingga 70% - Terbatas!"
        action={{ to: '/flash-sales', label: 'Lihat Semua', icon: <ChevronRight size={16} /> }}
      />
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-4 pb-2">
          {products.slice(0, limit).map((p,i) => (
            <div key={p.id} className={`flex-shrink-0 w-60 anim-fade-scale stagger-${(i%10)+1}`}>
              <FlashSaleProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeFlashSalesSection);
