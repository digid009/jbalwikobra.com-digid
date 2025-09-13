/**
 * ProductsTierFilter - Tier filter buttons component
 * Inspired by FlashSalesPage game filter design
 */

import React from 'react';
import { IOSContainer, IOSCard } from '../ios/IOSDesignSystemV2';
import { Crown, Users, Trophy } from 'lucide-react';
import { Tier } from '../../types';

interface ProductsTierFilterProps {
  selectedTier: string;
  onTierChange: (tier: string) => void;
  tiers: Tier[];
}

const tierIcons = {
  premium: Crown,
  pelajar: Users,
  reguler: Trophy
};

export const ProductsTierFilter = React.memo(({ 
  selectedTier, 
  onTierChange, 
  tiers 
}: ProductsTierFilterProps) => {
  // Create tier options with "all" option
  const tierOptions = [
    { id: 'all', name: 'Semua Tier', slug: '', tier: '' },
    ...tiers.map(tier => ({
      id: tier.id,
      name: tier.name.toUpperCase(),
      slug: tier.slug,
      tier: tier.slug
    }))
  ];

  return (
    <section className="mb-6">
      <IOSContainer size="xl">
        <IOSCard padding="lg">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
              Filter Tier
            </h3>
            <div className="flex flex-wrap gap-2">
              {tierOptions.map(tierOption => {
                const active = selectedTier === tierOption.tier;
                const IconComponent = tierIcons[tierOption.tier as keyof typeof tierIcons];
                
                return (
                  <button
                    key={tierOption.id}
                    onClick={() => onTierChange(tierOption.tier)}
                    className={`px-5 h-11 min-w-[108px] rounded-2xl text-sm font-semibold border inline-flex items-center justify-center gap-2 select-none tracking-wide focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 ${
                      active 
                        ? 'bg-pink-600 text-white border-pink-400 shadow shadow-pink-500/30' 
                        : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white active:scale-[0.97]'
                    }`}
                    aria-pressed={active}
                    aria-label={`Filter tier ${tierOption.name}`}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    {tierOption.name}
                  </button>
                );
              })}
            </div>
          </div>
        </IOSCard>
      </IOSContainer>
    </section>
  );
});

ProductsTierFilter.displayName = 'ProductsTierFilter';
