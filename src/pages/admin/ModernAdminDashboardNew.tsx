import React, { useState, useEffect } from 'react';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import { AdminOrdersManagement } from './components/AdminOrdersManagementNew';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminProductsManagement } from './components/AdminProductsManagement';
import AdminFeedManagement from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import AdminFlashSalesV2 from './AdminFlashSalesV2';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import { AdminHeader } from './components/AdminHeaderNew';
import { AdminTab } from './components/structure/adminTypes';
import DashboardLayout from './layout/DashboardLayout';
import { DashboardSection } from './layout/DashboardPrimitives';
import '../../styles/dashboard.css';
import { ThemeProvider } from '../../contexts/ThemeContext';
import DataDiagnosticPage from '../DataDiagnosticPage';
import FloatingNotifications from './FloatingNotifications';
import CommandPalette from './components/CommandPalette';
import { RLSDiagnosticsBanner } from '../../components/ios/RLSDiagnosticsBanner';

const ModernAdminDashboard: React.FC = () => {
  // Default to dashboard now that overview & legacy stats overview removed
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasStatsError, setHasStatsError] = useState(false);
  const [statsErrorMessage, setStatsErrorMessage] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Listen for global open-command-palette events (triggered by header button or keyboard shortcut)
  useEffect(() => {
    const handler = () => setIsCommandOpen(true);
    window.addEventListener('open-command-palette', handler as EventListener);
    return () => window.removeEventListener('open-command-palette', handler as EventListener);
  }, []);

  // Theme toggle event from command palette
  useEffect(() => {
    const themeHandler = () => {
      try {
        // Dispatch click on existing ThemeToggle button if present
        const btn = document.querySelector('[aria-label^="Switch to "]') as HTMLButtonElement | null;
        btn?.click();
      } catch {}
    };
    window.addEventListener('toggle-theme', themeHandler as EventListener);
    return () => window.removeEventListener('toggle-theme', themeHandler as EventListener);
  }, []);

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
        return <AdminFlashSalesV2 />;
      case 'reviews':
        return <AdminReviewsManagement />;
      default:
        return <AdminDashboardContent onRefreshStats={loadStats} />;
    }
  };

  return (
    <ThemeProvider>
      <DashboardLayout
        fullWidth
        header={
          <>
            <RLSDiagnosticsBanner 
              hasErrors={hasStatsError}
              errorMessage={statsErrorMessage}
              statsLoaded={!loading}
            />
            <AdminHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              onRefreshStats={loadStats}
            />
          </>
        }
      >
        <DashboardSection dense>
          {renderContent()}
        </DashboardSection>
        <FloatingNotifications />
        <CommandPalette
          open={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onNavigate={(tab) => { setActiveTab(tab); setIsCommandOpen(false); }}
          onRefreshStats={loadStats}
        />
      </DashboardLayout>
    </ThemeProvider>
  );
};

export default ModernAdminDashboard;
