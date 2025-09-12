import React from 'react';
import { Package, ShoppingCart, Users, MessageSquare } from 'lucide-react';
import { IOSButton } from '../../../components/ios/IOSDesignSystem';
import { AdminTab } from '../types';

interface AdminTabNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminTabNavigation: React.FC<AdminTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    {
      id: 'products' as AdminTab,
      label: 'Products',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'orders' as AdminTab,
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      id: 'users' as AdminTab,
      label: 'Users',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'feed' as AdminTab,
      label: 'Feed',
      icon: <MessageSquare className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-ios-surface-secondary rounded-xl">
      {tabs.map((tab) => (
        <IOSButton
          key={tab.id}
          variant={activeTab === tab.id ? 'primary' : 'secondary'}
          size="medium"
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 transition-all duration-200 ${
            activeTab === tab.id 
              ? 'bg-ios-primary text-white shadow-lg' 
              : 'bg-transparent text-gray-200 hover:bg-ios-surface-tertiary'
          }`}
        >
          {tab.icon}
          {tab.label}
        </IOSButton>
      ))}
    </div>
  );
};

export default AdminTabNavigation;
