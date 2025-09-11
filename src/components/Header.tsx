import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { Bell, Search, Menu, X, User, Settings, LogOut, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { IOSButton } from './ios/IOSDesignSystem';
import { SettingsService } from '../services/settingsService';
import type { WebsiteSettings } from '../types';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const count = await notificationService.getUnreadCount(user?.id);
        if (mounted) setUnreadCount(count);
      } catch (e) {
        // non-fatal
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const handleNotificationClick = async () => {
    // Open popover and load notifications (supports guests too)
    setIsNotifOpen((o) => !o);
    if (!isNotifOpen) {
      try {
        // Use cached service to minimize egress - limit to 5 for header dropdown
        const list = await notificationService.getLatest(5, user?.id);
        setNotifications(list);
        // Refresh unread count only if we fetched new data
        const count = await notificationService.getUnreadCount(user?.id);
        setUnreadCount(count);
      } catch (e) {
        console.warn('Failed to load notifications', e);
      }
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
    { path: '/', label: 'Beranda' },
    { path: '/products', label: 'Produk' },
    { path: '/flash-sales', label: 'Flash Sale' },
    { path: '/feed', label: 'Feed' },
    { path: '/sell', label: 'Jual' },
    { path: '/help', label: 'Bantuan' },
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-ios-accent text-white shadow-sm'
                      : 'text-ios-text hover:bg-ios-surface-secondary'
                  }`}
                >
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Mobile Search */}
              <IOSButton
                variant="ghost"
                size="small"
                className="md:hidden"
                onClick={() => setIsSearchFocused(!isSearchFocused)}
              >
                <Search className="w-5 h-5" />
              </IOSButton>

              {/* Notifications - Only for logged in users */}
              {user && (
                <div className="relative">
                  <IOSButton
                  variant="ghost" 
                  size="small"
                  className="relative"
                  onClick={handleNotificationClick}
                  >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-ios-destructive text-white text-[10px] leading-[18px] rounded-full ring-2 ring-ios-background text-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  </IOSButton>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-ios-background border border-ios-border rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ios-border bg-ios-surface/50">
                      <span className="text-sm font-semibold text-ios-text">Notifikasi</span>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button
                            onClick={async () => {
                              try {
                                await notificationService.markAllAsRead(user?.id);
                                // optimistically mark local list as read
                                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                const count = await notificationService.getUnreadCount(user?.id);
                                setUnreadCount(count);
                              } catch {}
                            }}
                            className="text-xs text-ios-accent hover:underline"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                        <button onClick={() => setIsNotifOpen(false)} className="text-ios-text-secondary hover:text-ios-text p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-sm text-ios-text-secondary px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-ios-text-secondary/50 mx-auto mb-2" />
                          <p>Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-ios-border">
                          {notifications.map((n) => (
                            <div key={n.id}>
                              <button
                                onClick={async () => {
                                  try {
                                    if (user) {
                                      await notificationService.markAsRead(n.id, user?.id);
                                      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
                                      const count = await notificationService.getUnreadCount(user?.id);
                                      setUnreadCount(count);
                                    }
                                  } catch {}
                                  setIsNotifOpen(false);
                                  if (n.link_url) navigate(n.link_url);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-ios-surface-secondary transition-colors flex items-start gap-3 ${
                                  !n.is_read ? 'bg-ios-accent/5' : ''
                                }`}
                              >
                                <div className="mt-1">
                                  <div className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-ios-border' : 'bg-ios-accent'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-ios-text truncate">{n.title}</div>
                                  {n.body && <div className="text-xs text-ios-text-secondary line-clamp-2 mt-1">{n.body}</div>}
                                  <div className="text-xs text-ios-text-secondary mt-1">{new Date(n.created_at).toLocaleString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}</div>
                                </div>
                                {n.link_url && (
                                  <ArrowRight className="w-4 h-4 text-ios-text-secondary" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-ios-border bg-ios-surface/30">
                          <button
                            onClick={() => {
                              setIsNotifOpen(false);
                              navigate('/notifications');
                            }}
                            className="w-full text-center text-sm text-ios-accent hover:underline"
                          >
                            Lihat semua notifikasi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover shadow-sm border border-ios-border"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-ios-primary to-ios-accent rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-medium">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-ios-text font-medium max-w-20 truncate">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </IOSButton>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-ios-background border border-ios-border rounded-2xl shadow-xl py-3 z-50 backdrop-blur-xl">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-ios-border">
                        <div className="flex items-center space-x-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover border border-ios-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-ios-primary to-ios-accent rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-medium">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ios-text truncate">{user.name || user.email}</p>
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

        {/* Mobile Search Modal */}
        {isSearchFocused && (
          <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-ios-surface border-b border-ios-border shadow-lg">
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ios-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari produk, akun game, atau layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-12 py-3 bg-ios-surface-secondary border border-ios-border rounded-2xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-ios-accent transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchFocused(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-ios-text-secondary hover:text-ios-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

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
