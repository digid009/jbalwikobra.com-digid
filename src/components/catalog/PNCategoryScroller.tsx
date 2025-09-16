import React from 'react';
import { IOSButton } from '../ios/IOSDesignSystemV2';

export interface PNCategoryItem {
  id: string;
  label: string;
  active?: boolean;
}

interface PNCategoryScrollerProps {
  categories: PNCategoryItem[];
  onSelect: (id: string) => void;
  className?: string;
}

const PNCategoryScroller: React.FC<PNCategoryScrollerProps> = ({ categories, onSelect, className }) => {
  return (
    <div className={"px-4 " + (className || '')}>
  <div className="max-w-7xl mx-auto overflow-x-auto no-scrollbar">
    <div className="flex items-center gap-2 py-2 min-w-max">
          {categories.map(cat => (
            <IOSButton
              key={cat.id}
              size="sm"
              variant={cat.active ? 'primary' : 'tertiary'}
              onClick={() => onSelect(cat.id)}
      className={`rounded-full px-4 h-10 text-sm transition-colors ${cat.active ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : 'border border-white/10'} `}
            >
              {cat.label}
            </IOSButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PNCategoryScroller;
