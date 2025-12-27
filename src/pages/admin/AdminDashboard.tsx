import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminTab } from './components/structure/adminTypes';
import DashboardLayout from './layout/DashboardLayout';
import { DashboardSection } from './layout/DashboardPrimitives';
import '../../styles/dashboard.css';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Lazy load all tab components for code splitting
const AdminDashboardContentV2 = lazy(() => import('./components/AdminDashboardContentV2'));
const AdminOrdersV2 = lazy(() => import('./AdminOrdersV2'));
const AdminUsersV2 = lazy(() => import('./AdminUsersV2'));
const AdminProductsV2 = lazy(() => import('./AdminProductsV2'));
const AdminFeedManagement = lazy(() => import('./components/AdminFeedManagement'));
const AdminBannersManagement = lazy(() => import('./components/AdminBannersManagement').then(m => ({ default: m.AdminBannersManagement })));
const AdminFlashSalesManagement = lazy(() => import('../../components/admin/flash-sales').then(m => ({ default: m.AdminFlashSalesManagement })));
const AdminReviewsManagement = lazy(() => import('./components/AdminReviewsManagement').then(m => ({ default: m.AdminReviewsManagement })));
const AdminNotificationsPage = lazy(() => import('./components/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })));
const AdminHeaderV2 = lazy(() => import('./components/AdminHeaderV2'));
const AdminWhatsAppSettings = lazy(() => import('./AdminWhatsAppSettings'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const DataDiagnosticPage = lazy(() => import('../DataDiagnosticPage'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current tab from URL path
  const getTabFromPath = useCallback((): AdminTab => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const validTabs: AdminTab[] = ['dashboard', 'orders', 'users', 'products', 'feed', 'banners', 'flash-sales', 'reviews', 'notifications', 'settings'];
    const isValidTab = validTabs.some(tab => tab === path);
    return isValidTab ? (path as AdminTab) : 'dashboard';
  }, [location.pathname]);
  
  const [activeTab, setActiveTab] = useState<AdminTab>(getTabFromPath());
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasStatsError, setHasStatsError] = useState(false);
  const [statsErrorMessage, setStatsErrorMessage] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, getTabFromPath]);

  // Navigate to new tab using React Router
  const handleTabChange = useCallback((tab: AdminTab) => {
    navigate(`/admin/${tab}`, { replace: false });
  }, [navigate]);

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
        return <AdminDashboardContentV2 onRefreshStats={loadStats} onNavigate={handleTabChange} />;
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
      case 'notifications':
        return <AdminNotificationsPage />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardContentV2 onRefreshStats={refreshStats} onNavigate={handleTabChange} />;
    }
  };

  // Loading fallback component for Suspense
  const LoadingFallback = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="admin-dark bg-black min-h-screen">
      <DashboardLayout
        fullWidth
        showFooter={false}
        className="bg-black"
        header={
          <Suspense fallback={<div className="h-16 bg-black border-b border-gray-800"></div>}>
            <AdminHeaderV2
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              stats={stats}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              onRefreshStats={refreshStats}
            />
          </Suspense>
        }
      >
        <Suspense fallback={<LoadingFallback />}>
          {renderContent()}
        </Suspense>
        <Suspense fallback={null}>
          <CommandPalette
            open={isCommandOpen}
            onClose={() => setIsCommandOpen(false)}
            onNavigate={(tab) => { handleTabChange(tab); setIsCommandOpen(false); }}
            onRefreshStats={loadStats}
          />
        </Suspense>
      </DashboardLayout>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
