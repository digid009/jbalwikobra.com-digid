import React from 'react';
import { Link } from 'react-router-dom';
import FlashSaleProductCard from '../flash-sales/FlashSaleProductCard';
import { Product } from '../../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  products: Product[];
  limit?: number;
}

const HomeFlashSalesSection: React.FC<Props> = ({ products, limit = 8 }) => {
  if (!products.length) return null;
  return (
    <section className="py-8">
      <div className="px-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Flash Sale</h2>
          <p className="text-zinc-400 text-sm">Diskon hingga 70% - Terbatas!</p>
        </div>
        <Link 
          to="/flash-sales"
          className="flex items-center space-x-1 text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
        >
          <span>Lihat Semua</span>
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-4 pb-2">
          {products.slice(0, limit).map(p => (
            <div key={p.id} className="flex-shrink-0 w-60">
              <FlashSaleProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomeFlashSalesSection);
