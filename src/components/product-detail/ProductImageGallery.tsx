/**
 * ProductImageGallery - Touch-optimized image gallery
 * Features swipe gestures and responsive thumbnail navigation
 * Following iOS Human Interface Guidelines
 */

import React from 'react';
import { Zap } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import { PNCard } from '../ui/PinkNeonDesignSystem';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onImageSelect: (index: number) => void;
  isFlashSaleActive?: boolean;
}

export const ProductImageGallery = React.memo(({
  images,
  productName,
  selectedImage,
  onImageSelect,
  isFlashSaleActive = false
}: ProductImageGalleryProps) => {
  return (
    <div>
      {/* Main Image */}
      <PNCard className="aspect-[4/5] mb-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center overflow-hidden relative p-0">
        <ResponsiveImage
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-cover"
          priority={true}
          quality={85}
          aspectRatio={4/5}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Flash Sale Badge */}
        {isFlashSaleActive && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg backdrop-blur-sm">
            <Zap size={14} />
            <span>Flash Sale</span>
          </div>
        )}
      </PNCard>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2" role="listbox" aria-label="Galeri gambar">
          {images.map((image, index) => (
            <PNCard
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-shrink-0 w-20 md:w-24 min-w-[44px] min-h-[44px] aspect-[4/5] overflow-hidden transition-all duration-200 cursor-pointer p-0 hover:scale-105 ${
                selectedImage === index 
                  ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/25 bg-pink-500/10' 
                  : 'hover:bg-white/10'
              }`}
            >
              <div
                role="option"
                aria-selected={selectedImage === index}
                aria-label={`Gambar ${index + 1} dari ${images.length}`}
                className="w-full h-full"
              >
                <img
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </PNCard>
          ))}
        </div>
      )}
    </div>
  );
});

ProductImageGallery.displayName = 'ProductImageGallery';
