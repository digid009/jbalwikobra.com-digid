import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { Bell, Search, Menu, X, User, Settings, LogOut, Heart, ShoppingBag } from 'lucide-react';
import { IOSButton } from './ios/IOSDesignSystem';
import { SettingsService } from '../services/settingsService';
import type { WebsiteSettings } from '../types';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Load website settings for dynamic header info
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch (e) {
        console.warn('Failed to load settings for header:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    { path: '/', label: 'Beranda', icon: '🏠' },
    { path: '/products', label: 'Produk', icon: '🛍️' },
    { path: '/flash-sales', label: 'Flash Sale', icon: '⚡' },
    { path: '/feed', label: 'Feed', icon: '📱' },
    { path: '/sell', label: 'Jual', icon: '💰' },
    { path: '/help', label: 'Bantuan', icon: '❓' },
  ];

  return (
    <>
      <header data-fixed="header" className="header-fixed bg-ios-background/95 backdrop-blur-xl border-b border-ios-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
              {/* Dynamic logo if available */}
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || 'Logo'}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-ios-border group-hover:ring-ios-accent transition-all duration-200"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-ios-primary to-ios-accent rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <div className="hidden sm:block">
                <span className="font-semibold text-ios-text text-lg tracking-tight">
                  {settings?.siteName || 'JBalwikobra'}
                </span>
                <p className="text-xs text-ios-text-secondary -mt-0.5">Digital Store</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className={`relative transition-all duration-300 ${
                  isSearchFocused ? 'transform scale-[1.02]' : ''
                }`}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-text-secondary" />
                  <input
                    type="text"
                    placeholder="Cari produk, akun game, atau layanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-3 bg-ios-surface-secondary border border-ios-border rounded-2xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-ios-accent focus:bg-ios-surface transition-all duration-300 text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Mobile Search */}
              <IOSButton
                variant="ghost"
                size="small"
                className="md:hidden"
                onClick={() => {/* TODO: Open mobile search modal */}}
              >
                <Search className="w-5 h-5" />
              </IOSButton>

              {/* Notifications */}
              <IOSButton
                variant="ghost" 
                size="small"
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-ios-destructive rounded-full ring-2 ring-ios-background"></span>
              </IOSButton>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-primary to-ios-accent rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-ios-text font-medium max-w-20 truncate">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </IOSButton>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-ios-background border border-ios-border rounded-2xl shadow-xl py-3 z-50 backdrop-blur-xl">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-ios-border">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-ios-primary to-ios-accent rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ios-text truncate">{user.email}</p>
                            <p className="text-xs text-ios-success flex items-center">
                              <div className="w-2 h-2 bg-ios-success rounded-full mr-1.5"></div>
                              Online
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Navigation Links */}
                      <nav className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-ios-text hover:bg-ios-surface-secondary transition-colors group"
                        >
                          <User className="w-4 h-4 text-ios-text-secondary group-hover:text-ios-accent transition-colors" />
                          <span className="font-medium">Profil Saya</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-3 px-4 py-3 text-ios-text hover:bg-ios-surface-secondary transition-colors group"
                        >
                          <Heart className="w-4 h-4 text-ios-text-secondary group-hover:text-ios-destructive transition-colors" />
                          <span className="font-medium">Wishlist</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 px-4 py-3 text-ios-text hover:bg-ios-surface-secondary transition-colors group"
                        >
                          <ShoppingBag className="w-4 h-4 text-ios-text-secondary group-hover:text-ios-accent transition-colors" />
                          <span className="font-medium">Riwayat Pembelian</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-ios-text hover:bg-ios-surface-secondary transition-colors group"
                        >
                          <Settings className="w-4 h-4 text-ios-text-secondary group-hover:text-ios-accent transition-colors" />
                          <span className="font-medium">Pengaturan</span>
                        </Link>
                        <div className="my-2 border-t border-ios-border"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-ios-destructive hover:bg-ios-surface-secondary transition-colors w-full text-left group"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Keluar</span>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              ) : (
                <IOSButton
                  onClick={() => navigate('/auth')}
                  variant="primary"
                  size="small"
                  className="hidden sm:flex font-medium"
                >
                  Masuk
                </IOSButton>
              )}

              {/* Mobile Menu Toggle */}
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </IOSButton>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-ios-background/95 backdrop-blur-xl border-t border-ios-border">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-text-secondary" />
                  <input
                    type="text"
                    placeholder="Cari produk atau layanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-ios-surface-secondary border border-ios-border rounded-2xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-ios-accent"
                  />
                </div>
              </form>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-ios-accent text-white shadow-sm'
                        : 'text-ios-text hover:bg-ios-surface-secondary'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Auth Section */}
              {!user && (
                <div className="pt-4 border-t border-ios-border">
                  <IOSButton
                    onClick={() => navigate('/auth')}
                    variant="primary"
                    className="w-full font-medium"
                  >
                    Masuk / Daftar
                  </IOSButton>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
