import React from 'react';
import { PNText } from '../ui/PinkNeonDesignSystem';

interface TrustIndicator {
  label: string;
  color: string;
}

interface TrustIndicatorsProps {
  indicators?: TrustIndicator[];
  className?: string;
}

const defaultIndicators: TrustIndicator[] = [
  { label: 'Transaksi Aman', color: 'green' },
  { label: 'Proses 24 Jam', color: 'blue' },
  { label: 'Harga Terbaik', color: 'purple' }
];

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500'
};

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ 
  indicators = defaultIndicators,
  className = ""
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400 ${className}`}>
      {indicators.map((indicator, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={`w-2 h-2 ${colorClasses[indicator.color as keyof typeof colorClasses] || 'bg-pink-500'} rounded-full`}></div>
          <PNText className="text-gray-400">
            {indicator.label}
          </PNText>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
