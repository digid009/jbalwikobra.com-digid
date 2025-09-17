import React from 'react';
import { Sparkles, TrendingUp, Zap, Star, Clock } from 'lucide-react';

interface FeedHeaderProps {
  totalCounts: { semua: number; pengumuman: number; review: number };
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({ totalCounts }) => {
  return (
    <div className="relative overflow-hidden lg:block">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-fuchsia-500/20 to-purple-500/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      <div className="relative backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent truncate">Feed Komunitas</h1>
              <p className="text-gray-400 text-sm lg:text-base mt-0.5 lg:mt-1 line-clamp-2">Bergabung dalam diskusi dan dapatkan update terbaru</p>
            </div>
            <div className="lg:hidden flex flex-col items-end text-right">
              <div className="flex items-center gap-2 text-pink-300"><TrendingUp className="w-4 h-4" /><span className="text-sm font-medium">{totalCounts.semua}</span></div>
              <span className="text-xs text-gray-400">Total Posts</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-pink-300"><Zap className="w-4 h-4" /><span className="text-sm font-medium">{totalCounts.pengumuman} Pengumuman</span></div>
            <div className="flex items-center gap-2 text-blue-300"><Star className="w-4 h-4" /><span className="text-sm font-medium">{totalCounts.review} Review</span></div>
            <div className="flex items-center gap-2 text-gray-300"><Clock className="w-4 h-4" /><span className="text-sm font-medium">Update terbaru</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedHeader;
