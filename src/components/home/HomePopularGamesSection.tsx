import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import HomeSectionHeader from './shared/HomeSectionHeader';

interface GameItem { id: string; name: string; slug: string; logoUrl?: string | null; count: number; }
interface Props { games: GameItem[]; limit?: number; }

const GameCard: React.FC<{ game: GameItem }> = ({ game }) => (
  <Link to={`/products?game=${encodeURIComponent(game.name)}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 rounded-2xl">
    <div className="interactive-card rounded-2xl p-4 transition-all duration-300 group-hover:scale-[1.02]">
      <div className="aspect-square w-full rounded-xl mb-3 flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-600/60 via-pink-600/40 to-fuchsia-600/60 border border-pink-500/30 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        {game.logoUrl ? (
          <img src={game.logoUrl} alt={game.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <TrendingUp className="text-white" size={24} />
        )}
      </div>
      <h3 className="font-medium text-white mb-1 text-sm leading-tight tracking-wide group-hover:text-pink-300 transition-colors line-clamp-2">{game.name}</h3>
      <p className="text-xs text-tertiary">{game.count} akun</p>
    </div>
  </Link>
);

const HomePopularGamesSection: React.FC<Props> = ({ games, limit = 12 }) => {
  if (!games.length) return null;
  return (
    <section className="px-4 py-8">
      <HomeSectionHeader
        padX={false}
        title="Game Populer"
        subtitle="Pilih dari berbagai game favorit"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {games.slice(0, limit).map((g,i) => (
          <div key={g.id} className={`anim-fade-scale stagger-${(i%10)+1}`}>
            <GameCard game={g} />
          </div>
        ))}
      </div>
      {games.length > limit && (
        <div className="text-center mt-6">
          <Link to="/products">
            <button className="font-medium text-sm flex items-center space-x-1 mx-auto transition-colors text-secondary hover:text-pink-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 rounded-full px-4 py-1">
              <span>Lihat Game Lainnya</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default React.memo(HomePopularGamesSection);
