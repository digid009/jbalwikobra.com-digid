import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  MessageSquare, 
  Image, 
  Zap, 
  Star 
} from 'lucide-react';
import { AdminStats } from '../../../services/adminService';
import { AdminTab } from '../ModernAdminDashboard';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystem';

interface AdminNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  stats: AdminStats | null;
}

const navigationItems = [
  {
    id: 'dashboard' as AdminTab,
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    id: 'orders' as AdminTab,
    label: 'Orders',
    icon: ShoppingCart,
    badge: 'pendingOrders',
  },
  {
    id: 'users' as AdminTab,
    label: 'Users',
    icon: Users,
    badge: null,
  },
  {
    id: 'products' as AdminTab,
    label: 'Products',
    icon: Package,
    badge: null,
  },
  {
    id: 'feed' as AdminTab,
    label: 'Feed Posts',
    icon: MessageSquare,
    badge: null,
  },
  {
    id: 'banners' as AdminTab,
    label: 'Banners',
    icon: Image,
    badge: null,
  },
  {
    id: 'flash-sales' as AdminTab,
    label: 'Flash Sales',
    icon: Zap,
    badge: null,
  },
  {
    id: 'reviews' as AdminTab,
    label: 'Reviews',
    icon: Star,
    badge: null,
  },
];

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  activeTab,
  onTabChange,
  stats,
}) => {
  const getBadgeValue = (badgeKey: string | null) => {
    if (!badgeKey || !stats) return null;
    return (stats as any)[badgeKey] || null;
  };

  return (
    <div className="w-full">
      <IOSCard className="sticky top-20">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            Admin Panel
          </h2>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const badgeValue = getBadgeValue(item.badge);
              const isActive = activeTab === item.id;
              
              return (
                <IOSButton
                  key={item.id}
                  variant={isActive ? "primary" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className="w-full justify-start px-3 py-2 text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    
                    {badgeValue && badgeValue > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {badgeValue}
                      </span>
                    )}
                  </div>
                </IOSButton>
              );
            })}
          </nav>
          
          {/* Quick Stats */}
          {stats && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-200 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-200">Total Users:</span>
                  <span className="font-medium">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Total Orders:</span>
                  <span className="font-medium">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Revenue:</span>
                  <span className="font-medium">Rp {stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Products:</span>
                  <span className="font-medium">{stats.totalProducts}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};
