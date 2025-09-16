import React from 'react';
import { useCategories } from '../../hooks/useCategories';

interface ProductsCategoriesTabsProps {
  activeSearch: string;
  onSelectCategory: (name: string) => void;
}

export const ProductsCategoriesTabs: React.FC<ProductsCategoriesTabsProps> = ({ activeSearch, onSelectCategory }) => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="px-4">
        <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-24 rounded-full bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={() => onSelectCategory('')}
            className={`h-9 px-[14px] rounded-full text-sm font-semibold border whitespace-nowrap ${
              activeSearch === ''
                ? 'bg-pink-600 text-white border-pink-400 shadow shadow-pink-500/20'
                : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            Semua
          </button>
          {categories.map((c) => {
            const active = activeSearch?.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.name)}
                className={`h-9 px-[14px] rounded-full text-sm font-semibold border whitespace-nowrap ${
                  active
                    ? 'bg-pink-600 text-white border-pink-400 shadow shadow-pink-500/20'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
                aria-pressed={active}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductsCategoriesTabs;