import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Package, DollarSign } from 'lucide-react';
import CobraIcon from './icons/CobraIcon';
import { useAuth } from '../contexts/TraditionalAuthContext';

// Mobile-First iOS Design System V2 Navigation Constants
const NAVIGATION_CONSTANTS = {
  // iOS/Android recommended specifications
  MIN_TOUCH_TARGET: 44, // Minimum touch target size
  ICON_SIZE: {
    REGULAR: 20,
    SPECIAL: 24,
    LARGE: 28
  },
  BORDER_RADIUS: {
    ITEM: 16,
    CONTAINER: 24,
    SPECIAL: 28
  },
  SPACING: {
    CONTAINER_PADDING: 16,
    ITEM_GAP: 8,
    VERTICAL_PADDING: 12
  },
  SAFE_AREA: {
    BOTTOM: 34 // iPhone safe area
  }
} as const;

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isSpecial?: boolean;
  badge?: number;
  animateBadge?: boolean;
}

/**
 * MobileNavigation - iOS Design System V2
 * 
 * Features:
 * - Mobile-first responsive design
 * - Native iOS-like interactions and animations
 * - Glassmorphism effects with proper backdrop blur
 * - Optimized touch targets for accessibility
 * - Smooth micro-interactions
 * - Safe area support for modern devices
 */
const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Order adjusted: Feed in center (index 2), special Sell stays index 3 visually if needed else center
  const navigationItems: NavigationItem[] = [
    { path: '/', label: 'Beranda', icon: Home, activeIcon: Home },
    { path: '/products', label: 'Produk', icon: Package, activeIcon: Package },
    { path: '/feed', label: 'Feed', icon: CobraIcon, activeIcon: CobraIcon, isSpecial: true },
    { path: '/sell', label: 'Jual', icon: DollarSign, activeIcon: DollarSign },
    { path: user ? '/profile' : '/auth', label: user ? 'Profil' : 'Masuk', icon: User, activeIcon: User },
  ];

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isActiveTab = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/auth' && !user) {
      return location.pathname.includes('/auth') || location.pathname.includes('/login') || location.pathname.includes('/register');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe"
      >
        <div className="mx-3 mb-1 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-3 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0)+6px)] shadow-[0_2px_18px_-4px_rgba(255,0,128,0.35)]">
          <ul className="flex items-end justify-between gap-0.5" role="tablist">
            {navigationItems.map(item => {
              const active = isActiveTab(item.path);
              const Icon = item.icon;
              const baseClasses = 'flex flex-col items-center justify-center gap-1 select-none';
              const activeClasses = 'text-white bg-gradient-to-br from-pink-500/15 to-fuchsia-500/15 border border-pink-500/30';
              const inactiveClasses = 'text-white/55 hover:text-white/80 hover:bg-white/5';
              const common = 'transition-all duration-300 ease-out';
              return (
                <li key={item.path} role="presentation" className="flex-1">
                  <Link
                    to={item.path}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      baseClasses,
                      common,
                      'relative rounded-2xl',
                      active ? activeClasses : inactiveClasses,
                      'h-12 px-2'
                    ].join(' ')}
                    style={{ minHeight: NAVIGATION_CONSTANTS.MIN_TOUCH_TARGET }}
                  >
                    <div className={`flex flex-col items-center ${active ? 'scale-105' : ''} transition-all`}> 
                      <Icon size={20} strokeWidth={active ? 2.3 : 2} />
                      <span className="mt-0.5 text-[10px] leading-tight font-medium">{item.label}</span>
                    </div>
                    {active && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_4px_rgba(244,114,182,0.8)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="h-1" />
      </nav>
      {/* Spacer to avoid content overlap (height matches nav total) */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default MobileNavigation;
