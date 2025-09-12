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
      <nav data-fixed="bottom-nav" className="nav-bottom lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="relative bg-gradient-to-t from-black/95 via-black/90 to-black/80 backdrop-blur-xl border-t border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent"></div>
          
          <div className="relative flex items-center justify-around px-4 py-3">
            {navigationItems.map((item) => {
              const isActive = isActiveTab(item.path);
              const IconComponent = isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-300 transform ${
                    item.isSpecial
                      ? 'bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white scale-110 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50'
                      : isActive
                      ? 'bg-white/10 backdrop-blur-sm text-pink-400 border border-pink-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } min-w-[64px] active:scale-95 group`}
                >
                  <div className={`relative ${item.isSpecial ? 'mb-1' : 'mb-1.5'} transition-transform duration-300 ${
                    item.isSpecial ? '' : 'group-hover:scale-110'
                  }`}>
                    <IconComponent 
                      className={`${item.isSpecial ? 'w-7 h-7' : 'w-6 h-6'} transition-all duration-300`}
                      strokeWidth={isActive && !item.isSpecial ? 2.5 : 2}
                    />
                    
                    {/* Glow effect for special button */}
                    {item.isSpecial && (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-full blur-sm opacity-50 -z-10"></div>
                    )}
                  </div>
                  
                  <span className={`text-xs font-medium leading-none transition-colors duration-300 ${
                    item.isSpecial 
                      ? 'text-white' 
                      : isActive 
                        ? 'text-pink-400' 
                        : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && !item.isSpecial && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full shadow-sm"></div>
                  )}
                  
                  {/* Hover glow effect */}
                  {!item.isSpecial && (
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-fuchsia-500/10 rounded-2xl transition-all duration-300 -z-10"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Safe Area for iOS */}
          <div className="h-safe-area-inset-bottom bg-gradient-to-t from-black to-transparent"></div>
        </div>
      </nav>

      {/* Spacer for content */}
      <div className="h-20 lg:hidden"></div>
    </>
  );
};

export default MobileBottomNav;
