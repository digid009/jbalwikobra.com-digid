import React from 'react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { IOSGrid } from '../ios/IOSDesignSystemV2';

interface FlashSalesGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const FlashSalesGrid: React.FC<FlashSalesGridProps> = ({
  products,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat flash sales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 mb-2">Gagal memuat flash sales</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-gray-400 mb-2">Tidak ada flash sales tersedia</p>
          <p className="text-gray-500 text-sm">Silakan coba lagi nanti</p>
        </div>
      </div>
    );
  }

  return (
    <IOSGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showFlashSaleTimer={true}
          className="transform hover:scale-105 transition-all duration-300"
        />
      ))}
    </IOSGrid>
  );
};
