import React from 'react';

const ProductDetailLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-black text-white">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="ios-skeleton h-5 w-64 mb-6" />
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="ios-skeleton h-[480px] w-full mb-4 rounded-xl" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="ios-skeleton h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
          <div className="ios-skeleton h-6 w-3/4 mb-4" />
          <div className="ios-skeleton h-8 w-1/3 mb-6" />
          <div className="space-y-3 mb-6">
            <div className="ios-skeleton h-4 w-full" />
            <div className="ios-skeleton h-4 w-5/6" />
            <div className="ios-skeleton h-4 w-2/3" />
          </div>
          <div className="flex gap-3">
            <div className="ios-skeleton h-12 w-32 rounded-xl" />
            <div className="ios-skeleton h-12 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailLoadingSkeleton;
