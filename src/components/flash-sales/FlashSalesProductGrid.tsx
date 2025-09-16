/**
 * FlashSalesProductGrid - Grid component for displaying flash sale products
 * 
 * Features:
 * - Responsive grid layout matching homepage style
 * - Horizontal scroll on mobile, column grid on desktop
 * - Uses shared FlashSaleCard component
 * - Handles both Product and FlashSale data
 */

import React from 'react';
import { Product, FlashSale } from '../../types';
import FlashSaleCard from '../shared/FlashSaleCard';

interface FlashSalesProductGridProps {
  /** Array of flash sale products to display */
  products: Array<{
    id: string;
    product: Product;
    originalPrice?: number;
    salePrice: number;
    endTime?: string;
  }>;
  /** Additional CSS classes */
  className?: string;
}

const FlashSalesProductGrid: React.FC<FlashSalesProductGridProps> = ({ 
  products, 
  className = "" 
}) => {
  return (
    <div className={`grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 ${className}`}>
      {products.map(flashSale => {
        // Convert flash sale data to FlashSale type for the card
        const flashSaleData: FlashSale = {
          id: flashSale.id,
          productId: flashSale.product.id,
          originalPrice: flashSale.originalPrice || 0,
          salePrice: flashSale.salePrice,
          endTime: flashSale.endTime || '',
          startTime: '', // Not needed for display
          isActive: true, // Assume active if in the list
          stock: 0 // Not needed for display
        };

        return (
          <FlashSaleCard
            key={flashSale.id}
            product={flashSale.product}
            flashSale={flashSaleData}
            variant="page"
          />
        );
      })}
    </div>
  );
};

export default FlashSalesProductGrid;
