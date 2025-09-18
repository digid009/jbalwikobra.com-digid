import React from 'react';
import { Gamepad2, Smartphone, Trophy, Star } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNCard } from '../ui/PinkNeonDesignSystem';

interface PopularGame {
  name: string;
  count: string;
  icon: React.ComponentType<any>;
  color?: string;
  logoUrl?: string;
}

interface PopularGamesProps {
  games?: PopularGame[];
  onGameSelect?: (gameName: string) => void;
}

const defaultGames: PopularGame[] = [
  { name: 'Mobile Legends', count: '500+', icon: Gamepad2, color: '#3b82f6' },
  { name: 'PUBG Mobile', count: '350+', icon: Smartphone, color: '#f59e0b' },
  { name: 'Free Fire', count: '300+', icon: Trophy, color: '#ef4444' },
  { name: 'Genshin Impact', count: '200+', icon: Star, color: '#8b5cf6' },
];

export const PopularGames: React.FC<PopularGamesProps> = ({ 
  games = defaultGames, 
  onGameSelect 
}) => {
  return (
    <PNSection padding="lg" className="bg-gradient-to-br from-gray-900/20 to-black/20 border-y border-white/10">
      <PNContainer>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <PNHeading level={2} gradient className="mb-6 text-2xl lg:text-3xl">
              Game Populer
            </PNHeading>
            <PNText className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Akun game yang paling banyak dicari dan memiliki nilai jual tinggi
            </PNText>
          </div>
          
          {/* Games Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {games.map((game, index) => {
              const IconComponent = game.icon;
              
              return (
                <PNCard
                  key={game.name}
                  className="p-4 lg:p-6 text-center cursor-pointer group hover:scale-105 transition-all duration-300 border border-white/10 hover:border-pink-500/30 bg-gradient-to-br from-black/50 to-gray-900/50 relative overflow-hidden"
                  onClick={() => onGameSelect?.(game.name)}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl -translate-y-8 translate-x-8 group-hover:bg-pink-500/20 transition-colors duration-300"></div>
                  
                  <div className="space-y-3 relative z-10">
                    {/* Game Icon */}
                    <div className="flex justify-center">
                      <div 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          backgroundColor: `${game.color}20`,
                          border: `2px solid ${game.color}40`
                        }}
                      >
                        <IconComponent 
                          size={20} 
                          className="sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-300" 
                          style={{ color: game.color }}
                        />
                      </div>
                    </div>
                    
                    {/* Game Info */}
                    <PNHeading level={3} className="text-white mb-2 group-hover:text-pink-300 transition-colors duration-300 text-base lg:text-lg">
                      {game.name}
                    </PNHeading>
                    
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <PNText className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">
                        {game.count} akun terjual
                      </PNText>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </PNCard>
              );
            })}
          </div>
          
          {/* Trust Badge */}
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <PNText className="text-green-400 font-semibold text-base">
                1,350+ akun berhasil terjual dengan aman
              </PNText>
            </div>
          </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default PopularGames;
