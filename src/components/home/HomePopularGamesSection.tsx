import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface GameItem { id: string; name: string; slug: string; logoUrl?: string | null; count: number; }
interface Props { games: GameItem[]; limit?: number; }

const GameCard: React.FC<{ game: GameItem }> = ({ game }) => (
  <Link to={`/products?game=${encodeURIComponent(game.name)}`} className="block group">
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 hover:border-pink-500/30 transition-all duration-300 group-hover:scale-[1.02]">
      <div className="aspect-square w-full bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {game.logoUrl ? (
          <img src={game.logoUrl} alt={game.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <TrendingUp className="text-white" size={24} />
        )}
      </div>
      <h3 className="font-medium text-white mb-1 text-sm leading-tight group-hover:text-pink-400 transition-colors">{game.name}</h3>
      <p className="text-xs text-zinc-500">{game.count} akun</p>
    </div>
  </Link>
);

const HomePopularGamesSection: React.FC<Props> = ({ games, limit = 12 }) => {
  if (!games.length) return null;
  return (
    <section className="px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Game Populer</h2>
        <p className="text-zinc-400 text-sm">Pilih dari berbagai game favorit</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {games.slice(0, limit).map(g => <GameCard key={g.id} game={g} />)}
      </div>
      {games.length > limit && (
        <div className="text-center mt-6">
          <Link to="/products">
            <button className="text-pink-400 hover:text-pink-300 font-medium text-sm flex items-center space-x-1 mx-auto transition-colors">
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
