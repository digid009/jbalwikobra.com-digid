import React, { useState, useEffect, useMemo } from 'react';
import { Product, GameTitle } from '../types';
import { ProductService } from '../services/productService';
import { IOSContainer, IOSCard, IOSGrid, IOSInput, IOSButton, IOSSectionHeader } from '../components/ios/IOSDesignSystemV2';
import { Search, ChevronDown, Flame, Percent, Filter, Clock } from 'lucide-react';
import FlashSaleProductCard from '../components/flash-sales/FlashSaleProductCard';

interface FlashSalesFilters {
  searchQuery: string;
  sortBy: 'discount-desc' | 'price-asc' | 'price-desc' | 'time-asc' | 'name-asc';
  gameFilter: string;
}

const FlashSalesPage: React.FC = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FlashSalesFilters>({
    searchQuery: '',
    sortBy: 'discount-desc',
    gameFilter: ''
  });

  // Load flash sale products
  useEffect(() => {
    let mounted = true;

    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 FlashSalesPage: Fetching flash sales data...');
        const flashSalesData = await ProductService.getFlashSales();
        console.log('📊 FlashSalesPage: Flash sales data received:', flashSalesData);
        
        if (mounted) {
          // Map flash sales data to products with robust snake/camel fallback
          const seen = new Set<string>();
          const products = flashSalesData.map(sale => {
            const salePrice = sale.salePrice ?? (sale as any).sale_price ?? sale.product.price;
            const originalPrice = sale.originalPrice ?? (sale as any).original_price ?? sale.product.originalPrice ?? (sale.product as any).original_price ?? salePrice;
            const endTime = sale.endTime ?? (sale as any).end_time ?? sale.product.flashSaleEndTime;
            const productId = sale.product.id;
            const mapped = {
              ...sale.product,
              id: productId,
              isFlashSale: true,
              price: salePrice,
              originalPrice,
              flashSaleEndTime: endTime,
              stock: sale.stock ?? (sale as any).stock ?? sale.product.stock,
              flashSaleId: sale.id
            } as Product;
            console.log('🛠 FlashSale map', {
              flashSaleId: sale.id,
              productId,
              price: mapped.price,
              originalPrice: mapped.originalPrice,
              endTime: mapped.flashSaleEndTime
            });
            return mapped;
          }).filter(p => {
            if (seen.has(p.id)) return false; // dedupe products if any duplicate flash sale rows
            seen.add(p.id);
            return true;
          });

          console.log(`✅ FlashSalesPage: Mapped ${products.length} unique flash sale products`);
          setFlashSaleProducts(products);
        }
      } catch (err) {
        console.error('❌ FlashSalesPage: Error fetching flash sales:', err);
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
    // Also fetch game titles for dynamic filter buttons
    ProductService.getGameTitles()
      .then(titles => { if (mounted) setGameTitles(titles); })
      .catch(e => console.warn('FlashSalesPage game titles fetch failed', e));
    return () => { mounted = false; };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = flashSaleProducts.length;
    const maxDiscount = flashSaleProducts.reduce((acc, p) => {
      if (p.originalPrice && p.originalPrice > p.price) {
        const d = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return d > acc ? d : acc;
      }
      return acc;
    }, 0);
    return { totalProducts, maxDiscount };
  }, [flashSaleProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...flashSaleProducts];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
  product.name.toLowerCase().includes(query) ||
  product.gameTitleData?.name?.toLowerCase().includes(query) ||
  product.description?.toLowerCase().includes(query)
      );
    }

    // Apply game filter using slug matching
    if (filters.gameFilter) {
      const target = filters.gameFilter;
      const slugify = (str: string) => str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      filtered = filtered.filter(product => {
  const slugFromData = product.gameTitleData?.slug;
  return slugFromData === target;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'discount-desc':
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
          return discountB - discountA;
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

  return (
    <div className="min-h-screen bg-black pb-16 pt-6">
      <IOSContainer size="xl">
        <IOSSectionHeader
          title="Flash Sale"
          subtitle="Diskon spesial waktu terbatas – dapatkan akun terbaik sekarang juga!"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <IOSCard padding="lg" className="flex flex-col items-center justify-center gap-3 text-center">
            <Flame className="w-8 h-8 text-pink-500" />
            <div className="text-3xl font-bold text-white tracking-tight">{stats.totalProducts}</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Produk</div>
          </IOSCard>
          <IOSCard padding="lg" className="flex flex-col items-center justify-center gap-3 text-center">
            <Percent className="w-8 h-8 text-pink-500" />
            <div className="text-3xl font-bold text-white tracking-tight">{stats.maxDiscount}%</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Diskon Maks</div>
          </IOSCard>
          <IOSCard padding="lg" className="hidden md:flex flex-col items-center justify-center gap-3 text-center">
            <Clock className="w-8 h-8 text-pink-500" />
            <div className="text-3xl font-bold text-white tracking-tight">Real-Time</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Countdown</div>
          </IOSCard>
          <IOSCard padding="lg" className="hidden md:flex flex-col items-center justify-center gap-3 text-center">
            <Filter className="w-8 h-8 text-pink-500" />
            <div className="text-3xl font-bold text-white tracking-tight">Filter</div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Dinamis</div>
          </IOSCard>
        </div>

        {/* Game Filter Only */}
        <IOSCard padding="lg" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <IOSInput
                placeholder="Cari produk flash sale..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                className="h-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ id: 'all', name: 'Semua Game', slug: '' }, ...gameTitles].map(gt => {
                const active = filters.gameFilter === gt.slug;
                return (
                  <button
                    key={gt.id}
                    onClick={() => setFilters(f => ({ ...f, gameFilter: gt.slug }))}
                    className={`px-5 h-11 min-w-[108px] rounded-2xl text-sm font-semibold border inline-flex items-center justify-center select-none tracking-wide focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 ${active ? 'bg-pink-600 text-white border-pink-400 shadow shadow-pink-500/30' : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white active:scale-[0.97]'}`}
                    aria-pressed={active}
                    aria-label={`Filter game ${gt.name}`}
                  >
                    {gt.name}
                  </button>
                );
              })}
            </div>
          </div>
        </IOSCard>

        {/* Products */}
        {loading ? (
          <div className="py-24 text-center text-zinc-400">Memuat produk...</div>
        ) : error ? (
          <div className="py-24 text-center text-red-400">{error}</div>
        ) : (
          <IOSGrid cols={4} gap="lg" className="pb-4">
            {filteredAndSortedProducts.map(p => (
              <FlashSaleProductCard key={p.id} product={p} />
            ))}
          </IOSGrid>
        )}
      </IOSContainer>
    </div>
  );
};

export default FlashSalesPage;
