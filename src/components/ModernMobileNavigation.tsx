import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, User, Plus, MessageSquare, Package, Search } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';
import MobileNavItem from './mobile/MobileNavItem';

// Mobile-First iOS Design System V2 Navigation Constants
const NAVIGATION_CONSTANTS = {
  // iOS/Android recommended specifications
  MIN_TOUCH_TARGET: 44, // Minimum touch target size
  ICON_SIZE: {
    REGULAR: 16,
    SPECIAL: 20,
    LARGE: 24
  },
  BORDER_RADIUS: {
    ITEM: 16,
    CONTAINER: 12,
    SPECIAL: 12
  },
  SPACING: {
    CONTAINER_PADDING: 12,
    ITEM_GAP: 8,
    VERTICAL_PADDING: 12
  },
  SAFE_AREA: {
    BOTTOM: 14 // iPhone safe area
  }
} as const;

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isSpecial?: boolean;
  badge?: number;
}

/**
 * ModernMobileNavigation - iOS Design System V2
 * 
 * Features:
 * - Mobile-first responsive design
 * - Native iOS-like interactions and animations
 * - Glassmorphism effects with proper backdrop blur
 * - Optimized touch targets for accessibility
 * - Smooth micro-interactions
 * - Safe area support for modern devices
 */

const ModernMobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/sell', label: 'Jual', icon: Plus, isSpecial: true },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/chat', label: 'Chat', icon: MessageSquare, badge: 3 },
    { path: '/profile', label: 'Profil', icon: User }
  ];

  const isActiveTab = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav data-fixed="bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
  <div className="mobile-nav-surface mobile-nav-appear mx-4 mb-0 px-3 pt-3" style={{ paddingBottom: '16px' }}>
          <div className="relative flex items-center justify-around">
            {navigationItems.map(item => (
              <MobileNavItem
                key={item.path}
                item={item}
                isActive={isActiveTab(item.path)}
                touchSize={NAVIGATION_CONSTANTS.MIN_TOUCH_TARGET}
              />
            ))}
          </div>
        </div>
        <div className="h-safe-area-inset-bottom" />
      </nav>
      <div className="h-24 lg:hidden" />
      <QuickActionButton />
    </>
  );
};

// (Optional) Quick Action Floating Button removed for simplification in this refactor.
const QuickActionButton: React.FC = () => null;

export default ModernMobileNavigation;
