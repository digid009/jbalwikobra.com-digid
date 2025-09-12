import React from 'react';
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
  X
} from 'lucide-react';
import { IOSButton, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { ThemeToggle } from '../../../components/ios/ThemeToggle';
import { AdminStats } from '../../../services/adminService';
import { cn } from '../../../styles/standardClasses';

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
  icon: any; // Simplified for now
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
  setActiveTab: (tab: AdminTab) => void;
  stats: AdminStats | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onRefreshStats?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  
  const getBadgeValue = (badge: keyof AdminStats | null) => {
    if (!badge || !stats) return null;
    const value = stats[badge];
    return typeof value === 'number' && value > 0 ? value : null;
  };

  return (
    <>
      {/* Header */}
  <header className="sticky top-0 z-50 dashboard-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-pink-600 dark:text-pink-400 tracking-tight">
                JB Admin
              </div>
              <button
                type="button"
                className="command-button hidden md:inline-flex"
                aria-label="Open command palette"
              >
                <span className="text-xs">Search / Command</span>
                <kbd>⌘K</kbd>
              </button>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badgeValue = getBadgeValue(item.badge);

                return (
                  <IOSButton
                    key={item.id}
                    variant={isActive ? "primary" : "ghost"}
                    size="medium"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-pink-600 text-white shadow-lg"
                        : "text-gray-100 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-900 dark:hover:bg-gray-900"
                    )}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.label}
                    {badgeValue && (
                      <IOSBadge
                        variant="destructive"
                        size="small"
                        className="absolute -top-1 -right-1 min-w-[18px] h-4 text-xs"
                      >
                        {badgeValue > 99 ? '99+' : badgeValue}
                      </IOSBadge>
                    )}
                  </IOSButton>
                );
              })}
            </nav>

            {/* Right: Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-3">
              <ThemeToggle size="medium" />
              
              {/* Mobile menu button */}
              <IOSButton
                variant="ghost"
                size="medium"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </IOSButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-black/95 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badgeValue = getBadgeValue(item.badge);

                return (
                  <IOSButton
                    key={item.id}
                    variant={isActive ? "primary" : "ghost"}
                    size="medium"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start relative px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-pink-600 text-white"
                        : "text-gray-100 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-900 dark:hover:bg-gray-900"
                    )}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.label}
                    {badgeValue && (
                      <IOSBadge
                        variant="destructive"
                        size="small"
                        className="ml-auto min-w-[18px] h-4 text-xs"
                      >
                        {badgeValue > 99 ? '99+' : badgeValue}
                      </IOSBadge>
                    )}
                  </IOSButton>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default AdminHeader;
