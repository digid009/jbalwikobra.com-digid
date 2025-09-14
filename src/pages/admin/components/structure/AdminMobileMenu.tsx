import React from 'react';
import { X, LayoutDashboard } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { navigationItems } from './navigationConfig';
import { AdminTab } from './adminTypes';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface AdminMobileMenuProps {
  open: boolean;
  activeTab: AdminTab;
  onClose(): void;
  onSelect(tab: AdminTab): void;
}

export const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ open, activeTab, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-gradient-to-b from-black via-gray-950 to-black shadow-2xl border-r border-pink-500/30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-pink-500/30">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                  JB Alwikobra
                </h1>
                <p className="text-sm font-medium text-pink-300/80">Admin Panel</p>
              </div>
            </div>
            <IOSButton 
              variant="ghost" 
              size="small" 
              onClick={onClose} 
              className="p-2 rounded-2xl hover:bg-pink-500/20 border border-pink-500/30"
            >
              <X className="w-5 h-5 text-pink-300" />
            </IOSButton>
          </div>
          <nav className="space-y-3">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className={cn(
                    'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-base relative group',
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-fuchsia-600 text-white shadow-lg ring-2 ring-pink-500/50'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-pink-600/20 hover:text-pink-300 hover:shadow-md hover:ring-1 hover:ring-pink-500/30'
                  )}
                >
                  <Icon className={cn(
                    'w-6 h-6 transition-all duration-300',
                    isActive ? 'text-white drop-shadow-sm' : 'text-pink-400 group-hover:text-pink-300'
                  )} />
                  <span className="text-base font-semibold tracking-wide">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-sm animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 pt-6 border-t border-pink-500/30 text-sm font-medium text-pink-300/70 text-center">
            Version 2.2.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMobileMenu;
