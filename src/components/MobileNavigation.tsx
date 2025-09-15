import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Plus, MessageSquare, Package, DollarSign } from 'lucide-react';
import CobraIcon from './icons/CobraIcon';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { iosDesignTokens } from './ios/IOSDesignSystemV2';
import MobileNavItem, { MobileNavItemConfig } from './mobile/MobileNavItem';

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
      {/* iOS Design System V2 - Mobile Bottom Navigation */}
      <nav 
        data-fixed="bottom-nav" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: '16px' }}
      >
  <div className="mobile-nav-surface mobile-nav-appear mx-3 mb-0 px-4 pt-3 rounded-3xl" style={{ paddingBottom: '16px' }}>
          <div className="relative flex items-center justify-around">
            {navigationItems.map(item => (
              <MobileNavItem key={item.path} item={item} isActive={isActiveTab(item.path)} touchSize={NAVIGATION_CONSTANTS.MIN_TOUCH_TARGET} />
            ))}
          </div>
        </div>

        {/* iOS Safe Area Spacer */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Content Spacer for proper page layout */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default MobileNavigation;
