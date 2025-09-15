import React from 'react';
import { NavigationItem } from '../navigationConfig';
import { AdminTab } from '../adminTypes';
import { SidebarItem } from './SidebarItem';

interface SidebarNavigationProps {
  navigationItems: NavigationItem[];
  activeTab: AdminTab;
  collapsed: boolean;
  onChangeTab: (tab: AdminTab) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  navigationItems,
  activeTab,
  collapsed,
  onChangeTab,
}) => {
  return (
    <nav className="space-y-2">
      {navigationItems.map(item => (
        <SidebarItem
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.id}
          collapsed={collapsed}
          onClick={onChangeTab}
        />
      ))}
    </nav>
  );
};
