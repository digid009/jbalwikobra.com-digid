import React, { useState, useEffect } from 'react';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminDashboardContent } from './components/AdminDashboardContent';
import AdminDashboardContentV2 from './components/AdminDashboardContentV2';
import AdminOrdersV2 from './AdminOrdersV2';
import AdminUsersV2 from './AdminUsersV2';
import AdminProductsV2 from './AdminProductsV2';
import AdminFeedManagement from './components/AdminFeedManagement';
import { AdminBannersManagement } from './components/AdminBannersManagement';
import { AdminFlashSalesManagement } from '../../components/admin/flash-sales';
import { AdminReviewsManagement } from './components/AdminReviewsManagement';
import { AdminHeader } from './components/AdminHeader';
import AdminHeaderV2 from './components/AdminHeaderV2';
import AdminWhatsAppSettings from './AdminWhatsAppSettings';
import { AdminTab } from './components/structure/adminTypes';
import DashboardLayout from './layout/DashboardLayout';
import { DashboardSection } from './layout/DashboardPrimitives';
import '../../styles/dashboard.css';
import { ThemeProvider } from '../../contexts/ThemeContext';
import DataDiagnosticPage from '../DataDiagnosticPage';
// Floating notifications are already included by DashboardLayout
import CommandPalette from './components/CommandPalette';

const AdminDashboard: React.FC = () => {
  // If Supabase isn't configured in development, default to Settings to avoid heavy stats calls
  const hasSupabase = !!process.env.REACT_APP_SUPABASE_URL && !!process.env.REACT_APP_SUPABASE_ANON_KEY;
  const initialTab: AdminTab = (!hasSupabase && process.env.NODE_ENV === 'development') ? 'settings' : 'dashboard';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
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
    // Still try to load stats; adminService has safe fallbacks when Supabase is missing
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

  const refreshStats = async () => {
    try {
      setLoading(true);
      setHasStatsError(false);
      setStatsErrorMessage('');
      
      // Clear cache and reload
      adminService.clearStatsCache();
      localStorage.removeItem('adminCache'); // Clear any localStorage cache
      
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
      
      console.log('✅ Stats refreshed successfully:', statsData);
    } catch (error: any) {
      console.error('Failed to refresh admin stats:', error);
      setHasStatsError(true);
      setStatsErrorMessage(error.message || 'Failed to refresh dashboard statistics');
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
        return <AdminDashboardContentV2 onRefreshStats={loadStats} />;
      case 'orders':
        return <AdminOrdersV2 />;
      case 'users':
        return <AdminUsersV2 />;
      case 'products':
        return <AdminProductsV2 />;
      case 'feed':
        return <AdminFeedManagement />;
      case 'banners':
        return <AdminBannersManagement />;
      case 'flash-sales':
        return <AdminFlashSalesManagement onRefresh={loadStats} />;
      case 'reviews':
        return <AdminReviewsManagement />;
      case 'settings':
        return <AdminWhatsAppSettings />;
      default:
        return <AdminDashboardContentV2 onRefreshStats={refreshStats} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="admin-dark bg-black min-h-screen">
      <DashboardLayout
        fullWidth
        showFooter={false}
        className="bg-black"
        header={
          <>
            {/* Using new modern header */}
            <AdminHeaderV2
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              onRefreshStats={refreshStats}
            />
          </>
        }
      >
        {/* Remove DashboardSection wrapper since new design handles its own spacing */}
        {renderContent()}
        <CommandPalette
          open={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onNavigate={(tab) => { setActiveTab(tab); setIsCommandOpen(false); }}
          onRefreshStats={loadStats}
        />
      </DashboardLayout>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
