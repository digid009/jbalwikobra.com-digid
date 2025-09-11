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
      <header data-fixed="header" className="header-fixed bg-ios-background/95 backdrop-blur-xl border-b border-ios-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              {/* Dynamic logo if available */}
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || 'Logo'}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-ios-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <span className="font-semibold text-ios-text text-lg hidden sm:block">
                {settings?.siteName || 'JBalwikobra'}
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className={`relative transition-all duration-200 ${
                  isSearchFocused ? 'transform scale-105' : ''
                }`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-text-secondary" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-10 pr-4 py-2.5 bg-ios-surface border border-ios-border rounded-xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-transparent transition-all duration-200"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-2">
              <button className="md:hidden p-2 rounded-lg hover:bg-ios-surface transition-colors">
                <Search className="w-5 h-5 text-ios-text" />
              </button>

              <button className="p-2 rounded-lg hover:bg-ios-surface transition-colors relative">
                <Bell className="w-5 h-5 text-ios-text" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-ios-surface transition-colors"
                  >
                    <div className="w-8 h-8 bg-ios-accent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-ios-text font-medium">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-ios-background border border-ios-border rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-ios-border">
                        <p className="text-sm font-medium text-ios-text">{user.email}</p>
                        <p className="text-xs text-ios-text-secondary">Online</p>
                      </div>
                      
                      <nav className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-ios-text hover:bg-ios-surface transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profil</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-3 px-4 py-2 text-ios-text hover:bg-ios-surface transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>Wishlist</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 px-4 py-2 text-ios-text hover:bg-ios-surface transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Pesanan</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-ios-text hover:bg-ios-surface transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Pengaturan</span>
                        </Link>
                        <hr className="my-2 border-ios-border" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-ios-surface transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
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
                  className="hidden sm:block"
                >
                  Masuk
                </IOSButton>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-ios-surface transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-ios-text" />
                ) : (
                  <Menu className="w-5 h-5 text-ios-text" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-ios-background border-t border-ios-border">
            <div className="px-4 py-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-text-secondary" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-ios-surface border border-ios-border rounded-xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-transparent"
                  />
                </div>
              </form>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-ios-accent text-white'
                        : 'text-ios-text hover:bg-ios-surface'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {!user && (
                <div className="mt-4 pt-4 border-t border-ios-border">
                  <IOSButton
                    onClick={() => navigate('/auth')}
                    variant="primary"
                    className="w-full"
                  >
                    Masuk / Daftar
                  </IOSButton>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

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
