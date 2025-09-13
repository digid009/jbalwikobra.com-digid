/**
 * ProductDescription - Product description and details
 * Displays formatted product description in a styled container
 */

import React from 'react';

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = React.memo(({
  description
}: ProductDescriptionProps) => {
  return (
    <div className="mt-12 bg-black rounded-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Deskripsi Produk</h2>
      <div className="max-w-none">
        <p className="text-white-secondary leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
});

ProductDescription.displayName = 'ProductDescription';
