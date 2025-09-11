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
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] w-full bg-black/95 backdrop-blur border-t border-ios-border mobile-bottom-nav-fixed" 
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <div className="pb-safe-bottom">
        <nav className="flex justify-around py-1 px-2 h-14 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-all duration-200 active:scale-95 min-w-[60px] h-12 ${
                  isActive 
                    ? 'text-ios-accent bg-ios-accent/10' 
                    : 'text-ios-text-secondary hover:text-ios-text'
                }`}
              >
                <Icon size={18} className="mb-0.5" />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileBottomNav;
