import React from 'react';
import { Product } from '../../../../services/adminService';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface ProductsGridProps {
  products: Product[];
  loading?: boolean;
  onProductView?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  className?: string;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  loading = false,
  onProductView,
  onProductEdit,
  onProductDelete,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index} 
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-pink-500/20 p-6 animate-pulse"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pink-500/30 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/20 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded w-4/5"></div>
              </div>
              <div className="aspect-video bg-white/10 rounded-xl"></div>
              <div className="flex space-x-2 pt-4 border-t border-white/10">
                <div className="h-8 bg-white/10 rounded flex-1"></div>
                <div className="h-8 bg-white/10 rounded flex-1"></div>
                <div className="h-8 bg-white/10 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-fuchsia-600/20 rounded-3xl flex items-center justify-center mb-6 border border-pink-500/30">
          <Package className="w-12 h-12 text-pink-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
        <p className="text-gray-300 text-center max-w-md">
          No products match your current filters. Try adjusting your search criteria or add new products.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onProductView}
          onEdit={onProductEdit}
          onDelete={onProductDelete}
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
