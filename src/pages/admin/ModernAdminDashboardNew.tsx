import React, { useState, useEffect } from 'react';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminStatsOverview } from './components/AdminStatsOverview';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import { AdminOrdersManagement } from './components/AdminOrdersManagementNew';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminProductsManagement } from './components/AdminProductsManagement';
import { AdminFeedManagement } from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import { AdminFlashSalesManagement } from './components/AdminFlashSalesManagement';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import { AdminOverview } from './components/AdminOverview';
import { AdminHeader, AdminTab } from './components/AdminHeaderNew';
import { ThemeProvider } from '../../contexts/ThemeContext';
import DataDiagnosticPage from '../DataDiagnosticPage';
import FloatingNotifications from './FloatingNotifications';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';

const ModernAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Global RLS Diagnostics */}
        <RLSDiagnosticsBanner 
          hasErrors={hasStatsError}
          errorMessage={statsErrorMessage}
          statsLoaded={!loading}
        />

        {/* Header with Navigation */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onRefreshStats={loadStats}
        />

        {/* Main Content */}
        <main className="pt-4 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Floating Notifications */}
        <FloatingNotifications />
      </div>
    </ThemeProvider>
  );
};

export default ModernAdminDashboard;
