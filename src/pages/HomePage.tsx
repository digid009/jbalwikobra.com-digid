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
// New PN homepage components
import PNHero from '../components/public/home/PNHero';
import PNFlashSalesSection from '../components/public/home/PNFlashSalesSection';
import PNPopularGamesSection from '../components/public/home/PNPopularGamesSection';
import HomeAccountCategoriesSection from '../components/home/HomeAccountCategoriesSection';
import PNCTA from '../components/public/home/PNCTA';
import { useToast } from '../components/Toast';
import BannerCarousel from '../components/BannerCarousel';

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
      {/* Error banner for partial failures */}
      {state.error && (state.flashSaleProducts.length > 0 || state.popularGames.length > 0) && (
        <div className="mx-4 mt-4 bg-amber-900/20 border border-amber-600/30 rounded-xl p-4">
          <p className="text-amber-200 text-sm">{state.error}</p>
        </div>
      )}

      {/* New PN Hero */}
      <PNHero />

      {/* Banner placed above Flash Sale */}
      <div className="px-4 mt-4">
        <BannerCarousel />
      </div>

      {/* PN Sections */}
      <PNFlashSalesSection products={state.flashSaleProducts} limit={MOBILE_CONSTANTS.FLASH_SALE_DISPLAY_LIMIT} />
      <HomeAccountCategoriesSection />
      <PNPopularGamesSection games={state.popularGames} limit={12} />
      <PNCTA />

      {/* Bottom spacing for mobile navigation */}
      <div className="h-6" />
    </div>
  );
};

export default HomePage;
