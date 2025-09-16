import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Tier } from '../../types';

interface TierSelectProps {
  value: string;
  onChange: (slug: string) => void;
  tiers: Tier[];
  className?: string;
}

export const TierSelect: React.FC<TierSelectProps> = ({ value, onChange, tiers, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-dropdown="tier"]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  const selectedTier = tiers.find(tier => tier.slug === value);

  return (
    <div className={`relative ${className}`} data-dropdown="tier">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm text-white flex items-center gap-2 hover:bg-white/10 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Pilih tier"
      >
        <span className="truncate max-w-24 sm:max-w-32">
          {selectedTier?.name || 'Semua Tier'}
        </span>
        <ChevronDown size={16} className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-40 sm:w-48 max-h-56 overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
        >
          <li
            role="option"
            aria-selected={!value}
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`px-3 py-2 text-xs sm:text-sm cursor-pointer select-none ${!value ? 'bg-pink-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
          >
            Semua Tier
          </li>
          {tiers
            .filter(tier => tier.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(tier => {
              const active = value === tier.slug;
              return (
                <li
                  key={tier.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(tier.slug); setIsOpen(false); }}
                  className={`px-3 py-2 text-xs sm:text-sm cursor-pointer select-none ${active ? 'bg-pink-600/20 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                >
                  {tier.name}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default TierSelect;
