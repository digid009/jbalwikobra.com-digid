import React, { useState } from 'react';
import { ArrowLeft, Users, Package, MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IOSButton, IOSCard, IOSContainer } from '../../components/ios/IOSDesignSystem';
import AdminSettings from './AdminSettings';
import AdminPosts from './AdminPosts';

type AdminTab = 'dashboard' | 'posts' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'posts' as const, label: 'Feed Posts', icon: MessageSquare },
    { id: 'settings' as const, label: 'Website Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onTabChange={setActiveTab} />;
      case 'posts':
        return <AdminPosts />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Header */}
      <div className="bg-ios-surface border-b border-ios-border sticky top-0 z-10">
        <IOSContainer maxWidth="full" className="py-4">
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
                Admin Panel
              </h1>
            </div>
          </div>
        </IOSContainer>
      </div>

      {/* Tab Navigation */}
      <div className="bg-ios-surface border-b border-ios-border">
        <IOSContainer maxWidth="full" className="py-0">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-ios-accent border-ios-accent bg-ios-accent/5'
                      : 'text-ios-text-secondary border-transparent hover:text-ios-text hover:border-ios-border'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </IOSContainer>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Simplified Dashboard Overview Component
interface DashboardOverviewProps {
  onTabChange: (tab: AdminTab) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onTabChange }) => {
  return (
    <IOSContainer maxWidth="full">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ios-text mb-2">Welcome to Admin Panel</h2>
          <p className="text-ios-text-secondary">
            Manage your website content and settings from here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IOSCard padding="large" className="text-center">
            <MessageSquare className="w-12 h-12 text-ios-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Feed Posts</h3>
            <p className="text-ios-text-secondary mb-4">
              Create and manage feed posts for your community
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('posts')}
            >
              Manage Posts
            </IOSButton>
          </IOSCard>

          <IOSCard padding="large" className="text-center">
            <Settings className="w-12 h-12 text-ios-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Website Settings</h3>
            <p className="text-ios-text-secondary mb-4">
              Configure website information and social media links
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('settings')}
            >
              Open Settings
            </IOSButton>
          </IOSCard>

          <IOSCard padding="large" className="text-center">
            <Package className="w-12 h-12 text-ios-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Content Management</h3>
            <p className="text-ios-text-secondary mb-4">
              All essential admin features in one place
            </p>
            <IOSButton 
              size="small"
              variant="secondary"
              disabled
            >
              Coming Soon
            </IOSButton>
          </IOSCard>
        </div>

        {/* Quick Stats - Static for now */}
        <IOSCard padding="large">
          <h3 className="text-lg font-semibold text-ios-text mb-4">Quick Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ios-accent">✓</div>
              <div className="text-sm text-ios-text-secondary">System Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ios-accent">✓</div>
              <div className="text-sm text-ios-text-secondary">Database Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ios-accent">✓</div>
              <div className="text-sm text-ios-text-secondary">Feed Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ios-accent">✓</div>
              <div className="text-sm text-ios-text-secondary">Settings Ready</div>
            </div>
          </div>
        </IOSCard>
      </div>
    </IOSContainer>
  );
};

export default AdminDashboard;
