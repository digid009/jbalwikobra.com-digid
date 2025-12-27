import React from 'react';
import { Rows, Grid } from 'lucide-react';
import { IOSButton } from '../ios/IOSDesignSystemV2';

type LayoutDensity = 'comfortable' | 'compact';

interface CatalogLayoutToggleProps {
  density: LayoutDensity;
  onChange: (d: LayoutDensity) => void;
}

export const CatalogLayoutToggle: React.FC<CatalogLayoutToggleProps> = ({ density, onChange }) => {
  return (
  <div className="inline-flex items-center gap-2" role="group" aria-label="Tampilan Grid">
      <IOSButton
        variant={density === 'comfortable' ? 'primary' : 'tertiary'}
        size="sm"
        aria-pressed={density === 'comfortable'}
        onClick={() => onChange('comfortable')}
    className="w-10 h-10 p-[7px] rounded-full border border-white/10"
      >
  <span className="flex w-full aspect-square items-center justify-center">
  <Rows size={26} className="w-[26px] h-[26px] shrink-0" style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }} />
  </span>
        <span className="sr-only">Tampilan Nyaman</span>
      </IOSButton>
      <IOSButton
        variant={density === 'compact' ? 'primary' : 'tertiary'}
        size="sm"
        aria-pressed={density === 'compact'}
        onClick={() => onChange('compact')}
  className="w-10 h-10 p-[7px] rounded-full border border-white/10"
      >
  <span className="flex w-full aspect-square items-center justify-center">
  <Grid size={26} className="w-[26px] h-[26px] shrink-0" style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }} />
  </span>
        <span className="sr-only">Tampilan Padat</span>
      </IOSButton>
    </div>
  );
};

export default CatalogLayoutToggle;
