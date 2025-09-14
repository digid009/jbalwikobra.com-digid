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
import ProductCard from '../components/ProductCard'; // retained for any remaining usage
// standardClasses import removed (utility not present) – using direct container classes.
import { Zap, ShoppingBag, Clock, Star, TrendingUp, Shield, Headphones, Sparkles, Heart } from 'lucide-react';
import { IOSHero, IOSButton } from '../components/ios/IOSDesignSystem';
import BannerCarousel from '../components/BannerCarousel';
import HomeFlashSalesSection from '../components/home/HomeFlashSalesSection';
import HomeFeaturesSection from '../components/home/HomeFeaturesSection';
import HomePopularGamesSection from '../components/home/HomePopularGamesSection';
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

// Extracted subcomponents
import MobileFeatureCard from '../components/public/home/MobileFeatureCard';
import GameCategoryCard from '../components/public/home/GameCategoryCard';
import MobileLoadingSkeleton from '../components/public/home/MobileLoadingSkeleton';

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
  <div className="bg-surface-alt backdrop-blur-sm border-subtle rounded-2xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-tertiary mb-6 text-sm">{state.error}</p>
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
    <div className="max-w-7xl mx-auto">
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

      {/* Hero Section using IOSHero */}
      <IOSHero 
        title="Marketplace Akun Game #1" 
        subtitle="Jual, beli, dan rental akun game favorit dengan mudah, aman, dan terpercaya"
        backgroundGradient="from-pink-600 via-rose-600 to-purple-700"
        className="rounded-3xl overflow-hidden mx-4 mt-2"
      >
        <div className="max-w-md mx-auto">
          <div className="space-y-3">
            <Link to="/flash-sales" className="block">
              <IOSButton 
                variant="primary" 
                size="large" 
                className="w-full flex items-center justify-center space-x-2"
              >
                <Zap size={18} />
                <span>Flash Sale Hari Ini</span>
                <Sparkles size={16} />
              </IOSButton>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/products">
                <IOSButton 
                  variant="secondary" 
                  size="medium" 
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={16} />
                  <span>Belanja</span>
                </IOSButton>
              </Link>
              <Link to="/sell">
                <IOSButton 
                  variant="ghost" 
                  size="medium" 
                  className="w-full flex items-center justify-center space-x-2 text-white"
                >
                  <TrendingUp size={16} />
                  <span>Jual Akun</span>
                </IOSButton>
              </Link>
            </div>
          </div>
        </div>
      </IOSHero>

  {/* Flash Sales (Modular) */}
  <HomeFlashSalesSection products={state.flashSaleProducts} limit={MOBILE_CONSTANTS.FLASH_SALE_DISPLAY_LIMIT} />

  {/* Popular Games (Modular) */}
  <HomePopularGamesSection games={state.popularGames} limit={12} />

  {/* Features (Modular) */}
  <HomeFeaturesSection />

      {/* Pre-Footer Call To Action Section (Adopts ModernFooter UI/UX styling) */}
      <section 
        aria-labelledby="prefooter-cta-title" 
        className="relative mt-8 mb-8 mx-4 rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
      >
        {/* Background gradient orbs (mirroring ModernFooter style) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-pink-500/15 to-fuchsia-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-purple-500/15 to-blue-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 pt-10 px-4 pb-4 md:px-10 md:pb-10">
          {/* Trust badges (extracted concept from footer) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="space-y-3 max-w-xl">
              <h2 id="prefooter-cta-title" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                Siap Memulai Gaming Anda?
              </h2>
              <p className="text-tertiary text-sm md:text-base leading-relaxed max-w-lg">
                Bergabunglah dengan ribuan gamer yang sudah mempercayakan transaksi mereka kepada kami dan rasakan pengalaman marketplace akun game yang aman, cepat, dan premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/products" className="flex-1">
                  <IOSButton 
                    variant="secondary" 
                    size="large" 
                    className="w-full font-semibold"
                  >
                    Mulai Belanja Sekarang
                  </IOSButton>
                </Link>
                <Link to="/sell" className="flex-1">
                  <IOSButton 
                    variant="ghost" 
                    size="medium" 
                    className="w-full text-white/90"
                  >
                    Jual Akun Anda
                  </IOSButton>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full md:w-auto md:min-w-[260px]">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-secondary">100% Aman</span>
                </div>
                <p className="mt-2 text-xs text-tertiary leading-relaxed">Perlindungan transaksi & jaminan pengembalian.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className="text-sm font-medium text-secondary">Terpercaya</span>
                </div>
                <p className="mt-2 text-xs text-tertiary leading-relaxed">Rating tinggi & dukungan pelanggan 24/7.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors col-span-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-sm font-medium text-secondary">Premium</span>
                </div>
                <p className="mt-2 text-xs text-tertiary leading-relaxed">Kurasi akun berkualitas & penawaran eksklusif.</p>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6">
            <p className="text-faint text-xs md:text-sm tracking-wide">© {new Date().getFullYear()} JBalwikobra • Experience the future of trusted game account trading</p>
            <div className="flex gap-3 text-xs text-tertiary">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Aman</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Cepat</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacing for mobile navigation */}
  <div className="h-6"></div>
  </div>
    </div>
  );
};

export default HomePage;
