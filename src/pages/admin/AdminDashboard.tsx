import React, { useState, useEffect } from 'react';
import { AdminStats, adminService } from '../../services/adminService';
import { AdminHeader } from './components/AdminHeader';
import { AdminNavigation } from './components/AdminNavigation';
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
import { AdminNotificationsProvider } from './notifications/AdminNotificationsContext';
import { standardClasses, cn } from '../../styles/standardClasses';

export type AdminTab = 
  | 'dashboard' 
  | 'orders' 
  | 'users' 
  | 'products' 
  | 'feed' 
  | 'banners' 
  | 'flash-sales' 
  | 'reviews';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      // Error silently handled by the service
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await adminService.searchAll(searchQuery);
      // Search completed
      // Handle search results - could show in a modal or navigate to results page
    } catch (error) {
      // Search error silently handled
    }
  };

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

  return (
    <AdminNotificationsProvider>
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-ios-text">
      <AdminHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="pt-16">
        <div className={standardClasses.container.boxed}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <AdminNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                stats={stats}
              />
            </div>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute left-0 top-16 bottom-0 w-64 bg-white shadow-xl">
                  <AdminNavigation 
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      setActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                    stats={stats}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notifications */}
      <FloatingNotifications />
    </div>
    </AdminNotificationsProvider>
  );
};

export default AdminDashboard;
