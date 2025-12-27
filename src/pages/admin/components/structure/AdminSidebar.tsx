import React from 'react';
import { navigationItems } from './navigationConfig';
import { AdminTab } from './adminTypes';
import { SidebarHeader, SidebarToggle, SidebarNavigation } from './sidebar';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle(): void;
  activeTab: AdminTab;
  onChangeTab(tab: AdminTab): void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  activeTab, 
  onChangeTab 
}) => {
  return (
    <div className={`
      hidden lg:flex flex-col transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-64'}
      bg-surface-glass-light border-r border-surface-tint-light fixed left-0 top-0 h-screen overflow-y-auto shadow-2xl z-40
    `}>
      <div className={`
        transition-all duration-300
        ${collapsed ? 'p-stack-md' : 'px-stack-lg py-stack-lg'}
      `}>
        {/* Sidebar Header */}
        <SidebarHeader collapsed={collapsed} onToggle={onToggle} />

        {/* Expand Button for Collapsed State */}
        <SidebarToggle collapsed={collapsed} onToggle={onToggle} />

        {/* Navigation */}
        <SidebarNavigation
          navigationItems={navigationItems}
          activeTab={activeTab}
          collapsed={collapsed}
          onChangeTab={onChangeTab}
        />
      </div>
    </div>
  );
};

export default AdminSidebar;
