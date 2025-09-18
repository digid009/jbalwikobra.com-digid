import React from 'react';
import { PNHeading } from '../ui/PinkNeonDesignSystem';

interface Tip {
  text: string;
  color: string;
}

interface TipsSectionProps {
  title?: string;
  tips?: Tip[];
}

const defaultTips: Tip[] = [
  { text: 'Level akun dan progress yang sudah dicapai', color: 'pink' },
  { text: 'Skin dan item rare yang dimiliki', color: 'purple' },
  { text: 'Rank atau tier kompetitif', color: 'blue' },
  { text: 'Waktu dan effort yang diinvestasikan', color: 'green' }
];

const colorClasses = {
  pink: 'bg-pink-400',
  purple: 'bg-purple-400', 
  blue: 'bg-blue-400',
  green: 'bg-green-400'
};

export const TipsSection: React.FC<TipsSectionProps> = ({ 
  title = '💡 Tips untuk Estimasi Harga Terbaik',
  tips = defaultTips 
}) => {
  return (
    <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20">
      <PNHeading level={3} className="text-pink-300 mb-3">
        {title}
      </PNHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-300">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className={`w-2 h-2 ${colorClasses[tip.color as keyof typeof colorClasses] || 'bg-pink-400'} rounded-full mt-2 flex-shrink-0`}></div>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsSection;
