import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { PNSection, PNContainer, PNSectionHeader, PNCard } from '../../ui/PinkNeonDesignSystem';

interface GameItem { id: string; name: string; slug: string; logoUrl?: string | null; count: number; }
interface Props { games: GameItem[]; limit?: number }

const PNPopularGamesSection: React.FC<Props> = ({ games, limit = 12 }) => {
  if (!games || games.length === 0) return null;
  const list = games.slice(0, limit);
  return (
    <PNSection padding="md">
      <PNContainer>
        <PNSectionHeader
          title="Game Populer"
          subtitle="Pilih dari berbagai game favorit"
          action={
            <Link to="/products" className="text-sm text-pink-300 hover:text-pink-200 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          }
        />
        <PNContainer>
          <div className="grid gap-3 px-1 pb-2 auto-cols-[140px] grid-flow-col overflow-x-auto snap-x snap-mandatory scrollbar-hide md:auto-cols-auto md:grid-flow-row md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:overflow-x-visible md:px-0">
            {list.map((g) => (
              <Link key={g.id} to={`/products?game=${encodeURIComponent(g.name)}`} className="block min-w-[140px] md:min-w-0 snap-start">
                <PNCard className="p-3 md:p-4 hover:bg-white/10 transition-colors h-full">
                  <div className="aspect-square rounded-xl mb-2 md:mb-3 flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30">
                    {g.logoUrl ? (
                      <img src={g.logoUrl} alt={g.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <TrendingUp className="text-white" size={22} />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white line-clamp-2 mb-1">{g.name}</div>
                  <div className="text-xs text-gray-400">{g.count} akun</div>
                </PNCard>
              </Link>
            ))}
          </div>
        </PNContainer>
      </PNContainer>
    </PNSection>
  );
};

export default React.memo(PNPopularGamesSection);
