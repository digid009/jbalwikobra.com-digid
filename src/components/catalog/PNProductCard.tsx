import React from 'react';
import { PNCard } from '../ui/PinkNeonDesignSystem';

interface PNProductCardProps {
  id: string;
  title: string;
  image?: string;
  price?: string;
  children?: React.ReactNode;
  density?: 'comfortable' | 'compact';
  onClick?: () => void;
  rentalAvailable?: boolean;
  className?: string; // extra classes for PNCard wrapper (page-specific themes)
  imageFrameClassName?: string; // override gradient/border around image
  rentalBadgeClassName?: string; // override rental badge color/style per page
  tierAccentClassName?: string; // small accent dot color based on tier
}

const PNProductCard: React.FC<PNProductCardProps> = ({ id, title, image, price, children, density = 'comfortable', onClick, rentalAvailable, className, imageFrameClassName, rentalBadgeClassName, tierAccentClassName }) => {
  // Use outer wrapper to apply tier colors; make inner PNCard transparent so tier color is visible.
  const outerWrapperClass = className ?? 'bg-white/5 border border-white/10';
  return (
    <div onClick={onClick} className={`rounded-2xl ${outerWrapperClass}`}>
      <PNCard className={`relative p-3 md:p-4 transition-colors h-full cursor-pointer !bg-transparent !border-transparent ${density === 'compact' ? '' : ''}`}>
      <div className={`aspect-[4/5] rounded-xl mb-2 md:mb-3 overflow-hidden relative ${imageFrameClassName ?? 'bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30'}`}>
        {image && <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />}
      </div>

      <div className="mb-2">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9px] font-semibold border ${
            rentalBadgeClassName ?? 'bg-black/80 text-white border-white/15'
          } ${rentalAvailable ? 'opacity-100' : 'opacity-15 pointer-events-none'}`}
          aria-hidden={rentalAvailable ? undefined : true}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tierAccentClassName ?? 'bg-emerald-400'}`} />
          Tersedia untuk rental
        </span>
      </div>

      <div className="text-sm font-semibold text-white line-clamp-2 mb-2 md:mb-2 md:min-h-10">{title}</div>
      {price && (
        <div className="flex items-end justify-between gap-3 mb-1.5 md:mb-2">
          <div className="flex flex-col leading-tight">
            <div className="text-pink-300 font-extrabold text-[15px] md:text-[16px]">{price}</div>
          </div>
        </div>
      )}
        {children}
      </PNCard>
    </div>
  );
};

export default PNProductCard;
