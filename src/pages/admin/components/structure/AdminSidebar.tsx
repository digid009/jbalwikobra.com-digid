import React from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { cn } from '../../../../styles/standardClasses';
import { navigationItems } from './navigationConfig';
import { AdminTab } from './adminTypes';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle(): void;
  activeTab: AdminTab;
  onChangeTab(tab: AdminTab): void;
  version?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, activeTab, onChangeTab, version = '2.2.0' }) => {
  return (
    <div className={cn(
      'hidden lg:flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
      'bg-gradient-to-b from-black via-gray-950 to-black border-r border-pink-500/20 sticky top-0 h-screen overflow-y-auto shadow-2xl shadow-pink-500/10'
    )}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-pink-500/30">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                  JB Alwikobra
                </h1>
                <p className="text-sm font-medium text-pink-300/80">Admin Panel</p>
              </div>
            </div>
          )}
          <IOSButton
            variant="ghost"
            size="small"
            onClick={onToggle}
            className="p-3 rounded-full hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-pink-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-pink-500" />
            )}
          </IOSButton>
        </div>
        <nav className="space-y-3">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-base relative group',
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-fuchsia-600 text-white shadow-lg shadow-pink-500/40 ring-2 ring-pink-500/50 scale-[1.02]'
                    : 'text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-pink-600/20 hover:text-pink-300 hover:scale-[1.01] hover:shadow-md hover:ring-1 hover:ring-pink-500/30',
                  collapsed && 'justify-center px-4'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 flex-shrink-0 transition-all duration-300',
                  isActive ? 'text-white drop-shadow-sm' : 'text-pink-400 group-hover:text-pink-300'
                )} />
                {!collapsed && (
                  <span className="text-base font-semibold tracking-wide">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-sm animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="mt-8 pt-6 border-t border-pink-500/30">
            <div className="text-sm font-medium text-pink-300/70 text-center">
              Version {version}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
