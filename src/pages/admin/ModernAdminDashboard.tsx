import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AdminStats, adminService } from '../../services/adminService';
import { DashboardMetricsOverview } from './components/DashboardMetricsOverview';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import { AdminOrdersManagement } from './components/AdminOrdersManagement';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminProductsManagement } from './components/AdminProductsManagement';
import AdminFeedManagement from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import { AdminNotificationsPage } from './components/AdminNotificationsPage';
import EnhancedAdminSettings from './EnhancedAdminSettings';
import DataDiagnosticPage from '../DataDiagnosticPage';
import FloatingNotifications from './FloatingNotifications';
import { RefactoredAdminFlashSalesManagement } from '../../components/admin/flash-sales';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../utils/cn';
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
        return <RefactoredAdminFlashSalesManagement onRefresh={loadStats} />;
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
          {/* Main Content with standardized spacing token */}
          <main className="admin-page-container">
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
