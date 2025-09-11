/**
 * HomePage - Mobile-First Refactored Version
 * Following iOS Human Interface Guidelines & Android Material Design 3
 * 
 * Key Improvements:
 * - Native-like spacing and layout patterns
 * - Optimized touch targets (44dp minimum)
 * - Proper content hierarchy and visual weight
 * - Reduced cognitive load with clear sections
 * - Improved accessibility and semantic structure
 * - Performance optimizations for mobile devices
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { 
  Zap, 
  ShoppingBag, 
  Clock, 
  Star,
  TrendingUp,
  Shield,
  Headphones,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';
import { useToast } from '../components/Toast';

// Mobile-first constants following platform guidelines
const MOBILE_CONSTANTS = {
  // iOS/Android recommended touch target sizes
  MIN_TOUCH_TARGET: 44, // 44dp/pt minimum touch target
  CONTENT_PADDING: 16, // Standard content padding
  SECTION_SPACING: 24, // Section spacing
  CARD_SPACING: 12, // Card spacing
  
  // Performance optimizations
  POPULAR_GAMES_LIMIT: 20,
  FLASH_SALE_DISPLAY_LIMIT: 8, // Reduced for mobile performance
  CACHE_DURATION: 5 * 60 * 1000,
  
  // Animation timing following platform standards
  ANIMATIONS: {
    FAST: 200, // Quick interactions
    STANDARD: 300, // Standard transitions
    SLOW: 500, // Complex transitions
  }
} as const;

interface HomePageState {
  flashSaleProducts: Product[];
  popularGames: Array<{ 
    id: string; 
    name: string; 
    slug: string; 
    logoUrl?: string | null; 
    count: number 
  }>;
  loading: boolean;
  error: string | null;
}

// Mobile-optimized feature card following card design patterns
const MobileFeatureCard = React.memo(({ 
  icon: Icon, 
  title, 
  description,
  delay = 0 
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  delay?: number;
}) => (
  <div 
    className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Icon container with proper sizing for mobile */}
    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
      <Icon className="text-white" size={28} />
    </div>
    
    {/* Content with optimized typography hierarchy */}
    <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
  </div>
));

MobileFeatureCard.displayName = 'MobileFeatureCard';

// Mobile-optimized game category card
const GameCategoryCard = React.memo(({ 
  game, 
  index 
}: { 
  game: any; 
  index: number; 
}) => (
  <Link
    to={`/products?game=${encodeURIComponent(game.name)}`}
    className="block group"
  >
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 hover:border-pink-500/30 transition-all duration-300 group-hover:scale-[1.02]">
      {/* Game logo with consistent sizing */}
      <div className="aspect-square w-full bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        {game.logoUrl ? (
          <img 
            src={game.logoUrl} 
            alt={game.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <TrendingUp className="text-white" size={24} />
        )}
      </div>
      
      {/* Game info with proper text hierarchy */}
      <h3 className="font-medium text-white mb-1 text-sm leading-tight group-hover:text-pink-400 transition-colors">
        {game.name}
      </h3>
      <p className="text-xs text-zinc-500">{game.count} akun</p>
    </div>
  </Link>
));

GameCategoryCard.displayName = 'GameCategoryCard';

