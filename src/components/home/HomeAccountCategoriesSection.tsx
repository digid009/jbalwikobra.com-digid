import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Crown, UserPlus } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { PNSectionHeader, PNCard, PNContainer } from '../ui/PinkNeonDesignSystem';

const CategorySkeleton: React.FC = () => (
  <div className="min-w-[160px] snap-start">
    <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-28 w-[160px]" />
  </div>
);

const HomeAccountCategoriesSection: React.FC = () => {
  const { categories, loading } = useCategories();

  // Function to determine icon based on category name
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('jasa') || name.includes('posting') || name.includes('service')) {
      return UserPlus;
    }
    return Crown;
  };

  if (loading) {
    return (
      <section className="px-4 py-6">
        <PNSectionHeader
          title="Kategori Akun"
          subtitle="Berbagai pilihan untuk Anda"
          padX={false}
          action={
            <Link to="/products" className="text-sm text-pink-300 hover:text-pink-200 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          }
        />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-1 pb-2 snap-x snap-mandatory">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="px-4 py-6">
      <PNContainer>
        <PNSectionHeader
          title="Kategori Akun"
          subtitle="Berbagai pilihan akun untuk Anda"
          padX={false}
          action={
            <Link to="/products" className="text-sm text-pink-300 hover:text-pink-200 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          }
        />
      </PNContainer>
      {/* Unified responsive container */}
      <PNContainer>
        <div className="grid gap-3 px-1 pb-2 auto-cols-[160px] grid-flow-col overflow-x-auto snap-x snap-mandatory scrollbar-hide md:auto-cols-auto md:grid-flow-row md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:overflow-x-visible md:px-0">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?search=${encodeURIComponent(c.name)}`}
              className="block min-w-[160px] md:min-w-0 snap-start group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 rounded-2xl"
            >
              <PNCard className="p-4 hover:bg-white/10 transition-colors h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 via-pink-500 to-fuchsia-600 border border-pink-500/30 flex items-center justify-center">
                    {React.createElement(getCategoryIcon(c.name), { size: 20, className: "text-white" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-gray-400 truncate">Lihat akun {c.name}</div>
                  </div>
                </div>
              </PNCard>
            </Link>
          ))}
        </div>
      </PNContainer>
    </section>
  );
};

export default React.memo(HomeAccountCategoriesSection);
