import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, HelpCircle, User, Rss } from 'lucide-react';
import { bindHoverPrefetch, warmImport, shouldPrefetch } from '../utils/prefetch';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { IOSContainer } from './ios/IOSDesignSystem';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [siteName, setSiteName] = React.useState<string>('JB Alwikobra');
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(undefined);
  
  // Lazy load settings to improve initial page load
  React.useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
  const { SettingsService } = await import('../services/settingsService');
        if (!mounted) return;
        const s = await SettingsService.get();
        if (mounted) {
          if (s?.siteName) setSiteName(s.siteName);
          if (s?.logoUrl) setLogoUrl(s.logoUrl);
        }
      } catch {
        // Silent fail for better UX
      }
    };
    // Delay settings load to prioritize critical content
    const timer = setTimeout(loadSettings, 100);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/help', label: 'Bantuan', icon: HelpCircle },
  ];

  // Light prefetch of routes on hover/touch
  React.useEffect(() => {
    if (!shouldPrefetch()) return;
    const disposers: Array<() => void> = [];
    const runPrefetch = (path: string) => {
      // dynamic import warmups for key routes
      if (path === '/products') warmImport(() => import('../pages/ProductsPage'));
      else if (path === '/sell') warmImport(() => import('../pages/SellPage'));
      else if (path === '/feed') warmImport(() => import('../pages/HomePage'));
      else if (path === '/help') warmImport(() => import('../pages/HelpPage'));
      else if (path === '/') warmImport(() => import('../pages/HomePage'));
    };
    // attach to all header nav links when rendered (desktop only here)
    const root = document.querySelector('header nav');
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
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-ios-background/95 border-b border-ios-border/50 safe-top force-fixed-header" 
      data-fixed="header"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        width: '100%',
        transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
        backfaceVisibility: 'hidden', // Improve performance
        WebkitBackfaceVisibility: 'hidden',
        paddingTop: 'env(safe-area-inset-top)', // iOS safe area
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      {/* Mobile-first design - Base styles for mobile */}
      <IOSContainer padding={false} className="px-4 py-4">
        <div className="flex items-center justify-between min-h-[44px]"> {/* Minimum touch target */}
          {/* Logo and brand - Mobile optimized */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 min-h-[44px] touch-manipulation active:scale-95 transition-transform duration-150"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="h-9 w-9 rounded-xl object-cover shadow-sm" 
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-ios-accent to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">JB</span>
              </div>
            )}
            <div className="hidden xs:block">
              <span className="text-lg font-bold text-ios-text truncate max-w-[140px] md:max-w-none">
                {siteName}
              </span>
              <p className="text-xs text-ios-text-secondary -mt-1 hidden md:block">
                Gaming Marketplace
              </p>
            </div>
          </Link>
          
          {/* Mobile: Profile only, Desktop: Full navigation */}
          <div className="flex items-center">
            {/* Desktop navigation - Hidden on mobile */}
            <nav className="hidden lg:flex space-x-1 mr-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 min-h-[44px] ${
                      isActive
                        ? 'bg-ios-accent/10 text-ios-accent border border-ios-accent/20'
                        : 'text-ios-text-secondary hover:text-ios-text hover:bg-ios-surface/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User profile/auth - Always visible */}
            {user ? (
              <Link 
                to="/profile" 
                className="w-11 h-11 bg-ios-surface rounded-full flex items-center justify-center border border-ios-border transition-all duration-200 hover:border-ios-accent/50 active:scale-95 touch-manipulation"
              >
                <User size={20} className="text-ios-text" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/auth" 
                  className="hidden sm:flex px-3 py-2 text-sm font-medium text-ios-text-secondary hover:text-ios-text transition-colors min-h-[44px] items-center"
                >
                  Masuk
                </Link>
                <Link 
                  to="/auth" 
                  className="px-4 py-2 bg-ios-accent text-white text-sm font-medium rounded-xl transition-all duration-200 hover:bg-ios-accent/90 active:scale-95 min-h-[44px] flex items-center touch-manipulation"
                >
                  <span className="hidden sm:inline">Daftar</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </IOSContainer>
    </header>
  );
};

export default Header;
