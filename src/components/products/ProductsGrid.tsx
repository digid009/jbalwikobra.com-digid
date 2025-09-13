/**
 * ProductsGrid - Product grid display component
 * Features responsive grid layout with empty state
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { IOSContainer, IOSGrid, IOSCard, IOSButton } from '../ios/IOSDesignSystemV2';

interface ProductsGridProps {
  products: Product[];
  onResetFilters: () => void;
}

export const ProductsGrid = React.memo(({
  products,
  onResetFilters
}: ProductsGridProps) => {
  return (
    <section className="mb-8">
      <IOSContainer size="xl">
        {products.length > 0 ? (
          <IOSGrid cols={4} gap="md" className="mb-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                fromCatalogPage={true}
                className="w-full h-full" 
              />
            ))}
          </IOSGrid>
        ) : (
          <IOSCard padding="lg" className="text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Search className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-zinc-400 mb-6 text-sm">Coba ubah kata kunci pencarian atau filter Anda</p>
            <IOSButton
              variant="primary"
              size="md"
              onClick={onResetFilters}
            >
              Reset Filter
            </IOSButton>
          </IOSCard>
        )}
      </IOSContainer>
    </section>
  );
});

ProductsGrid.displayName = 'ProductsGrid';
