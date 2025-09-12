import React from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import type { RentalOption } from './types';

interface RentalOptionsFormProps {
  hasRental: boolean;
  onHasRentalChange: (hasRental: boolean) => void;
  rentalOptions: RentalOption[];
  onRentalOptionsChange: (options: RentalOption[]) => void;
}

export const RentalOptionsForm: React.FC<RentalOptionsFormProps> = ({
  hasRental,
  onHasRentalChange,
  rentalOptions,
  onRentalOptionsChange,
}) => {
  const addRentalOption = () => {
    // Check if we've reached the maximum of 4 rental options
    if (rentalOptions.length >= 4) {
      alert('Maximum 4 rental options allowed per product.');
      return;
    }

    const newOption: RentalOption = {
      id: Date.now().toString(),
      duration: '',
      price: 0,
      description: '',
    };
    onRentalOptionsChange([...rentalOptions, newOption]);
  };

  const updateRentalOption = (id: string, field: keyof RentalOption, value: any) => {
    const updated = rentalOptions.map((option) =>
      option.id === id ? { ...option, [field]: value } : option
    );
    onRentalOptionsChange(updated);
  };

  const removeRentalOption = (id: string) => {
    const filtered = rentalOptions.filter((option) => option.id !== id);
    onRentalOptionsChange(filtered);
  };

  return (
    <div className="bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
          <Clock className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Rental Options</h3>
      </div>

      <div className="space-y-4">
        {/* Enable Rental Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="has_rental"
            checked={hasRental}
            onChange={(e) => onHasRentalChange(e.target.checked)}
            className="w-5 h-5 rounded border border-emerald-500/30 bg-black/50 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <label htmlFor="has_rental" className="text-sm font-medium text-white">
            Enable rental options for this product
          </label>
        </div>

        {hasRental && (
          <>
            {/* Rental Options List */}
            {rentalOptions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-emerald-200">
                    Rental Variants ({rentalOptions.length}/5)
                  </span>
                  <span className="text-xs text-gray-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    {5 - rentalOptions.length} remaining
                  </span>
                </div>
                {rentalOptions.map((option, index) => (
                  <div
                    key={option.id}
                    className="bg-gradient-to-br from-black/30 to-black/20 rounded-xl p-4 border border-white/10 space-y-3 backdrop-blur-sm hover:border-emerald-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-200 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300 border border-emerald-500/30">
                          {index + 1}
                        </div>
                        Rental Option {index + 1}
                      </span>
                      <IOSButton
                        onClick={() => removeRentalOption(option.id)}
                        className="p-1 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </IOSButton>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Duration */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={option.duration}
                          onChange={(e) => updateRentalOption(option.id, 'duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-500/20 text-white text-sm placeholder-gray-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                          placeholder="e.g., 7 days"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Price (IDR)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={option.price}
                          onChange={(e) => updateRentalOption(option.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-500/20 text-white text-sm placeholder-gray-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={option.description || ''}
                        onChange={(e) => updateRentalOption(option.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-500/20 text-white text-sm placeholder-gray-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                        placeholder="Additional details..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Rental Option Button */}
            <IOSButton
              onClick={addRentalOption}
              disabled={rentalOptions.length >= 5}
              className={`w-full transition-all duration-300 ${
                rentalOptions.length >= 5
                  ? 'bg-gray-600/20 border-gray-600/30 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-200'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {rentalOptions.length >= 5 ? 'Maximum Options Reached' : 'Add Rental Option'}
            </IOSButton>

            {/* Rental Info */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/20 backdrop-blur-sm">
              <p className="text-sm text-emerald-200 mb-2 font-medium">⏰ Rental Guidelines:</p>
              <ul className="text-xs text-emerald-300/80 space-y-1">
                <li>• Maximum 4 rental variants per product</li>
                <li>• Duration examples: "3 days", "1 week", "30 days"</li>
                <li>• Rental price should be lower than purchase price</li>
                <li>• Clear descriptions help customers choose the right option</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
