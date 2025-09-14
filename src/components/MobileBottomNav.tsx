import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Plus, MessageSquare, DollarSign } from 'lucide-react';
import CobraIcon from './icons/CobraIcon';
import MobileNavItem from './mobile/MobileNavItem';
import { useAuth } from '../contexts/TraditionalAuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Beranda', icon: Home, activeIcon: Home },
    { path: '/products', label: 'Cari', icon: Search, activeIcon: Search },
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
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav data-fixed="bottom-nav" className="nav-bottom lg:hidden fixed bottom-0 left-0 right-0 z-50">
  <div className="mobile-nav-surface mobile-nav-appear mx-3 mb-0 px-4 pt-3 rounded-3xl" style={{ paddingBottom: '16px' }}>
          <div className="relative flex items-center justify-around">
            {navigationItems.map(item => (
              <MobileNavItem
                key={item.path}
                item={item}
                isActive={isActiveTab(item.path)}
                touchSize={44}
              />
            ))}
          </div>
        </div>
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Spacer for content */}
  <div className="h-20 lg:hidden" />
    </>
  );
};

export default MobileBottomNav;
