/**
 * ProductDescription - Product description and details
 * Displays formatted product description in a styled container
 */

import React from 'react';
import { PNCard, PNHeading, PNText } from '../ui/PinkNeonDesignSystem';

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = React.memo(({
  description
}: ProductDescriptionProps) => {
  return (
    <PNCard className="mt-12 p-6">
      <PNHeading level={2} className="mb-4">Deskripsi Produk</PNHeading>
      <div className="max-w-none">
        <PNText className="leading-relaxed whitespace-pre-line">
          {description}
        </PNText>
      </div>
    </PNCard>
  );
});

ProductDescription.displayName = 'ProductDescription';
