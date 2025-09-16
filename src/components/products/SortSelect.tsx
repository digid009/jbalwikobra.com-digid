import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SortSelectProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-low', label: 'Harga Terendah' },
  { value: 'price-high', label: 'Harga Tertinggi' },
  { value: 'name-az', label: 'Nama A-Z' },
  { value: 'name-za', label: 'Nama Z-A' }
];

export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-dropdown="sort"]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  const selectedOption = OPTIONS.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} data-dropdown="sort">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Urutkan produk"
      >
        <span className="truncate max-w-24 sm:max-w-32">
          {selectedOption?.label || 'Terbaru'}
        </span>
        <ChevronDown size={16} className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-40 sm:w-48 max-h-56 overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
        >
          {OPTIONS.map(option => {
            const active = value === option.value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={active}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`px-3 py-2 text-xs sm:text-sm cursor-pointer select-none ${active ? 'bg-pink-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SortSelect;
