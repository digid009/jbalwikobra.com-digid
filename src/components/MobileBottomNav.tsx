import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      path: '/',
      label: 'Beranda',
      icon: Home,
      activeIcon: Home,
    },
    {
      path: '/feed',
      label: 'Feed',
      icon: MessageSquare,
      activeIcon: MessageSquare,
    },
    {
      path: '/sell',
      label: 'Jual',
      icon: Plus,
      activeIcon: Plus,
      isSpecial: true,
    },
    {
      path: '/products',
      label: 'Cari',
      icon: Search,
      activeIcon: Search,
    },
    {
      path: user ? '/profile' : '/auth',
      label: user ? 'Profil' : 'Masuk',
      icon: User,
      activeIcon: User,
    },
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
      <nav className="nav-bottom lg:hidden bg-ios-background/95 backdrop-blur-xl border-t border-ios-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = isActiveTab(item.path);
            const IconComponent = isActive ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
                  item.isSpecial
                    ? 'bg-ios-accent text-white scale-110 shadow-lg'
                    : isActive
                    ? 'bg-ios-accent/10 text-ios-accent'
                    : 'text-ios-text-secondary hover:text-ios-text'
                } min-w-[60px] transform active:scale-95`}
              >
                <div className={`relative ${item.isSpecial ? 'mb-1' : 'mb-1.5'}`}>
                  <IconComponent 
                    className={`w-5 h-5 ${item.isSpecial ? 'w-6 h-6' : ''}`} 
                    strokeWidth={isActive && !item.isSpecial ? 2.5 : 2}
                  />
                </div>
                
                <span className={`text-xs font-medium ${
                  item.isSpecial ? 'text-white' : ''
                } leading-none`}>
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && !item.isSpecial && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-ios-accent rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe Area for iOS */}
        <div className="h-safe-area-inset-bottom bg-ios-background"></div>
      </nav>

      {/* Spacer for content */}
      <div className="h-20 lg:hidden"></div>
    </>
  );
};

export default MobileBottomNav;
