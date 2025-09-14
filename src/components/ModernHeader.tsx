import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  ShoppingBag, 
  ArrowRight,
  Home,
  Package,
  Zap,
  Rss,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { IOSButton } from './ios/IOSDesignSystem';
import { SettingsService } from '../services/settingsService';
import { cn } from '../utils/cn';
const standardClasses = { container:{boxed:'mx-auto w-full max-w-7xl px-4'}, flex:{rowGap2:'flex items-center gap-2',rowGap3:'flex items-center gap-3'} };
import type { WebsiteSettings } from '../types';

interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
  isNew?: boolean;
}

const ModernHeader = () => {
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

  // Navigation items with icons
  const navigationItems: NavigationItem[] = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/products', label: 'Produk', icon: Package },
    { path: '/flash-sales', label: 'Flash Sale', icon: Zap, isNew: true },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/sell', label: 'Jual', icon: DollarSign },
    { path: '/help', label: 'Bantuan', icon: HelpCircle },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Load notifications count
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

  // Load website settings
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch (e) {
        console.warn('Failed to load settings for header:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load notifications when panel opens
  useEffect(() => {
    if (isNotifOpen && user) {
      (async () => {
        try {
          const data = await notificationService.getLatest(10, user.id);
          setNotifications(data);
        } catch (e) {
          console.error('Failed to load notifications:', e);
        }
      })();
    }
  }, [isNotifOpen, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header 
        data-fixed="header" 
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            
            {/* Logo Section */}
            <ModernLogo settings={settings} />
            
            {/* Desktop Search */}
            <ModernSearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              onSubmit={handleSearch}
            />
            
            {/* Desktop Navigation */}
            <ModernDesktopNav 
              navigationItems={navigationItems}
              currentPath={location.pathname}
            />
            
            {/* User Actions */}
            <ModernUserActions 
              user={user}
              unreadCount={unreadCount}
              isNotifOpen={isNotifOpen}
              setIsNotifOpen={setIsNotifOpen}
              notifications={notifications}
              setNotifications={setNotifications}
              setUnreadCount={setUnreadCount}
              navigate={navigate}
              onLogout={handleLogout}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <ModernMobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigationItems={navigationItems}
        currentPath={location.pathname}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        navigate={navigate}
      />
    </>
  );
};

// Modern Logo Component
const ModernLogo: React.FC<{ settings: WebsiteSettings | null }> = ({ settings }) => (
  <Link 
    to="/" 
    className="flex items-center gap-3 flex-shrink-0 group"
  >
    {settings?.logoUrl ? (
      <div className="relative">
        <img
          src={settings.logoUrl}
          alt={settings.siteName || 'Logo'}
          className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20 group-hover:ring-pink-500/50 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    ) : (
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300">
          <span className="text-white font-bold text-sm">JB</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-fuchsia-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>
    )}
    
    <div className="hidden sm:block">
      <span className="font-semibold text-white text-lg tracking-tight group-hover:text-pink-300 transition-colors duration-300">
        {settings?.siteName || 'JBalwikobra'}
      </span>
      <p className="text-xs text-white/70 -mt-0.5">Digital Store</p>
    </div>
  </Link>
);

// Modern Search Bar Component
interface ModernSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  onSubmit
}) => (
  <div className="hidden md:flex flex-1 max-w-2xl mx-6 lg:mx-12">
    <form onSubmit={onSubmit} className="w-full">
      <div className={`relative transition-all duration-300 ${
        isSearchFocused ? 'transform scale-[1.02]' : ''
      }`}>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          type="text"
          placeholder="Cari produk, akun game, atau layanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={cn(
            "w-full pl-12 pr-4 py-3 lg:py-3.5",
            "bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl",
            "text-white placeholder-white/60",
            "focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50",
            "focus:bg-white/10 transition-all duration-300",
            "text-sm lg:text-base"
          )}
        />
      </div>
    </form>
  </div>
);

// Modern Desktop Navigation Component
interface ModernDesktopNavProps {
  navigationItems: NavigationItem[];
  currentPath: string;
}

const ModernDesktopNav: React.FC<ModernDesktopNavProps> = ({ navigationItems, currentPath }) => (
  <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
    {navigationItems.slice(0, 5).map((item) => {
      const Icon = item.icon;
      const isActive = currentPath === item.path;
      
      return (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
            "hover:bg-white/10 hover:backdrop-blur-sm",
            isActive 
              ? "bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-white border border-pink-500/30" 
              : "text-white/80 hover:text-white"
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          <span className="font-medium text-sm">{item.label}</span>
          
          {/* New Badge */}
          {item.isNew && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse" />
          )}
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full" />
          )}
        </Link>
      );
    })}
  </nav>
);

