import React from 'react';
import { X } from 'lucide-react';

interface ActiveFilterChipsProps {
  filters: Array<{ key: string; label: string; value: string }>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({ filters, onRemove, onClearAll }) => {
  if (!filters.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2" aria-label="Filter aktif">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onRemove(f.key)}
          className="group inline-flex items-center gap-1 px-2 sm:px-3 h-7 sm:h-8 rounded-full bg-pink-600/20 text-pink-200 text-xs font-medium border border-pink-500/40 hover:bg-pink-600/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black transition-colors"
          aria-label={`Hapus filter ${f.label}`}
        >
          <span className="truncate max-w-32 sm:max-w-none">{f.label}: {f.value}</span>
          <X size={12} className="opacity-70 group-hover:opacity-100 shrink-0" />
        </button>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 sm:px-3 h-7 sm:h-8 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-600 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Hapus semua filter"
        >
          Reset Semua
        </button>
      )}
    </div>
  );
};

export default ActiveFilterChips;
