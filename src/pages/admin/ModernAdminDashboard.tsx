import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
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

  const renderContent = () => {
    // Add diagnostic page for development
    if (window.location.search.includes('diagnostic')) {
      return <DataDiagnosticPage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashboardMetricsOverview onRefresh={loadStats} />
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
        return <DashboardMetricsOverview onRefresh={loadStats} />;
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

      <div className="flex">;
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

        {/* Enhanced Main Content Area */}
        <div className="flex-1 min-w-0 bg-gradient-to-br from-black via-gray-950 to-black">
          {/* Enhanced Sticky Content Header */}
          <div className="hidden lg:block sticky top-0 z-10 bg-gradient-to-r from-black/95 via-gray-950/95 to-black/95 backdrop-blur-md border-b border-pink-500/20 shadow-xl shadow-pink-500/10">
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
                <IOSButton
                  variant="ghost"
                  size="small"
                  className="p-3 rounded-2xl hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
                >
                  <Bell className="w-6 h-6 text-pink-500" />
                </IOSButton>
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
