import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IOSButton } from '../../components/ios/IOSDesignSystem';
import FloatingNotifications from './FloatingNotifications';
import { useAdminData } from './hooks/useAdminData';
import { AdminTab } from './types';
import {
  DashboardStatsGrid,
  AdminTabNavigation,
  ProductsTab,
  OrdersTab,
  UsersTab,
  FeedTab
} from './components';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const { stats, loading, error } = useAdminData();
  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'users':
        return <UsersTab />;
      case 'feed':
        return <FeedTab />;
      default:
        return <ProductsTab />;
    }
  };

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-ios-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-ios-destructive mb-4">{error}</p>
          <IOSButton variant="primary" onClick={() => window.location.reload()}>
            Retry
          </IOSButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Floating Notifications */}
      <FloatingNotifications />
      
      {/* Header */}
      <div className="bg-ios-surface border-b border-ios-separator sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IOSButton
                variant="secondary"
                size="medium"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </IOSButton>
              <h1 className="text-2xl font-semibold text-ios-text">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Stats */}
        <DashboardStatsGrid stats={stats} loading={loading} />

        {/* Tab Navigation */}
        <AdminTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
