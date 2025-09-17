import React from 'react';
import { IOSCard } from '../ios/IOSDesignSystemV2';
import { MessageCircle, X } from 'lucide-react';
import { IOSButton } from '../ios/IOSDesignSystemV2';

export const FeedSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <IOSCard key={i} padding="md">
        <div className="ios-skeleton h-4 w-32 mb-3"></div>
        <div className="ios-skeleton h-40 w-full mb-4 rounded-lg"></div>
        <div className="flex gap-3">
          <div className="ios-skeleton h-8 w-16 rounded-md"></div>
          <div className="ios-skeleton h-8 w-20 rounded-md"></div>
          <div className="ios-skeleton h-8 w-24 rounded-md"></div>
        </div>
      </IOSCard>
    ))}
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry: () => void }>
  = ({ message, onRetry }) => (
  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-xl mb-8">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
          <X className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-red-100">{message}</p>
      </div>
      <IOSButton onClick={onRetry} variant="tertiary" className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 text-red-100">
        Coba Lagi
      </IOSButton>
    </div>
  </div>
);

export const EmptyState: React.FC<{ label: string; description: string }>
  = ({ label, description }) => (
  <div className="text-center py-12">
    <MessageCircle className="h-12 w-12 text-white/70 mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-2">{label}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

export const ImageLightbox: React.FC<{ src: string; onClose: () => void }>
  = ({ src, onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center" onClick={onClose}>
    <img src={src} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-2xl border border-gray-700" />
  </div>
);
