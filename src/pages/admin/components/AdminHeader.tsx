import React, { useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, UserCircle } from 'lucide-react';
import { IOSButton } from '../../../components/ios/IOSDesignSystem';
import { useAuth } from '../../../contexts/TraditionalAuthContext';
import { standardClasses, cn } from '../../../styles/standardClasses';

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  showNotifications,
  onToggleNotifications,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        if (showNotifications) {
          onToggleNotifications();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, onToggleNotifications]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-ios-background shadow-sm border-b border-ios-border z-40">
      <div className={standardClasses.container.boxed}>
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <IOSButton
              variant="ghost"
              size="small"
              onClick={onToggleMobileMenu}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </IOSButton>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-ios-primary to-ios-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JB</span>
              </div>
              <h1 className="text-xl font-semibold text-ios-text hidden sm:block">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search orders, users, products..."
                  className="w-full pl-10 pr-4 py-2 border border-ios-border rounded-lg focus:ring-2 focus:ring-ios-primary focus:border-transparent bg-ios-surface text-ios-text placeholder-ios-text-secondary"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ios-text-secondary" />
                <IOSButton
                  type="submit"
                  size="small"
                  className="absolute right-1 top-1 bottom-1"
                >
                  Search
                </IOSButton>
              </div>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
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
            <div className="relative" ref={notificationRef}>
              <IOSButton
                variant="ghost"
                size="small"
                onClick={onToggleNotifications}
                className="relative overflow-visible"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-5 px-1 bg-ios-error text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow ring-2 ring-ios-background">
                  3
                </span>
              </IOSButton>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-ios-background rounded-lg shadow-lg border border-ios-border z-50">
                  <div className="p-4 border-b border-ios-border">
                    <h3 className="font-semibold text-ios-text">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-ios-border/50 hover:bg-ios-surface">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ios-success rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-ios-text">
                            New Order #12345
                          </p>
                          <p className="text-sm text-ios-text-secondary">
                            FREE FIRE B1 - Rp 25,000
                          </p>
                          <p className="text-xs text-ios-text-secondary mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-ios-border/50 hover:bg-ios-surface">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ios-primary rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-ios-text">
                            Order Paid #12344
                          </p>
                          <p className="text-sm text-ios-text-secondary">
                            MOBILE LEGENDS - Rp 50,000
                          </p>
                          <p className="text-xs text-ios-text-secondary mt-1">5 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-ios-surface">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ios-error rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-ios-text">
                            Order Cancelled #12343
                          </p>
                          <p className="text-sm text-ios-text-secondary">
                            PUBG Mobile - Rp 30,000
                          </p>
                          <p className="text-xs text-ios-text-secondary mt-1">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-ios-border">
                    <IOSButton variant="ghost" size="small" className="w-full">
                      View All Notifications
                    </IOSButton>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <IOSButton variant="ghost" size="small" className="relative overflow-visible">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
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
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <IOSButton
                type="submit"
                size="small"
                className="absolute right-1 top-1 bottom-1"
              >
                Search
              </IOSButton>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
