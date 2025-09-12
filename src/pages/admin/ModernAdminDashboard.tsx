import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { AdminStats, adminService } from '../../services/adminService';
import { DashboardMetricsOverview } from './components/DashboardMetricsOverview';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import { AdminOrdersManagement } from './components/AdminOrdersManagement';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminProductsManagement } from './components/AdminProductsManagement';
import { AdminFeedManagement } from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import { AdminFlashSalesManagement } from './components/AdminFlashSalesManagement';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import { AdminNotificationsPage } from './components/AdminNotificationsPage';
import EnhancedAdminSettings from './EnhancedAdminSettings';
import DataDiagnosticPage from '../DataDiagnosticPage';
import FloatingNotifications from './FloatingNotifications';
import { IOSButton } from '../../components/ios/IOSDesignSystem';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../styles/standardClasses';
import { 
  AdminSidebar, 
  AdminMobileHeader, 
  AdminMobileMenu, 
  navigationItems,
  AdminTab 
} from './components/structure';

const ModernAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasStatsError, setHasStatsError] = useState(false);
  const [statsErrorMessage, setStatsErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update main content margin when sidebar state changes
  useEffect(() => {
    const updateMainContentMargin = () => {
      const mainContent = document.querySelector('[data-main-content]') as HTMLElement;
      if (mainContent) {
        if (window.innerWidth >= 1024) { // lg breakpoint
          const margin = sidebarCollapsed ? '80px' : '256px'; // Updated collapsed width
          mainContent.style.marginLeft = margin;
        } else {
          mainContent.style.marginLeft = '0px'; // No margin on mobile
        }
      }
    };

    updateMainContentMargin();
    window.addEventListener('resize', updateMainContentMargin);
    return () => window.removeEventListener('resize', updateMainContentMargin);
  }, [sidebarCollapsed]);

  useEffect(() => {
    loadStats();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  const formatDateTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const renderContent = () => {
    // Add diagnostic page for development
    if (window.location.search.includes('diagnostic')) {
      return <DataDiagnosticPage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardContent onRefreshStats={loadStats} />;
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
      case 'notifications':
        return <AdminNotificationsPage />;
      case 'settings':
        return <EnhancedAdminSettings />;
      default:
        return <AdminDashboardContent onRefreshStats={loadStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <RLSDiagnosticsBanner
        hasErrors={hasStatsError}
        errorMessage={statsErrorMessage}
        statsLoaded={!loading}
      />
      <AdminMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          version="2.2.0"
        />
        <AdminMobileMenu
          open={isMobileMenuOpen}
          activeTab={activeTab}
          onClose={() => setIsMobileMenuOpen(false)}
          onSelect={setActiveTab}
        />

        {/* Enhanced Main Content Area with proper spacing for fixed sidebar */}
        <div 
          data-main-content
          className="flex-1 min-w-0 bg-gradient-to-br from-black via-gray-950 to-black transition-all duration-300 pt-20 lg:pt-0"
          style={{ marginLeft: '256px' }} // Default desktop margin
        >
          {/* Enhanced Sticky Content Header */}
          <div className="hidden lg:block sticky top-0 z-30 bg-gradient-to-r from-black/95 via-gray-950/95 to-black/95 backdrop-blur-md border-b border-pink-500/20 shadow-xl shadow-pink-500/10">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-lg text-pink-200/80 mt-2 font-medium">
                    Manage your {activeTab === 'dashboard' ? 'business overview' : activeTab.replace('-', ' ')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Current Date and Time */}
                  <div className="flex flex-col items-end text-right">
                    <div className="text-lg font-bold text-pink-200">{formatDateTime(currentTime).time}</div>
                    <div className="text-sm text-gray-400">{formatDateTime(currentTime).date}</div>
                  </div>
                  
                  {/* Back to Store Button */}
                  <IOSButton
                    variant="ghost"
                    size="small"
                    onClick={() => window.open('/', '_blank')}
                    className="flex items-center space-x-2 p-3 rounded-2xl hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-200 font-medium">Back to Store</span>
                  </IOSButton>
                </div>
              </div>
            </div>
          </div>          {/* Main Content with larger padding */}
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
