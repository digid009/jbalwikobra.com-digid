import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Package, DollarSign } from 'lucide-react';
import CobraIcon from './icons/CobraIcon';
import { useAuth } from '../contexts/TraditionalAuthContext';

// Mobile-First iOS Design System V2 Navigation Constants
const NAVIGATION_CONSTANTS = {
  // iOS/Android recommended specifications - Enhanced for Mobile-First
  MIN_TOUCH_TARGET: 48, // Increased from 44 for better mobile accessibility
  ICON_SIZE: {
    SMALL: 18,
    REGULAR: 22,   // Increased from 20
    SPECIAL: 24,   // Special center item
    LARGE: 26
  },
  BORDER_RADIUS: {
    ITEM: 16,      // Base mobile
    ITEM_SM: 12,   // Smaller on desktop
    CONTAINER: 24, // Base mobile
    CONTAINER_SM: 16, // Smaller on desktop  
    SPECIAL: 20
  },
  SPACING: {
    CONTAINER_HORIZONTAL: 8,  // Mobile-first: tighter
    CONTAINER_HORIZONTAL_SM: 12, // Desktop: more space
    CONTAINER_VERTICAL: 8,    // Mobile-first: tighter  
    CONTAINER_VERTICAL_SM: 12, // Desktop: more space
    ITEM_GAP: 4,              // Mobile-first: minimal gap
    ITEM_GAP_SM: 8,           // Desktop: more gap
    VERTICAL_PADDING: 8       // Internal item padding
  },
  SAFE_AREA: {
    BOTTOM: 8,     // Minimum for older devices
    BOTTOM_SM: 12  // More space on larger screens
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

  // Navigation items - Enhanced for mobile-first with special Feed item
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
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      >
        {/* Enhanced Mobile-First Container */}
        <div className="mx-2 sm:mx-4 mb-1 sm:mb-2 rounded-3xl sm:rounded-2xl border border-white/15 bg-black/75 sm:bg-black/65 backdrop-blur-2xl px-2 sm:px-3 pt-3 sm:pt-3 pb-[calc(env(safe-area-inset-bottom,8px)+10px)] sm:pb-[calc(env(safe-area-inset-bottom,12px)+12px)] shadow-[0_4px_28px_-8px_rgba(255,0,128,0.45)] sm:shadow-[0_2px_20px_-4px_rgba(255,0,128,0.35)]">
          <ul className="flex items-center justify-between gap-1 sm:gap-2" role="tablist">
            {navigationItems.map(item => {
              const active = isActiveTab(item.path);
              const Icon = item.icon;
              
              // Enhanced mobile-first styling
              const baseClasses = 'flex flex-col items-center justify-center gap-1 select-none relative';
              const activeClasses = 'text-white bg-gradient-to-br from-pink-500/25 to-fuchsia-500/25 border border-pink-500/50 shadow-[0_3px_16px_-6px_rgba(244,114,182,0.7)]';
              const inactiveClasses = 'text-white/65 hover:text-white/90 hover:bg-white/10 border border-transparent hover:border-white/20';
              const specialClasses = item.isSpecial ? 
                'bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 text-white shadow-[0_6px_20px_-6px_rgba(244,114,182,0.9)] border-2 border-pink-400/40 scale-110 hover:scale-115' : '';
              const common = 'transition-all duration-350 ease-out active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60';
              
              return (
                <li key={item.path} role="presentation" className="flex-1">
                  <Link
                    to={item.path}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      baseClasses,
                      common,
                      'rounded-2xl sm:rounded-xl',
                      item.isSpecial ? specialClasses : (active ? activeClasses : inactiveClasses),
                      'h-16 sm:h-14 px-1 sm:px-2'
                    ].join(' ')}
                    style={{ 
                      minHeight: NAVIGATION_CONSTANTS.MIN_TOUCH_TARGET, 
                      minWidth: NAVIGATION_CONSTANTS.MIN_TOUCH_TARGET 
                    }}
                  >
                    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${active && !item.isSpecial ? 'scale-105' : ''} ${item.isSpecial ? 'scale-105' : ''} transition-all duration-300`}> 
                      <div className={item.isSpecial ? 'relative' : ''}>
                        <Icon 
                          size={item.isSpecial ? NAVIGATION_CONSTANTS.ICON_SIZE.SPECIAL : NAVIGATION_CONSTANTS.ICON_SIZE.REGULAR} 
                          strokeWidth={active || item.isSpecial ? 2.5 : 2} 
                          className={item.isSpecial ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : ''}
                        />
                        {/* Special pulse effect for CobraIcon */}
                        {item.isSpecial && (
                          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                        )}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] leading-tight font-medium ${item.isSpecial ? 'font-semibold' : ''} tracking-wide`}>
                        {item.label}
                      </span>
                    </div>
                    {/* Enhanced active indicator */}
                    {active && !item.isSpecial && (
                      <span className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.9)] animate-pulse" />
                    )}
                    {/* Special glow effect for special item */}
                    {item.isSpecial && (
                      <div className="absolute inset-0 rounded-2xl sm:rounded-xl bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 -z-10 blur-sm" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      {/* Enhanced Spacer with responsive height - mobile-first approach */}
      <div className="h-24 sm:h-20 lg:hidden" />
    </>
  );
};

export default MobileNavigation;
