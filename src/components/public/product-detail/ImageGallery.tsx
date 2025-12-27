import React from 'react';
import ResponsiveImage from '../../ResponsiveImage';
import { Zap } from 'lucide-react';

interface Props {
  images: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  isFlashSaleActive?: boolean;
  productName: string;
}

const ImageGallery: React.FC<Props> = ({ images, selectedIndex, onSelect, isFlashSaleActive, productName }) => {
  return (
    <div>
      <div className="relative aspect-[4/5] mb-4 bg-black rounded-xl overflow-hidden border border-gray-700">
        <ResponsiveImage
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full"
          priority
          quality={85}
          aspectRatio={4/5}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {isFlashSaleActive && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Zap size={14} />
            <span>Flash Sale</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto" role="listbox" aria-label="Galeri gambar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              role="option"
              aria-selected={selectedIndex === idx}
              aria-label={`Gambar ${idx + 1} dari ${images.length}`}
              className={`flex-shrink-0 w-24 md:w-20 min-w-[44px] min-h-[44px] aspect-[4/5] rounded-lg overflow-hidden border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${selectedIndex === idx ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-700'}`}
            >
              <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
