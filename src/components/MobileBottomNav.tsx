import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, User, Newspaper } from 'lucide-react';
import { bindHoverPrefetch, warmImport, shouldPrefetch } from '../utils/prefetch';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
  { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  React.useEffect(() => {
    if (!shouldPrefetch()) return;
    const disposers: Array<() => void> = [];
    const runPrefetch = (path: string) => {
      if (path === '/products') warmImport(() => import('../pages/ProductsPage'));
      else if (path === '/sell') warmImport(() => import('../pages/SellPage'));
      else if (path === '/feed') warmImport(() => import('../pages/HomePage'));
      else if (path === '/profile') warmImport(() => import('../pages/ProfilePage'));
      else if (path === '/') warmImport(() => import('../pages/HomePage'));
    };
    const root = document.querySelector('nav');
    if (root) {
      root.querySelectorAll('a[href]')?.forEach((el) => {
        const href = (el as HTMLAnchorElement).getAttribute('href') || '';
        if (!href.startsWith('/')) return;
        disposers.push(bindHoverPrefetch(el, () => runPrefetch(href)));
      });
    }
    return () => { disposers.forEach(d => d()); };
  }, []);

  return (
    <div 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] w-full bg-white/95 backdrop-blur-md border-t border-gray-200 safe-bottom shadow-lg mobile-bottom-nav-fixed force-fixed-bottom" 
      data-fixed="bottom-nav"
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        width: '100%',
        transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <nav className="flex justify-around items-center px-2 py-3 min-h-[65px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-[11px] font-medium transition-all duration-200 active:scale-95 touch-manipulation min-w-[60px] min-h-[52px] ${
                isActive 
                  ? 'text-pink-500 bg-pink-50 border border-pink-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={22} 
                className={`mb-1 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`} 
              />
              <span className="leading-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
