import React from 'react';
import { Zap, Flame, TrendingDown } from 'lucide-react';
import { IOSCard } from '../ios/IOSDesignSystemV2';

export const FlashSalesHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      {/* Flash Sale Badge */}
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl mb-6">
        <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h3 className="text-white font-bold text-lg">Flash Sale</h3>
          <p className="text-pink-300 text-sm">Penawaran Terbatas!</p>
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-600 bg-clip-text text-transparent">
          Flash Sale
        </span>
      </h1>
      
      <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Diskon hingga 70% untuk akun game terpilih! 
        <br />
        <span className="text-pink-400 font-semibold">Buruan, stok dan waktu terbatas!</span>
      </p>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
        <IOSCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-2 justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Waktu Terbatas</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Countdown aktif</p>
        </IOSCard>
        
        <IOSCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-2 justify-center">
            <TrendingDown className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Diskon Besar</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Hingga 70% off</p>
        </IOSCard>
        
        <IOSCard className="p-4 bg-white/5 backdrop-blur-sm border-white/10">
          <div className="flex items-center gap-2 justify-center">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Stok Terbatas</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">First come first served</p>
        </IOSCard>
      </div>
    </div>
  );
};