// Modern User Actions Component
interface ModernUserActionsProps {
  user: any;
  unreadCount: number;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  setUnreadCount: (count: number) => void;
  navigate: (path: string) => void;
  onLogout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const ModernUserActions: React.FC<ModernUserActionsProps> = ({
  user,
  unreadCount,
  isNotifOpen,
  setIsNotifOpen,
  notifications,
  setNotifications,
  setUnreadCount,
  navigate,
  onLogout,
  isMenuOpen,
  setIsMenuOpen
}) => (
  <div className="flex items-center gap-3">
    
    {/* Notifications (Desktop) */}
    {user && (
      <div className="relative hidden sm:block">
        <button
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className={cn(
            "relative p-2.5 rounded-xl transition-all duration-300",
            "hover:bg-white/10 hover:backdrop-blur-sm",
            isNotifOpen ? "bg-white/10 text-white" : "text-white/80"
          )}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </button>
        
        {/* Notifications Dropdown */}
        {isNotifOpen && (
          <ModernNotificationsPanel 
            notifications={notifications}
            setNotifications={setNotifications}
            setUnreadCount={setUnreadCount}
            user={user}
            navigate={navigate}
            onClose={() => setIsNotifOpen(false)}
          />
        )}
      </div>
    )}

    {/* User Menu (Desktop) */}
    {user ? (
      <div className="hidden sm:flex items-center gap-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-sm font-medium group-hover:text-pink-300 transition-colors">
            {user.name?.split(' ')[0] || 'User'}
          </span>
        </Link>
        
        <button
          onClick={onLogout}
          className="p-2.5 rounded-xl hover:bg-red-500/20 text-white/80 hover:text-red-400 transition-all duration-300"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="hidden sm:flex items-center gap-2">
        <IOSButton 
          variant="ghost" 
          size="small"
          onClick={() => navigate('/auth')}
          className="text-white border-white/20 hover:bg-white/10"
        >
          Masuk
        </IOSButton>
        <IOSButton 
          variant="primary" 
          size="small"
          onClick={() => navigate('/auth')}
          className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700"
        >
          Daftar
        </IOSButton>
      </div>
    )}

    {/* Mobile Menu Toggle */}
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300 sm:hidden",
        "hover:bg-white/10 hover:backdrop-blur-sm",
        isMenuOpen ? "bg-white/10 text-white" : "text-white/80"
      )}
    >
      {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  </div>
);

// Modern Notifications Panel Component
interface ModernNotificationsPanelProps {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  setUnreadCount: (count: number) => void;
  user: any;
  navigate: (path: string) => void;
  onClose: () => void;
}

const ModernNotificationsPanel: React.FC<ModernNotificationsPanelProps> = ({
  notifications,
  setNotifications,
  setUnreadCount,
  user,
  navigate,
  onClose
}) => (
  <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50">
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Notifikasi</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={async () => {
                try {
                  await notificationService.markAllAsRead(user?.id);
                  const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
                  setNotifications(updatedNotifications);
                  const count = await notificationService.getUnreadCount(user?.id);
                  setUnreadCount(count);
                } catch (error) {
                  console.error('Failed to mark all notifications as read:', error);
                  // Still update the UI optimistically for better UX
                  const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
                  setNotifications(updatedNotifications);
                  setUnreadCount(0);
                }
              }}
              className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
            >
              Tandai semua dibaca
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <div className="max-h-80 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="text-center py-8 px-4">
          <Bell className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-white/60">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={async () => {
                try {
                  if (user) {
                    await notificationService.markAsRead(notification.id, user?.id);
                    const updatedNotifications = notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n);
                    setNotifications(updatedNotifications);
                    const count = await notificationService.getUnreadCount(user?.id);
                    setUnreadCount(count);
                  }
                } catch (error) {
                  console.error('Failed to mark notification as read:', error);
                  // Still update the UI optimistically for better UX
                  const updatedNotifications = notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n);
                  setNotifications(updatedNotifications);
                  // Refetch the count to keep it accurate
                  try {
                    const count = await notificationService.getUnreadCount(user?.id);
                    setUnreadCount(count);
                  } catch {
                    // If we can't fetch count, try to estimate it
                    const unreadInList = updatedNotifications.filter(n => !n.is_read).length;
                    setUnreadCount(Math.max(0, unreadInList));
                  }
                }
                onClose();
                if (notification.link_url) navigate(notification.link_url);
              }}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-white/5 transition-all duration-200",
                "flex items-start gap-3",
                !notification.is_read ? "bg-pink-500/5" : ""
              )}
            >
              <div className="mt-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  notification.is_read ? "bg-white/30" : "bg-pink-500"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white line-clamp-2">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                )}
                <p className="text-xs text-white/40 mt-1">
                  {new Date(notification.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Modern Mobile Menu Component
interface ModernMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  currentPath: string;
  user: any;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  navigate: (path: string) => void;
}

const ModernMobileMenu: React.FC<ModernMobileMenuProps> = ({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  onSearch,
  navigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-white/20">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mobile Search */}
          <div className="p-4 border-b border-white/10">
            <form onSubmit={onSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm"
                />
              </div>
            </form>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-white border border-pink-500/30" 
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{item.label}</span>
                    {item.isNew && (
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse" />
                    )}
                    {isActive && <ArrowRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-white/60">Lihat Profile</p>
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <IOSButton 
                  variant="ghost" 
                  fullWidth
                  onClick={() => {
                    navigate('/auth');
                    onClose();
                  }}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Masuk
                </IOSButton>
                <IOSButton 
                  variant="primary" 
                  fullWidth
                  onClick={() => {
                    navigate('/auth');
                    onClose();
                  }}
                  className="bg-gradient-to-r from-pink-500 to-fuchsia-600"
                >
                  Daftar
                </IOSButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHeader;
