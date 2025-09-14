import React from 'react';

export interface TierGameValues { tier_id: string; game_title: string; account_level: string; account_details: string; }
interface TierGameProps {
  values: TierGameValues;
  tiers: Array<{id:string; name:string}>; games: Array<{id:string; name:string}>;
  tiersLoading: boolean; gamesLoading: boolean;
  onChange: (patch: Partial<TierGameValues>) => void;
}
export const TierGameSection: React.FC<TierGameProps> = ({ values, tiers, games, tiersLoading, gamesLoading, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Tier & Game</h3>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Tier *</label>
        <select value={values.tier_id} disabled={tiersLoading} onChange={e=>onChange({ tier_id: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-black text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500">
          <option value="">Select Tier</option>
          {tiers.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Game Title</label>
        <select value={values.game_title} disabled={gamesLoading} onChange={e=>onChange({ game_title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-black text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500">
          <option value="">{gamesLoading ? 'Loading games...' : 'Select Game'}</option>
          {games.map(g=> <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Account Level</label>
        <input type="text" value={values.account_level} onChange={e=>onChange({ account_level: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-black text-white placeholder:text-white/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="e.g., Level 50, Master Rank, Diamond" />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Account Details</label>
        <textarea rows={4} value={values.account_details} onChange={e=>onChange({ account_details: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-black text-white placeholder:text-white/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Additional account information, items included, etc." />
      </div>
    </div>
  );
};
export default TierGameSection;
