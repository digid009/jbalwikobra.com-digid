import React, { useEffect, useRef } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { IOSButton } from '../../../components/ios/IOSDesignSystem';
import { useAdminNotifications } from '../notifications/AdminNotificationsContext';
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
  const { notifications, unreadCount, markRead, dismiss, markAllRead } = useAdminNotifications();
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

  const accent = 'from-pink-600/60 via-rose-600/60 to-fuchsia-600/60';
  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur-xl bg-black/70 border-b border-ios-border z-40">
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
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow ring-1 ring-white/20">
                <span className="text-white font-bold text-sm tracking-wide">JB</span>
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent hidden sm:block">
                Admin
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-ios-bg-secondary/60 border border-ios-border text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ios-text-secondary" />
                <IOSButton
                  type="submit"
                  size="small"
                  className="absolute right-1 top-1 bottom-1 bg-ios-accent text-white"
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
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-5 px-1 bg-pink-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow ring-2 ring-black/40">
                    {unreadCount}
                  </span>
                )}
              </IOSButton>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-ios-surface/95 backdrop-blur-xl rounded-xl shadow-2xl border border-ios-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-ios-border/60 flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm tracking-wide">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] text-ios-text-secondary hover:text-ios-text">Mark all</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-ios-border/40">
                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-ios-text-secondary text-sm">No notifications</div>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 flex items-start gap-3 hover:bg-ios-bg-secondary/40 transition ${n.read ? 'opacity-70' : ''}`}> 
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold bg-gradient-to-br ${n.kind==='new_order'? 'from-pink-500 to-rose-600':'from-emerald-500 to-green-600'} text-white`}>#{n.orderId.slice(-4)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-white truncate">{n.kind === 'new_order' ? 'Pesanan Baru' : n.kind === 'status_paid' ? 'Pembayaran Diterima' : 'Pesanan Dibatalkan'}</p>
                            {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />}
                          </div>
                          <p className="text-[11px] text-ios-text-secondary mt-0.5 truncate">Rp {n.amount.toLocaleString('id-ID')} • Status: {n.status}</p>
                          <p className="text-[10px] text-ios-text-secondary mt-1">{new Date(n.createdAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit'})}</p>
                          {!n.read && (
                            <button onClick={() => markRead(n.id)} className="mt-2 text-[11px] text-ios-accent hover:underline">Tandai dibaca</button>
                          )}
                        </div>
                        <button onClick={() => dismiss(n.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-ios-bg-secondary/60 text-ios-text-secondary text-[10px]">✕</button>
                      </div>
                    ))}
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
                  className="w-9 h-9 rounded-xl object-cover border border-ios-border shadow-lg"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center text-white font-semibold text-sm ring-1 ring-white/10">
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
                className="w-full pl-10 pr-20 py-2 rounded-xl bg-ios-bg-secondary/60 border border-ios-border text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-ios-text-secondary" />
              <IOSButton
                type="submit"
                size="small"
                className="absolute right-1 top-1 bottom-1 bg-ios-accent text-white"
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
