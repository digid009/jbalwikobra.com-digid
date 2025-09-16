import React from 'react';

interface ProductCardSkeletonProps {
  density?: 'comfortable' | 'compact';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ density = 'comfortable' }) => {
  const pad = density === 'compact' ? 'p-3' : 'p-4';
  return (
    <div className={`rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden animate-pulse ${pad}`}>
      <div className="aspect-[4/5] w-full bg-zinc-800 rounded-xl mb-3" />
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
      <div className="h-4 bg-zinc-800 rounded w-1/2 mb-3" />
      <div className="h-8 bg-zinc-800 rounded-lg" />
    </div>
  );
};

export default ProductCardSkeleton;
