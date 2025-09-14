import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface Props { game: any; index: number; }

const GameCategoryCard: React.FC<Props> = ({ game }) => (
  <Link to={`/products?game=${encodeURIComponent(game.name)}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 rounded-2xl anim-fade-scale">
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

export default React.memo(GameCategoryCard);
