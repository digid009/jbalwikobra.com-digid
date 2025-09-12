import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { ProductTier, GameTitle } from '../../../../types';
import { ProductService } from '../../../../services/productService';

interface ProductDetailsFormProps {
  formData: {
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    category: string;
    gameTitle: string;
    gameTitleId: string; // Add gameTitleId for storing the selected game ID
    tier: ProductTier;
    accountLevel: string;
    accountDetails: string;
    stock: number;
    isActive: boolean;
    isFlashSale: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  formData,
  setFormData,
}) => {
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Fetch game titles on component mount
  useEffect(() => {
    const fetchGameTitles = async () => {
      try {
        setLoadingGames(true);
        const games = await ProductService.getGameTitles();
        // Filter only active games and sort by popularity and name
        const activeGames = games
          .filter(game => game.isActive !== false)
          .sort((a, b) => {
            // Sort by popularity first, then by name
            if (a.isPopular !== b.isPopular) {
              return b.isPopular ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
          });
        setGameTitles(activeGames);
      } catch (error) {
        console.error('Failed to fetch game titles:', error);
        setGameTitles([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGameTitles();
  }, []);

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGameId = e.target.value;
    const selectedGame = gameTitles.find(game => game.id === selectedGameId);
    
    setFormData((prev: any) => ({
      ...prev,
      gameTitleId: selectedGameId,
      gameTitle: selectedGame?.name || '', // Keep the name for backward compatibility
    }));
  };
  return (
    <div className="bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center border border-pink-500/30">
          <Package className="w-5 h-5 text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Product Details</h3>
      </div>

      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Product Name*
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Product Description*
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 resize-none"
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Game Title */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Game Title*
          </label>
          <div className="relative">
            <select
              value={formData.gameTitleId || formData.gameTitle || ''}
              onChange={handleGameChange}
              disabled={loadingGames}
              className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-10"
              required
            >
              {loadingGames ? (
                <option value="">Loading games...</option>
              ) : (
                <>
                  <option value="">Select Game</option>
                  {gameTitles.map((game) => (
                    <option 
                      key={game.id} 
                      value={game.id}
                      className="bg-gray-800 text-white"
                    >
                      {game.name} {game.isPopular ? '⭐' : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            {loadingGames && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
              </div>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className={`w-4 h-4 text-pink-200/60 ${loadingGames ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {!loadingGames && gameTitles.length === 0 && (
            <p className="text-red-400 text-xs mt-2">
              No games available. Please contact administrator.
            </p>
          )}
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Tier*
          </label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, tier: e.target.value as ProductTier }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            required
          >
            <option value="reguler">Regular</option>
            <option value="pelajar">Pelajar</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Account Level */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Account Level
          </label>
          <input
            type="text"
            value={formData.accountLevel}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, accountLevel: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            placeholder="e.g., Level 30"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Price*
          </label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            placeholder="Rp 1.000.000"
            required
          />
        </div>

        {/* Original Price */}
        <div>
          <label className="block text-sm font-semibold text-pink-200 mb-2">
            Original Price (IDR)
          </label>
          <input
            type="number"
            min="0"
            value={formData.originalPrice}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
            placeholder="0"
          />
        </div>

        {/* Status Toggle */}
        <div className="bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-pink-500/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 rounded border border-pink-500/30 bg-black/50 text-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
            <div>
              <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer">
                Product is active and visible
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Inactive products won't appear in the store
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
