import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ProductService } from '../services/productService';
import { IOSContainer, IOSCard, IOSButton, IOSInput, IOSGrid, IOSSectionHeader } from '../components/ios/IOSDesignSystemV2';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { 
  Zap, 
  Clock, 
  Search,
  Filter,
  Star,
  TrendingDown,
  Percent
} from 'lucide-react';
import { calculateTimeRemaining, formatCurrency } from '../utils/helpers';

// Sorting and filtering types
interface FlashSalesFilters {
  searchQuery: string;
  sortBy: 'discount-desc' | 'price-asc' | 'price-desc' | 'time-asc' | 'name-asc';
  gameFilter: string;
  minDiscount: number;
}

const SORT_OPTIONS = [
  { value: 'discount-desc', label: 'Diskon Tertinggi' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'time-asc', label: 'Berakhir Segera' },
  { value: 'name-asc', label: 'Nama A-Z' }
];

const GAME_CATEGORIES = [
  { value: '', label: 'Semua Game' },
  { value: 'mobile-legends', label: 'Mobile Legends' },
  { value: 'free-fire', label: 'Free Fire' },
  { value: 'pubg-mobile', label: 'PUBG Mobile' },
  { value: 'genshin-impact', label: 'Genshin Impact' }
];

const FlashSalesPage: React.FC = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FlashSalesFilters>({
    searchQuery: '',
    sortBy: 'discount-desc',
    gameFilter: '',
    minDiscount: 0
  });

  // Load flash sale products
  useEffect(() => {
    let mounted = true;

    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const flashSalesData = await ProductService.getFlashSales();
        
        if (mounted) {
          const products = flashSalesData.map(sale => ({
            ...sale.product,
            id: sale.product.id,
            isFlashSale: true,
            price: sale.salePrice,
            originalPrice: sale.originalPrice,
            flashSaleEndTime: sale.endTime,
            stock: sale.stock || sale.product.stock,
            flashSaleId: sale.id
          }));
          
          setFlashSaleProducts(products);
        }
      } catch (err) {
        console.error('Error fetching flash sales:', err);
        if (mounted) {
          setError('Failed to load flash sale products');
          setFlashSaleProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSales();
    return () => { mounted = false; };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = flashSaleProducts.length;
    const maxDiscount = Math.max(...flashSaleProducts.map(p => 
      p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0
    ), 0);
    
    // Calculate average time remaining
    const activeProducts = flashSaleProducts.filter(p => {
      if (!p.flashSaleEndTime) return false;
      const timeRemaining = calculateTimeRemaining(p.flashSaleEndTime);
      return !timeRemaining.isExpired;
    });
    
    const avgTimeRemaining = activeProducts.length > 0 
      ? Math.round(activeProducts.reduce((acc, p) => {
          const time = calculateTimeRemaining(p.flashSaleEndTime!);
          return acc + (time.days * 24 + time.hours);
        }, 0) / activeProducts.length)
      : 0;

    return { totalProducts, maxDiscount, avgTimeRemaining };
  }, [flashSaleProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...flashSaleProducts];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.gameTitle?.toLowerCase().includes(query)
      );
    }

    // Game filter
    if (filters.gameFilter) {
      filtered = filtered.filter(p =>
        p.gameTitle?.toLowerCase().includes(filters.gameFilter.toLowerCase())
      );
    }

    // Minimum discount filter
    if (filters.minDiscount > 0) {
      filtered = filtered.filter(p => {
        const discount = p.originalPrice ? 
          Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return discount >= filters.minDiscount;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'discount-desc':
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
          return discountB - discountA;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'time-asc':
          if (!a.flashSaleEndTime || !b.flashSaleEndTime) return 0;
          return new Date(a.flashSaleEndTime).getTime() - new Date(b.flashSaleEndTime).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [flashSaleProducts, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <IOSContainer>
          <div className="py-16 space-y-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/60">Memuat flash sale...</p>
            </div>
          </div>
        </IOSContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <IOSContainer>
          <div className="py-16 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <IOSButton onClick={() => window.location.reload()}>
              Coba Lagi
            </IOSButton>
          </div>
        </IOSContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-600 via-purple-700 to-indigo-800 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <IOSContainer className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Flash Sale Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl mb-8">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Flash Sale</h3>
                <p className="text-pink-200 text-sm">Diskon hingga {stats.maxDiscount}% untuk akun game terpilih!</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Flash Sale
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Diskon hingga {stats.maxDiscount}% untuk akun game terpilih!<br />
              Buruan, stok dan waktu terbatas!
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <IOSCard variant="default" className="bg-black/30 backdrop-blur-sm border border-white/20 text-center">
                <div className="p-4">
                  <div className="flex items-center justify-center gap-2 text-pink-400 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats.totalProducts}</span>
                  </div>
                  <div className="text-sm text-white/80">Produk Sale</div>
                </div>
              </IOSCard>
              
              <IOSCard variant="default" className="bg-black/30 backdrop-blur-sm border border-white/20 text-center">
                <div className="p-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                    <Percent className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats.maxDiscount}%</span>
                  </div>
                  <div className="text-sm text-white/80">Max Diskon</div>
                </div>
              </IOSCard>
              
              <IOSCard variant="default" className="bg-black/30 backdrop-blur-sm border border-white/20 text-center col-span-2 md:col-span-1">
                <div className="p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-bold">{stats.avgTimeRemaining}j</span>
                  </div>
                  <div className="text-sm text-white/80">Rata-rata Tersisa</div>
                </div>
              </IOSCard>
            </div>
          </div>
        </IOSContainer>
      </div>

      {/* Filters & Search */}
      <div className="bg-gradient-to-b from-pink-600/10 to-transparent py-8">
        <IOSContainer>
          <IOSCard variant="elevated" className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari produk flash sales..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
              {/* Sort Dropdown */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="bg-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Game Filter */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filters.gameFilter}
                  onChange={(e) => setFilters(prev => ({ ...prev, gameFilter: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  {GAME_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value} className="bg-black">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Discount Filter */}
              <div className="min-w-[160px]">
                <select
                  value={filters.minDiscount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minDiscount: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  <option value={0} className="bg-black">Semua Diskon</option>
                  <option value={10} className="bg-black">Min 10%</option>
                  <option value={20} className="bg-black">Min 20%</option>
                  <option value={30} className="bg-black">Min 30%</option>
                  <option value={50} className="bg-black">Min 50%</option>
                </select>
              </div>
            </div>
          </IOSCard>
        </IOSContainer>
      </div>

      {/* Products Grid */}
      <div className="py-12">
        <IOSContainer>
          {filteredProducts.length > 0 ? (
            <IOSGrid cols={2} gap="md" className="md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showFlashSaleTimer={true}
                  className="h-full"
                />
              ))}
            </IOSGrid>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-white/60 mb-6">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <IOSButton 
                variant="secondary"
                onClick={() => setFilters({
                  searchQuery: '',
                  sortBy: 'discount-desc',
                  gameFilter: '',
                  minDiscount: 0
                })}
              >
                Reset Filter
              </IOSButton>
            </div>
          )}
        </IOSContainer>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-b from-transparent to-pink-600/5">
        <IOSContainer>
          <IOSSectionHeader 
            title="Cara Kerja Flash Sale"
            subtitle="Panduan mudah mendapatkan akun game dengan harga terbaik"
            className="mb-12"
          />
          
          <IOSGrid cols={1} gap="lg" className="md:grid-cols-3">
            <IOSCard variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Waktu Terbatas
              </h3>
              <p className="text-white/70">
                Flash sale berlangsung dalam waktu terbatas. Pantau countdown timer untuk tidak melewatkan kesempatan.
              </p>
            </IOSCard>

            <IOSCard variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Stok Terbatas  
              </h3>
              <p className="text-white/70">
                Jumlah akun yang dijual dengan harga flash sale sangat terbatas. First come, first served!
              </p>
            </IOSCard>

            <IOSCard variant="elevated" className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Diskon Maksimal
              </h3>
              <p className="text-white/70">
                Dapatkan diskon hingga {stats.maxDiscount}% dari harga normal. Kesempatan terbaik untuk upgrade akun game Anda.
              </p>
            </IOSCard>
          </IOSGrid>
        </IOSContainer>
      </div>
    </div>
  );
};

export default FlashSalesPage;
