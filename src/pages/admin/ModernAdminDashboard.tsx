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
  ChevronRight
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
import { IOSCard, IOSButton } from '../../components/ios/IOSDesignSystem';
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
            <AdminDashboardContent />
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

      {/* Mobile Header */}
      <div className="lg:hidden bg-ios-surface border-b border-ios-border sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-ios-text">Admin Dashboard</h1>
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </IOSButton>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={cn(
          'hidden lg:block transition-all duration-300 ease-in-out',
          sidebarWidth,
          'bg-ios-surface border-r border-ios-border sticky top-0 h-screen overflow-y-auto'
        )}>
          <div className="p-4">
            {/* Logo/Title */}
            <div className="flex items-center justify-between mb-6">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-bold text-ios-text">Admin Panel</h1>
              )}
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </IOSButton>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const badgeValue = getBadgeValue(item.badge);
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-ios-accent text-white shadow-lg'
                        : 'text-ios-text-secondary hover:bg-ios-background hover:text-ios-text',
                      sidebarCollapsed && 'justify-center'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {badgeValue && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-ios-accent/20 text-ios-accent">
                            {badgeValue}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-ios-surface shadow-2xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-ios-text">Admin Panel</h1>
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </IOSButton>
                </div>

                <nav className="space-y-1">
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
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-ios-accent text-white shadow-lg'
                            : 'text-ios-text-secondary hover:bg-ios-background hover:text-ios-text'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {badgeValue && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-ios-accent/20 text-ios-accent">
                            {badgeValue}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Full Width */}
        <div className="flex-1 min-w-0">
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Floating Notifications */}
      <FloatingNotifications />
    </div>
  );
};

export default ModernAdminDashboard;
