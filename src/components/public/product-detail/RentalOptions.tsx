import React from 'react';
import { Calendar } from 'lucide-react';
import { RentalOption } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

interface Props {
  options: RentalOption[];
  selected: RentalOption | null;
  onSelect: (opt: RentalOption) => void;
  hidden?: boolean;
}

const RentalOptions: React.FC<Props> = ({ options, selected, onSelect, hidden }) => {
  if (hidden || !options || options.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
        <Calendar className="text-pink-400" size={16} />
        <span>Opsi Rental</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${selected?.id === option.id ? 'border-pink-500 bg-pink-500/10' : 'border-gray-700 hover:bg-black'}`}
          >
            <div className="font-medium text-white">{option.duration}</div>
            <div className="text-pink-400 font-semibold">{formatCurrency(option.price)}</div>
            {option.description && <div className="text-sm text-white/60 mt-1">{option.description}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RentalOptions;
