/**
 * ProductBreadcrumb - Navigation breadcrumb and back button
 * Provides navigation context and easy return to catalog
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PNButton, PNText } from '../ui/PinkNeonDesignSystem';

interface ProductBreadcrumbProps {
  productName: string;
  onBackToCatalog: () => void;
}

export const ProductBreadcrumb = React.memo(({
  productName,
  onBackToCatalog
}: ProductBreadcrumbProps) => {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors">
          Beranda
        </Link>
        <span className="text-gray-500">/</span>
        <button 
          onClick={onBackToCatalog} 
          className="text-gray-300 hover:text-pink-400 bg-transparent border-none p-0 transition-colors"
        >
          Produk
        </button>
        <span className="text-gray-500">/</span>
        <span className="text-white truncate max-w-xs">{productName}</span>
      </nav>

      {/* Back Button */}
      <PNButton
        variant="ghost"
        onClick={onBackToCatalog}
        className="inline-flex items-center space-x-2 mb-6 hover:translate-x-1 transition-all duration-200"
      >
        <ChevronLeft size={20} />
        <span>Kembali ke Katalog</span>
      </PNButton>
    </>
  );
});

ProductBreadcrumb.displayName = 'ProductBreadcrumb';
