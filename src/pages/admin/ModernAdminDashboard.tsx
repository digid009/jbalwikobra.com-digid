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
  Bell,
  Home
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
import { AdminOverview } from './components/AdminOverview';
import DataDiagnosticPage from '../DataDiagnosticPage';
import FloatingNotifications from './FloatingNotifications';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../styles/standardClasses';

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
  icon: React.ComponentType<{ className?: string }>;
  badge?: keyof AdminStats | null;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    badge: null,
  },
  {
    id: 'dashboard',
    label: 'Analytics',
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
    // Add diagnostic page for development
    if (window.location.search.includes('diagnostic')) {
      return <DataDiagnosticPage />;
    }

    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigate={(section) => setActiveTab(section as AdminTab)} />;
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
        return <AdminOverview onNavigate={(section) => setActiveTab(section as AdminTab)} />;
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

      {/* Enhanced Sticky Mobile Header */}
      <div className="lg:hidden bg-ios-surface/95 backdrop-blur-md border-b border-ios-border/30 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <IOSButton
              variant="ghost"
              size="small"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 rounded-full hover:bg-pink-50"
            >
              <Menu className="w-6 h-6 text-pink-600" />
            </IOSButton>
            <h1 className="text-xl font-bold text-ios-text">Admin Dashboard</h1>
          </div>
          <IOSButton
            variant="ghost"
            size="small"
            className="p-3 rounded-full hover:bg-pink-50"
          >
            <Bell className="w-6 h-6 text-pink-600" />
          </IOSButton>
        </div>
      </div>

      <div className="flex">
        {/* Enhanced Sticky Desktop Sidebar */}
        <div className={cn(
          'hidden lg:flex flex-col transition-all duration-300 ease-in-out',
          sidebarWidth,
          'bg-ios-surface/95 backdrop-blur-md border-r border-ios-border/30 sticky top-0 h-screen overflow-y-auto shadow-xl'
        )}>
          <div className="p-6">
            {/* Enhanced Logo/Title with larger fonts */}
            <div className="flex items-center justify-between mb-8">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-ios-text">JB Alwikobra</h1>
                    <p className="text-sm font-medium text-ios-text-secondary">Admin Panel</p>
                  </div>
                </div>
              )}
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 rounded-full hover:bg-pink-50"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-pink-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-pink-600" />
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
                      'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 font-semibold text-base',
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25 transform scale-[1.02]'
                        : 'text-ios-text hover:bg-pink-50 hover:text-pink-600 hover:transform hover:scale-[1.01] hover:shadow-md',
                      sidebarCollapsed && 'justify-center px-4'
                    )}
                  >
                    <Icon className={cn(
                      'w-6 h-6 flex-shrink-0 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-pink-500'
                    )} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="text-base font-medium">{item.label}</span>
                        {badgeValue && (
                          <span className={cn(
                            'ml-auto px-3 py-1 text-sm font-bold rounded-full',
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-pink-500 text-white'
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

            {/* Sidebar Footer with larger text */}
            {!sidebarCollapsed && (
              <div className="mt-8 pt-6 border-t border-ios-border/30">
                <div className="text-sm font-medium text-ios-text-secondary text-center">
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
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-ios-text">JB Alwikobra</h1>
                      <p className="text-sm font-medium text-ios-text-secondary">Admin Panel</p>
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
                          'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 font-semibold text-base',
                          isActive
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                            : 'text-ios-text hover:bg-pink-50 hover:text-pink-600 hover:shadow-md'
                        )}
                      >
                        <Icon className="w-6 h-6 text-pink-500" />
                        <span className="text-base font-medium">{item.label}</span>
                        {badgeValue && (
                          <span className={cn(
                            'ml-auto px-3 py-1 text-sm font-bold rounded-full',
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-pink-500 text-white'
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
                  <div className="text-sm font-medium text-ios-text-secondary text-center">
                    Version 2.1.9
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Main Content Area */}
        <div className="flex-1 min-w-0 bg-ios-background">
          {/* Enhanced Sticky Content Header */}
          <div className="hidden lg:block sticky top-0 z-10 bg-ios-background/95 backdrop-blur-md border-b border-ios-border/20 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-ios-text">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-lg text-ios-text-secondary mt-2 font-medium">
                    Manage your {activeTab === 'dashboard' ? 'business overview' : activeTab.replace('-', ' ')}
                  </p>
                </div>
                <IOSButton
                  variant="ghost"
                  size="small"
                  className="p-3 rounded-full hover:bg-pink-50"
                >
                  <Bell className="w-6 h-6 text-pink-600" />
                </IOSButton>
              </div>
            </div>
          </div>

          {/* Main Content with larger padding */}
          <main className="p-8 lg:p-10">
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
