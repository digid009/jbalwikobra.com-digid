import React from 'react';

type FeedFilter = 'semua' | 'pengumuman' | 'review';

interface FeedTabsProps {
  active: FeedFilter;
  counts: { semua: number; pengumuman: number; review: number };
  onChange: (f: FeedFilter) => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ active, counts, onChange }) => {
  const TabButton: React.FC<{ label: string; active: boolean; count?: number; onClick: () => void }>
    = ({ label, active, count, onClick }) => (
    <button
      onClick={onClick}
      className={[
        'relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 flex-1 text-sm border',
        active
          ? 'bg-gradient-to-r from-pink-500/30 to-fuchsia-500/30 text-pink-100 border-pink-500/30 shadow-lg shadow-pink-500/10'
          : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && (
        <span className={[
          'text-xs px-2 py-0.5 rounded-full border',
          active ? 'bg-pink-500/20 border-pink-400/40 text-pink-100' : 'bg-white/5 border-white/10 text-white/70'
        ].join(' ')}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div id="content-tabs" className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 lg:p-4 border border-white/10 shadow-2xl">
      <div className="flex gap-2 lg:gap-3">
        <TabButton label="Semua" active={active === 'semua'} count={counts.semua} onClick={() => onChange('semua')} />
        <TabButton label="Pengumuman" active={active === 'pengumuman'} count={counts.pengumuman} onClick={() => onChange('pengumuman')} />
        <TabButton label="Review" active={active === 'review'} count={counts.review} onClick={() => onChange('review')} />
      </div>
    </div>
  );
};

export default FeedTabs;
