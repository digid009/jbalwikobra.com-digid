/**
 * ProductBreadcrumb - Navigation breadcrumb and back button
 * Provides navigation context and easy return to catalog
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

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
      <nav className="flex items-center space-x-2 text-sm text-white-secondary mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <button 
          onClick={onBackToCatalog} 
          className="hover:text-white bg-transparent border-none p-0 text-inherit transition-colors"
        >
          Produk
        </button>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{productName}</span>
      </nav>

      {/* Back Button */}
      <button
        onClick={onBackToCatalog}
        className="inline-flex items-center space-x-2 text-white-secondary hover:text-white mb-6 transition-all duration-200 min-h-[44px] hover:translate-x-1"
      >
        <ChevronLeft size={20} />
        <span>Kembali ke Katalog</span>
      </button>
    </>
  );
});

ProductBreadcrumb.displayName = 'ProductBreadcrumb';
