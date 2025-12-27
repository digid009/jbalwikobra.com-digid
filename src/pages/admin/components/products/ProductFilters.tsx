import React from 'react';
// DS migration: use dashboard panel styles
import { adminInputBase, cx } from '../ui/InputStyles';
import { GameTitle, Tier } from '../../../../types';

interface ProductFiltersProps {
  searchTerm: string;
  selectedGame: string;
  selectedTier: string;
  statusFilter: string;
  games: GameTitle[];
  tiers: Tier[];
  onSearchChange: (value: string) => void;
  onGameChange: (value: string) => void;
  onTierChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  totalProducts: number;
  filteredProducts: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  selectedGame,
  selectedTier,
  statusFilter,
  games,
  tiers,
  onSearchChange,
  onGameChange,
  onTierChange,
  onStatusChange,
  totalProducts,
  filteredProducts,
}) => {
  return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg bg-surface-glass-light border border-surface-tint-light">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-cluster-md">
        {/* Search Input */}
        <div className="space-y-cluster-xs">
          <label className="block text-sm font-medium text-ds-text-secondary">
            Cari Produk
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nama atau deskripsi produk..."
            className={cx(adminInputBase, 'px-3 py-2 w-full')}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-cluster-xs">
          <label className="block text-sm font-medium text-ds-text-secondary">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className={cx(adminInputBase, 'px-3 py-2 w-full')}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>

        {/* Game Filter */}
        <div className="space-y-cluster-xs">
          <label className="block text-sm font-medium text-ds-text-secondary">
            Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => onGameChange(e.target.value)}
            className={cx(adminInputBase, 'px-3 py-2 w-full')}
          >
            <option value="">Semua Game</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        {/* Tier Filter */}
        <div className="space-y-cluster-xs">
          <label className="block text-sm font-medium text-ds-text-secondary">
            Tier
          </label>
          <select
            value={selectedTier}
            onChange={(e) => onTierChange(e.target.value)}
            className={cx(adminInputBase, 'px-3 py-2 w-full')}
          >
            <option value="">Semua Tier</option>
            {tiers.map(tier => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-stack-sm pt-stack-sm border-t border-surface-tint-light">
        <p className="text-sm text-ds-text-secondary">
          Menampilkan {filteredProducts} dari {totalProducts} produk
        </p>
      </div>
  </div>
  );
};