// Mobile-optimized loading skeleton
const MobileLoadingSkeleton = React.memo(() => (
  <div className="min-h-screen bg-black">
    {/* Header skeleton */}
    <div className="px-4 pt-6 pb-4">
      <div className="h-8 bg-zinc-800 rounded-lg w-3/4 mb-4 animate-pulse"></div>
      <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
    </div>
    
    {/* Banner skeleton */}
    <div className="px-4 mb-6">
      <div className="h-48 bg-zinc-800 rounded-2xl animate-pulse"></div>
    </div>
    
    {/* Content sections skeleton */}
    <div className="px-4 space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-32 bg-zinc-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

MobileLoadingSkeleton.displayName = 'MobileLoadingSkeleton';

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [state, setState] = useState<HomePageState>({
    flashSaleProducts: [],
    popularGames: [],
    loading: true,
    error: null
  });

  // Platform-optimized features with better mobile UX focus
  const features = useMemo(() => [
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Sistem keamanan berlapis dengan jaminan uang kembali 100%'
    },
    {
      icon: Clock,
      title: 'Pengiriman Instant',
      description: 'Akun dikirim dalam hitungan menit dengan notifikasi real-time'
    },
    {
      icon: Star,
      title: 'Kualitas Premium',
      description: 'Akun terverifikasi dengan rating tinggi dan quality assurance'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Customer service responsif via WhatsApp dan live chat'
    }
  ], []);

  // Optimized data fetching
  const fetchHomeData = useCallback(async (signal: AbortSignal) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { ProductService } = await import('../services/productService');
      
      if (signal.aborted) return;

      const [flashSalesResult, popularGamesResult] = await Promise.allSettled([
        ProductService.getFlashSales(),
        ProductService.getPopularGames(MOBILE_CONSTANTS.POPULAR_GAMES_LIMIT)
      ]);

      if (signal.aborted) return;

      const flashSaleProducts = flashSalesResult.status === 'fulfilled' 
        ? flashSalesResult.value.map(sale => sale.product)
        : [];
      
      const popularGames = popularGamesResult.status === 'fulfilled'
        ? popularGamesResult.value
        : [];

      const hasErrors = flashSalesResult.status === 'rejected' || popularGamesResult.status === 'rejected';
      
      setState({
        flashSaleProducts,
        popularGames,
        loading: false,
        error: hasErrors ? 'Beberapa data gagal dimuat' : null
      });

      if (hasErrors) {
        showToast('Beberapa konten mungkin tidak tersedia', 'info');
      }

    } catch (error) {
      if (signal.aborted) return;
      
      console.error('HomePage data fetch error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data. Silakan refresh halaman.'
      }));
      showToast('Gagal memuat halaman. Silakan coba lagi.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const controller = new AbortController();
    
    const timer = setTimeout(() => {
      fetchHomeData(controller.signal);
    }, MOBILE_CONSTANTS.ANIMATIONS.FAST);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [fetchHomeData]);

  const handleRetry = useCallback(() => {
    const controller = new AbortController();
    fetchHomeData(controller.signal);
  }, [fetchHomeData]);

  if (state.loading) {
    return <MobileLoadingSkeleton />;
  }

  if (state.error && state.flashSaleProducts.length === 0 && state.popularGames.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-zinc-400 mb-6 text-sm">{state.error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Error banner for partial failures */}
      {state.error && (state.flashSaleProducts.length > 0 || state.popularGames.length > 0) && (
        <div className="mx-4 mt-4 bg-amber-900/20 border border-amber-600/30 rounded-xl p-4">
          <p className="text-amber-200 text-sm">{state.error}</p>
        </div>
      )}

      {/* Banner Carousel */}
      <section className="px-4 py-6">
        <BannerCarousel />
      </section>

      {/* Hero Section - Mobile-first design */}
      <section className="px-4 py-8 text-center">
        <div className="max-w-md mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Marketplace Akun Game
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500"> #1</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Jual, beli, dan rental akun game favorit dengan mudah, aman, dan terpercaya
          </p>
        </div>

        {/* CTA Buttons - Optimized for mobile touch */}
        <div className="space-y-3 max-w-sm mx-auto">
          <Link to="/flash-sales" className="block">
            <button 
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-pink-500/25"
              style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
            >
              <Zap size={20} />
              <span>Flash Sale Hari Ini</span>
              <Sparkles size={16} />
            </button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/products">
              <button 
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 border border-zinc-700"
                style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
              >
                <ShoppingBag size={18} />
                <span className="text-sm">Belanja</span>
              </button>
            </Link>
            
            <Link to="/sell">
              <button 
                className="w-full bg-white text-black hover:bg-zinc-100 font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
                style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
              >
                <TrendingUp size={18} />
                <span className="text-sm">Jual Akun</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      {state.flashSaleProducts.length > 0 && (
        <section className="py-8">
          <div className="px-4 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Flash Sale</h2>
              <p className="text-zinc-400 text-sm">Diskon hingga 70% - Terbatas!</p>
            </div>
            <Link 
              to="/flash-sales"
              className="flex items-center space-x-1 text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 px-4 pb-2">
              {state.flashSaleProducts.slice(0, MOBILE_CONSTANTS.FLASH_SALE_DISPLAY_LIMIT).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64">
                  <ProductCard
                    product={product}
                    showFlashSaleTimer={true}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Mengapa Pilih Kami?</h2>
          <p className="text-zinc-400 text-sm">Platform terdepan dengan jaminan keamanan terbaik</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <MobileFeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </section>

      {/* Game Categories */}
      <section className="px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Game Populer</h2>
          <p className="text-zinc-400 text-sm">Pilih dari berbagai game populer</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {state.popularGames.slice(0, 12).map((game, index) => (
            <GameCategoryCard 
              key={game.id}
              game={game}
              index={index}
            />
          ))}
        </div>

        {state.popularGames.length > 12 && (
          <div className="text-center mt-6">
            <Link to="/products">
              <button className="text-pink-400 hover:text-pink-300 font-medium text-sm flex items-center space-x-1 mx-auto transition-colors">
                <span>Lihat Game Lainnya</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-12">
        <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700 rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-3">
              Siap Memulai Gaming Anda?
            </h2>
            <p className="text-pink-100 mb-6 text-sm leading-relaxed">
              Bergabunglah dengan ribuan gamer yang sudah mempercayakan transaksi mereka kepada kami
            </p>
            
            <div className="space-y-3 max-w-xs mx-auto">
              <Link to="/products" className="block">
                <button 
                  className="w-full bg-white text-pink-600 hover:bg-pink-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                  style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
                >
                  Mulai Belanja Sekarang
                </button>
              </Link>
              
              <Link to="/sell" className="block">
                <button 
                  className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-medium py-3 px-6 rounded-xl border border-white/30 transition-all duration-200"
                  style={{ minHeight: MOBILE_CONSTANTS.MIN_TOUCH_TARGET }}
                >
                  Jual Akun Anda
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-6"></div>
    </div>
  );
};

export default HomePage;
