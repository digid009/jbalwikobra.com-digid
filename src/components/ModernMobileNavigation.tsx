import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Plus, 
  MessageSquare,
  Package,
  Zap,
  Bell,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isSpecial?: boolean;
  badge?: number;
}

const ModernMobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      path: '/',
      label: 'Beranda',
      icon: Home,
      activeIcon: Home,
    },
    {
      path: '/products',
      label: 'Produk',
      icon: Package,
      activeIcon: Package,
    },
    {
      path: '/sell',
      label: 'Jual',
      icon: Plus,
      activeIcon: Plus,
      isSpecial: true,
    },
    {
      path: '/feed',
      label: 'Feed',
      icon: MessageSquare,
      activeIcon: MessageSquare,
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
    if (path === '/auth' && !user) {
      return location.pathname.includes('/auth') || location.pathname.includes('/login') || location.pathname.includes('/register');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Modern Mobile Bottom Navigation */}
      <nav 
        data-fixed="bottom-nav" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      >
        {/* Main Navigation Bar */}
        <div className="relative mx-4 mb-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-fuchsia-500/10 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
          
          {/* Navigation Items */}
          <div className="relative flex items-center justify-around px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = isActiveTab(item.path);
              const IconComponent = item.activeIcon && isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center group"
                >
                  {/* Navigation Button */}
                  <div className={`
                    relative flex flex-col items-center justify-center 
                    px-4 py-3 rounded-2xl transition-all duration-300 
                    transform min-w-[56px] active:scale-95
                    ${item.isSpecial
                      ? 'bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 scale-110'
                      : isActive
                        ? 'bg-white/10 backdrop-blur-sm border border-pink-500/30 shadow-lg shadow-pink-500/20'
                        : 'hover:bg-white/5 hover:backdrop-blur-sm'
                    }
                  `}>
                    
                    {/* Icon Container */}
                    <div className={`
                      relative transition-all duration-300 mb-1
                      ${item.isSpecial ? '' : 'group-hover:scale-110'}
                      ${isActive && !item.isSpecial ? 'transform scale-110' : ''}
                    `}>
                      <IconComponent 
                        className={`
                          ${item.isSpecial ? 'w-7 h-7' : 'w-6 h-6'} 
                          transition-all duration-300
                          ${item.isSpecial
                            ? 'text-white'
                            : isActive
                              ? 'text-pink-400'
                              : 'text-white/70 group-hover:text-white'
                          }
                        `}
                        strokeWidth={isActive && !item.isSpecial ? 2.5 : 2}
                      />
                      
                      {/* Special Button Glow */}
                      {item.isSpecial && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-full blur-md opacity-60 -z-10 animate-pulse" />
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-fuchsia-400 rounded-full blur-sm opacity-40 -z-10" />
                        </>
                      )}

                      {/* Active Icon Glow */}
                      {isActive && !item.isSpecial && (
                        <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-lg -z-10" />
                      )}

                      {/* Badge for notifications or counts */}
                      {item.badge && item.badge > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border border-white/20">
                          <span className="text-[10px] font-bold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`
                      text-[11px] font-medium leading-none transition-all duration-300
                      ${item.isSpecial 
                        ? 'text-white font-semibold' 
                        : isActive 
                          ? 'text-pink-400 font-semibold' 
                          : 'text-white/70 group-hover:text-white'
                      }
                    `}>
                      {item.label}
                    </span>
                    
                    {/* Active Indicator Dot */}
                    {isActive && !item.isSpecial && (
                      <>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full shadow-lg shadow-pink-500/50" />
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-fuchsia-400 rounded-full blur-sm opacity-80" />
                      </>
                    )}

                    {/* Hover Effect Background */}
                    {!item.isSpecial && (
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-fuchsia-500/10 rounded-2xl transition-all duration-300 -z-10" />
                    )}

                    {/* Ripple Effect on Active */}
                    {isActive && !item.isSpecial && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-2xl animate-pulse" />
                    )}
                  </div>

                  {/* Floating Label for Special Button */}
                  {item.isSpecial && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1">
                        <span className="text-xs text-white font-medium">Mulai Jual</span>
                      </div>
                      <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 transform rotate-45 -mt-1 mx-auto" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* iOS Safe Area */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Content Spacer */}
      <div className="h-24 lg:hidden" />

      {/* Quick Action Floating Button (Optional Enhancement) */}
      <QuickActionButton />
    </>
  );
};

// Quick Action Floating Button Component
const QuickActionButton: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [quickActions] = React.useState([
    { icon: Zap, label: 'Flash Sale', path: '/flash-sales', color: 'from-orange-500 to-red-500' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'from-pink-500 to-rose-500' },
    { icon: Search, label: 'Cari', path: '/search', color: 'from-blue-500 to-indigo-500' },
  ]);

  // Hide if not logged in or on special pages
  if (!user || window.location.pathname.startsWith('/admin') || window.location.pathname === '/sell') {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-28 right-6 z-40">
      {/* Quick Actions Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-3 duration-300">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-3 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <span className="text-xs text-white font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </div>
                <div className={`
                  w-12 h-12 rounded-full bg-gradient-to-br ${action.color} 
                  flex items-center justify-center shadow-lg 
                  hover:scale-110 transition-all duration-300
                  border border-white/20
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 
          flex items-center justify-center shadow-lg shadow-purple-500/40
          border border-white/20 backdrop-blur-sm
          hover:scale-110 active:scale-95 transition-all duration-300
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full blur-lg opacity-60 -z-10 animate-pulse" />
      </button>
    </div>
  );
};

export default ModernMobileNavigation;
