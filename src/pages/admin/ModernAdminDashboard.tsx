import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  MessageSquare, 
  Image, 
  Zap, 
  Star,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminStatsOverview } from './components/AdminStatsOverview';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import { AdminOrdersManagement } from './components/AdminOrdersManagement';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminProductsManagement } from './components/AdminProductsManagement';
import { AdminFeedManagement } from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import { AdminFlashSalesManagement } from './components/AdminFlashSalesManagement';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import FloatingNotifications from './FloatingNotifications';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../styles/standardClasses';

export type AdminTab = 
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
  icon: React.ComponentType<{ className?: string }>;
  badge?: keyof AdminStats | null;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    badge: 'pendingOrders',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    badge: 'totalUsers',
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    badge: 'totalProducts',
  },
  {
    id: 'feed',
    label: 'Feed Posts',
    icon: MessageSquare,
    badge: null,
  },
  {
    id: 'banners',
    label: 'Banners',
    icon: Image,
    badge: null,
  },
  {
    id: 'flash-sales',
    label: 'Flash Sales',
    icon: Zap,
    badge: null,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star,
    badge: 'totalReviews',
  },
];

const ModernAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasStatsError, setHasStatsError] = useState(false);
  const [statsErrorMessage, setStatsErrorMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setHasStatsError(false);
      setStatsErrorMessage('');
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load admin stats:', error);
      setHasStatsError(true);
      setStatsErrorMessage(error.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const sidebarWidth = useMemo(() => {
    if (sidebarCollapsed) return 'w-16';
    return 'w-64';
  }, [sidebarCollapsed]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <AdminStatsOverview stats={stats} loading={loading} />
            <AdminDashboardContent onRefreshStats={loadStats} />
          </>
        );
      case 'orders':
        return <AdminOrdersManagement />;
      case 'users':
        return <AdminUsersManagement />;
      case 'products':
        return <AdminProductsManagement />;
      case 'feed':
        return <AdminFeedManagement />;
      case 'banners':
        return <AdminBannersManagement />;
      case 'flash-sales':
        return <AdminFlashSalesManagement />;
      case 'reviews':
        return <AdminReviewsManagement />;
      default:
        return <AdminStatsOverview stats={stats} loading={loading} />;
    }
  };

  const getBadgeValue = (badge: keyof AdminStats | null) => {
    if (!badge || !stats) return null;
    const value = stats[badge];
    return typeof value === 'number' && value > 0 ? value : null;
  };

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Global RLS Diagnostics */}
      <RLSDiagnosticsBanner 
        hasErrors={hasStatsError}
        errorMessage={statsErrorMessage}
        statsLoaded={!loading}
      />

      {/* iOS-style Mobile Header */}
      <div className="lg:hidden bg-ios-surface/95 backdrop-blur-md border-b border-ios-border/30 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <IOSButton
              variant="ghost"
              size="small"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-full"
            >
              <Menu className="w-5 h-5 text-ios-primary" />
            </IOSButton>
            <h1 className="text-xl font-semibold text-ios-text">Admin</h1>
          </div>
          <IOSButton
            variant="ghost"
            size="small"
            className="p-2 rounded-full"
          >
            <Bell className="w-5 h-5 text-ios-text-secondary" />
          </IOSButton>
        </div>
      </div>

      <div className="flex">
        {/* Enhanced iOS-style Desktop Sidebar */}
        <div className={cn(
          'hidden lg:block transition-all duration-300 ease-in-out',
          sidebarWidth,
          'bg-ios-surface/95 backdrop-blur-md border-r border-ios-border/30 sticky top-0 h-screen overflow-y-auto'
        )}>
          <div className="p-4">
            {/* Enhanced Logo/Title */}
            <div className="flex items-center justify-between mb-8">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ios-primary to-ios-secondary rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-ios-text">JB Alwikobra</h1>
                    <p className="text-xs text-ios-text-secondary">Admin Panel</p>
                  </div>
                </div>
              )}
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-full hover:bg-ios-background/50"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-ios-text-secondary" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-ios-text-secondary" />
                )}
              </IOSButton>
            </div>

            {/* Enhanced Navigation with iOS styling */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const badgeValue = getBadgeValue(item.badge);
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium',
                      isActive
                        ? 'bg-gradient-to-r from-ios-primary to-ios-secondary text-white shadow-lg shadow-ios-primary/25 transform scale-[1.02]'
                        : 'text-ios-text-secondary hover:bg-ios-background/50 hover:text-ios-text hover:transform hover:scale-[1.01]',
                      sidebarCollapsed && 'justify-center px-3'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-ios-text-secondary'
                    )} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-sm">{item.label}</span>
                        {badgeValue && (
                          <span className={cn(
                            'ml-auto px-2 py-1 text-xs font-bold rounded-full',
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-ios-primary text-white'
                          )}>
                            {badgeValue > 99 ? '99+' : badgeValue}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="mt-8 pt-6 border-t border-ios-border/30">
                <div className="text-xs text-ios-text-secondary text-center">
                  Version 2.1.9
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced iOS-style Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-ios-surface/95 backdrop-blur-md shadow-2xl border-r border-ios-border/30">
              <div className="p-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-ios-primary to-ios-secondary rounded-xl flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-ios-text">JB Alwikobra</h1>
                      <p className="text-xs text-ios-text-secondary">Admin Panel</p>
                    </div>
                  </div>
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full"
                  >
                    <X className="w-5 h-5 text-ios-text-secondary" />
                  </IOSButton>
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const badgeValue = getBadgeValue(item.badge);
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium',
                          isActive
                            ? 'bg-gradient-to-r from-ios-primary to-ios-secondary text-white shadow-lg'
                            : 'text-ios-text-secondary hover:bg-ios-background/50 hover:text-ios-text'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                        {badgeValue && (
                          <span className={cn(
                            'ml-auto px-2 py-1 text-xs font-bold rounded-full',
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-ios-primary text-white'
                          )}>
                            {badgeValue > 99 ? '99+' : badgeValue}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile Footer */}
                <div className="mt-8 pt-6 border-t border-ios-border/30">
                  <div className="text-xs text-ios-text-secondary text-center">
                    Version 2.1.9
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Main Content Area */}
        <div className="flex-1 min-w-0 bg-ios-background">
          {/* Content Header */}
          <div className="hidden lg:block sticky top-0 z-10 bg-ios-background/95 backdrop-blur-md border-b border-ios-border/20">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-ios-text">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-ios-text-secondary text-sm mt-1">
                    Manage your {activeTab === 'dashboard' ? 'business overview' : activeTab.replace('-', ' ')}
                  </p>
                </div>
                <IOSButton
                  variant="ghost"
                  size="small"
                  className="p-2 rounded-full"
                >
                  <Bell className="w-5 h-5 text-ios-text-secondary" />
                </IOSButton>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Enhanced Floating Notifications */}
      <FloatingNotifications />
    </div>
  );
};

export default ModernAdminDashboard;
