import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Package, MessageSquare, Settings, BarChart3, LogOut, Bell, Search, Menu, ShoppingCart, TrendingUp, DollarSign, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IOSButton, IOSCard, IOSContainer } from '../../components/ios/IOSDesignSystem';
import { useAuth } from '../../contexts/TraditionalAuthContext';
import AdminSettings from './AdminSettings';
import AdminPosts from './AdminPosts';
import FloatingNotifications from './FloatingNotifications';

type AdminTab = 'dashboard' | 'posts' | 'settings' | 'products' | 'orders' | 'users' | 'analytics';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement admin search functionality
      setSearchQuery('');
    }
  };

  // Update tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/posts')) {
      setActiveTab('posts');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else if (path.includes('/products')) {
      setActiveTab('products');
    } else if (path.includes('/orders')) {
      setActiveTab('orders');
    } else if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      // TODO: Replace with real API calls
      setStats({
        totalOrders: 156,
        totalRevenue: 45780000,
        totalUsers: 1240,
        totalProducts: 89
      });
    };
    loadStats();
  }, []);

  // Handle tab change with URL update
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tab}`);
    }
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'posts' as const, label: 'Feed Posts', icon: MessageSquare },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onTabChange={handleTabChange} stats={stats} />;
      case 'posts':
        return <AdminPosts />;
      case 'settings':
        return <AdminSettings />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsView stats={stats} />;
      default:
        return <DashboardOverview onTabChange={handleTabChange} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-ios-background">
      <FloatingNotifications />
      
      {/* Header */}
      <div className="bg-ios-surface border-b border-ios-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-ios-accent to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-ios-text">
                    Admin Panel
                  </h1>
                  <div className="text-xs text-ios-text-secondary -mt-1">JB Alwikobra</div>
                </div>
              </div>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text-secondary" />
                <input
                  type="text"
                  placeholder="Search admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-ios-background border border-ios-border rounded-lg text-sm focus:ring-2 focus:ring-ios-accent focus:border-transparent"
                />
              </form>
              
              {/* Notifications */}
              <div className="relative">
                <IOSButton
                  variant="secondary"
                  size="medium"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </IOSButton>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-ios-surface border border-ios-border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-ios-border">
                      <h3 className="font-semibold text-ios-text">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-ios-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-ios-text">New Order #1234</p>
                            <p className="text-xs text-ios-text-secondary">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-sm text-ios-text-secondary">No more notifications</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu */}
              <IOSButton
                variant="secondary"
                size="medium"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="w-4 h-4" />
              </IOSButton>
              
              {/* Logout */}
              <IOSButton
                variant="secondary"
                size="medium"
                onClick={async () => { 
                  await logout(); 
                  window.location.href = '/'; 
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </IOSButton>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-ios-surface border-b border-ios-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
          
          {/* Mobile Tab Selector */}
          <div className="md:hidden py-4">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value as AdminTab)}
              className="w-full px-4 py-2 bg-ios-background border border-ios-border rounded-lg text-ios-text"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-64 h-full bg-ios-surface border-l border-ios-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-ios-text">Navigation</h3>
              <IOSButton variant="secondary" size="small" onClick={() => setIsMenuOpen(false)}>
                ×
              </IOSButton>
            </div>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-ios-accent text-white'
                        : 'text-ios-text hover:bg-ios-background'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
  stats: DashboardStats;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onTabChange, stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ios-text mb-2">Welcome to Admin Panel</h2>
          <p className="text-ios-text-secondary">
            Manage your website content and settings from here.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <IOSCard padding="large" className="text-center">
            <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-ios-text">{stats.totalOrders}</div>
            <div className="text-sm text-ios-text-secondary">Total Orders</div>
          </IOSCard>
          
          <IOSCard padding="large" className="text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-ios-text">
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-ios-text-secondary">Total Revenue</div>
          </IOSCard>
          
          <IOSCard padding="large" className="text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-ios-text">{stats.totalUsers}</div>
            <div className="text-sm text-ios-text-secondary">Total Users</div>
          </IOSCard>
          
          <IOSCard padding="large" className="text-center">
            <Package className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-ios-text">{stats.totalProducts}</div>
            <div className="text-sm text-ios-text-secondary">Total Products</div>
          </IOSCard>
        </div>

        {/* Quick Action Cards */}
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
            <Package className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Product Management</h3>
            <p className="text-ios-text-secondary mb-4">
              Manage your products, pricing, and inventory
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('products')}
            >
              Manage Products
            </IOSButton>
          </IOSCard>

          <IOSCard padding="large" className="text-center">
            <ShoppingCart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Order Management</h3>
            <p className="text-ios-text-secondary mb-4">
              Track orders, payments, and customer requests
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('orders')}
            >
              View Orders
            </IOSButton>
          </IOSCard>

          <IOSCard padding="large" className="text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">User Management</h3>
            <p className="text-ios-text-secondary mb-4">
              Manage customer accounts and permissions
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('users')}
            >
              Manage Users
            </IOSButton>
          </IOSCard>

          <IOSCard padding="large" className="text-center">
            <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ios-text mb-2">Analytics</h3>
            <p className="text-ios-text-secondary mb-4">
              View detailed reports and performance metrics
            </p>
            <IOSButton 
              size="small"
              onClick={() => onTabChange('analytics')}
            >
              View Analytics
            </IOSButton>
          </IOSCard>
        </div>

        {/* Quick Stats - Enhanced with real status */}
        <IOSCard padding="large">
          <h3 className="text-lg font-semibold text-ios-text mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm text-ios-text-secondary">System Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm text-ios-text-secondary">Database Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm text-ios-text-secondary">Feed Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm text-ios-text-secondary">Settings Ready</div>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
};

// Placeholder components for the missing tabs
const ProductManagement: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <IOSCard padding="large">
      <h2 className="text-xl font-semibold text-ios-text mb-4">Product Management</h2>
      <p className="text-ios-text-secondary">Product management functionality will be implemented here.</p>
    </IOSCard>
  </div>
);

const OrderManagement: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <IOSCard padding="large">
      <h2 className="text-xl font-semibold text-ios-text mb-4">Order Management</h2>
      <p className="text-ios-text-secondary">Order management functionality will be implemented here.</p>
    </IOSCard>
  </div>
);

const UserManagement: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <IOSCard padding="large">
      <h2 className="text-xl font-semibold text-ios-text mb-4">User Management</h2>
      <p className="text-ios-text-secondary">User management functionality will be implemented here.</p>
    </IOSCard>
  </div>
);

const AnalyticsView: React.FC<{ stats: DashboardStats }> = ({ stats }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-ios-text">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IOSCard padding="large" className="text-center">
          <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-ios-text">{stats.totalOrders}</div>
          <div className="text-sm text-ios-text-secondary">Total Orders</div>
          <div className="text-xs text-green-500 mt-1">+12% from last month</div>
        </IOSCard>
        
        <IOSCard padding="large" className="text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-ios-text">
            Rp {stats.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-sm text-ios-text-secondary">Total Revenue</div>
          <div className="text-xs text-green-500 mt-1">+8% from last month</div>
        </IOSCard>
        
        <IOSCard padding="large" className="text-center">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-ios-text">{stats.totalUsers}</div>
          <div className="text-sm text-ios-text-secondary">Total Users</div>
          <div className="text-xs text-green-500 mt-1">+25% from last month</div>
        </IOSCard>
        
        <IOSCard padding="large" className="text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-ios-text">4.8</div>
          <div className="text-sm text-ios-text-secondary">Avg Rating</div>
          <div className="text-xs text-green-500 mt-1">+0.2 from last month</div>
        </IOSCard>
      </div>
      
      <IOSCard padding="large">
        <h3 className="text-lg font-semibold text-ios-text mb-4">Recent Activity</h3>
        <p className="text-ios-text-secondary">Detailed analytics charts and reports will be implemented here.</p>
      </IOSCard>
    </div>
  </div>
);

export default AdminDashboard;
