import React, { useState } from 'react';
import { adminInputWithLeftIcon } from './ui/InputStyles';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Star, 
  MessageSquare, 
  Image as ImageIcon, 
  Zap,
  Menu,
  X,
  Search,
  Bell,
  LucideIcon
} from 'lucide-react';
import { IOSButton, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { ThemeToggle } from '../../../components/ios/ThemeToggle';
import { AdminStats } from '../../../services/adminService';
// Temporary local cn util (legacy helper removed)
import { cn } from '../../../utils/cn';

export type AdminTab = 
  | 'overview' 
  | 'dashboard' 
  | 'orders' 
  | 'users' 
  | 'products' 
  | 'feed' 
  | 'banners' 
  | 'flash-sales' 
  | 'reviews';

interface NavigationItem {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  badge: keyof AdminStats | null;
}

const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 'totalOrders' },
  { id: 'users', label: 'Users', icon: Users, badge: 'totalUsers' },
  { id: 'products', label: 'Products', icon: Package, badge: 'totalProducts' },
  { id: 'feed', label: 'Feed', icon: MessageSquare, badge: null },
  { id: 'banners', label: 'Banners', icon: ImageIcon, badge: null },
  { id: 'flash-sales', label: 'Flash Sales', icon: Zap, badge: null },
  { id: 'reviews', label: 'Reviews', icon: Star, badge: 'totalReviews' },
];

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  stats?: AdminStats;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  stats,
  searchQuery = '',
  onSearchChange = () => {},
  onSearch = () => {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const getBadgeValue = (badgeKey: keyof AdminStats | null): number | null => {
    if (!badgeKey || !stats) return null;
    const value = stats[badgeKey];
    return typeof value === 'number' ? value : null;
  };

  // Mock user data
  const user = {
    name: 'Admin',
    email: 'admin@jbalwikobra.com',
    avatarUrl: null
  };

  return (
  <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700/30 shadow-lg shadow-black/50">
      {/* Main Header */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-ios-primary to-ios-primary/80 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">JB</span>
              </div>
              <h1 className="hidden sm:block text-xl font-semibold text-white">
                Admin Panel
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                const badgeValue = getBadgeValue(item.badge);

                return (
                  <div key={item.id} className="relative">
                    <IOSButton
                      variant={isActive ? 'primary' : 'ghost'}
                      size="small"
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        'relative px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive 
                          ? 'bg-ios-primary text-white shadow-xl shadow-black/50' 
                          : 'text-gray-200 hover:text-white hover:bg-black/50'
                      )}
                    >
                      <IconComponent size={16} className="mr-2" />
                      {item.label}
                    </IOSButton>
                    
                    {badgeValue && (
                      <IOSBadge
                        variant="warning"
                        size="small"
                        className="absolute -top-1 -right-1 min-w-[18px] h-4 text-xs"
                      >
                        {badgeValue}
                      </IOSBadge>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Mobile Navigation Items */}
          <div className="lg:hidden flex items-center space-x-2">
            {navigationItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              const badgeValue = getBadgeValue(item.badge);

              return (
                <div key={item.id} className="relative">
                  <IOSButton
                    variant={isActive ? 'primary' : 'ghost'}
                    size="small"
                    onClick={() => onTabChange(item.id)}
                    className="p-2"
                  >
                    <IconComponent size={18} />
                  </IOSButton>
                  
                  {badgeValue && (
                    <IOSBadge
                      variant="warning"
                      size="small"
                      className="ml-auto min-w-[18px] h-4 text-xs"
                    >
                      {badgeValue}
                    </IOSBadge>
                  )}
                </div>
              );
            })}

            {/* Mobile Menu Button */}
            <IOSButton
              variant="ghost"
              size="small"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </IOSButton>
          </div>

          {/* Right: Search, Notifications, Theme, Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search orders, users, products..."
                    className={adminInputWithLeftIcon + ' placeholder:text-white/50'}
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-200" />
                  <IOSButton
                    type="submit"
                    size="small"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 px-3"
                  >
                    Go
                  </IOSButton>
                </div>
              </form>
            </div>

            {/* Mobile Search Button */}
            <IOSButton
              variant="ghost"
              size="small"
              onClick={onSearch}
              className="md:hidden"
            >
              <Search className="w-5 h-5" />
            </IOSButton>

            {/* Notifications */}
            <div className="relative">
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative overflow-visible"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-5 px-1 bg-ios-error text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow ring-2 ring-ios-background">
                  3
                </span>
              </IOSButton>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-black rounded-2xl shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-black/50 border-b border-gray-700/50">
                      <p className="text-sm text-white">New order received</p>
                      <p className="text-xs text-gray-200 mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-4 hover:bg-black/50 border-b border-gray-700/50">
                      <p className="text-sm text-white">Product inventory low</p>
                      <p className="text-xs text-gray-200 mt-1">1 hour ago</p>
                    </div>
                    <div className="p-4 hover:bg-black/50">
                      <p className="text-sm text-white">New user registered</p>
                      <p className="text-xs text-gray-200 mt-1">3 hours ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-700">
                    <IOSButton variant="ghost" size="small" className="w-full">
                      View all notifications
                    </IOSButton>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile */}
            <IOSButton variant="ghost" size="small" className="relative overflow-visible">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-lg shadow-black/50"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </IOSButton>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-20 py-2 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-black text-white placeholder:text-white/50"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-200" />
                <IOSButton
                  type="submit"
                  size="small"
                  className="absolute right-1 top-1"
                >
                  Search
                </IOSButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
