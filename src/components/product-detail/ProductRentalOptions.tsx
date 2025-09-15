/**
 * ProductRentalOptions - Rental selection component
 * Displays available rental durations and pricing
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { RentalOption } from '../../types';

interface ProductRentalOptionsProps {
  rentalOptions: RentalOption[];
  selectedRental: RentalOption | null;
  onRentalSelect: (rental: RentalOption) => void;
  cameFromFlashSaleCard: boolean;
  hasRental: boolean;
}

export const ProductRentalOptions = React.memo(({
  rentalOptions,
  selectedRental,
  onRentalSelect,
  cameFromFlashSaleCard,
  hasRental
}: ProductRentalOptionsProps) => {
  // Debug logging
  console.log('ProductRentalOptions Debug:', {
    hasRental,
    rentalOptionsCount: rentalOptions?.length || 0,
    cameFromFlashSaleCard,
    selectedRental: selectedRental?.id || null
  });

  // Don't show rental options if no rental data is available
  if (!hasRental || !rentalOptions || rentalOptions.length === 0) {
    console.log('ProductRentalOptions: Hidden due to no rental data');
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
        <Calendar className="text-pink-400" size={16} />
        <span>Opsi Rental</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rentalOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onRentalSelect(option)}
            className={`p-3 border-2 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              selectedRental?.id === option.id
                ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                : 'border-gray-700 hover:bg-black hover:border-gray-600'
            }`}
          >
            <div className="font-medium text-white">{option.duration}</div>
            <div className="text-pink-400 font-semibold">
              {formatCurrency(option.price)}
            </div>
            {option.description && (
              <div className="text-sm text-white-secondary mt-1">{option.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

ProductRentalOptions.displayName = 'ProductRentalOptions';
