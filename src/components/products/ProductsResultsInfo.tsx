/**
 * ProductsResultsInfo - Results information display component
 * Shows product count and pagination info
 */

import React from 'react';
import { IOSContainer, IOSCard } from '../ios/IOSDesignSystemV2';

interface ProductsResultsInfoProps {
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

export const ProductsResultsInfo = React.memo(({
  totalProducts,
  currentPage,
  totalPages
}: ProductsResultsInfoProps) => {
  return (
    <section className="mb-4">
      <IOSContainer size="xl">
        <IOSCard padding="sm" className="flex items-center justify-between bg-zinc-900/60">
          <span className="text-sm text-zinc-400">
            {totalProducts} produk ditemukan
            {totalPages > 1 && (
              <span className="ml-2">• Halaman {currentPage} dari {totalPages}</span>
            )}
          </span>
        </IOSCard>
      </IOSContainer>
    </section>
  );
});

ProductsResultsInfo.displayName = 'ProductsResultsInfo';
