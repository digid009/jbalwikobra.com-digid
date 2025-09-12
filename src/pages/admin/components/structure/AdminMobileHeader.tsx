import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';

interface AdminMobileHeaderProps {
  onOpenMenu(): void;
}

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({ onOpenMenu }) => (
  <div className="lg:hidden bg-gradient-to-r from-black via-gray-950 to-black backdrop-blur-md border-b border-pink-500/30 fixed top-0 left-0 right-0 z-50 shadow-2xl shadow-pink-500/10">
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <IOSButton
          variant="ghost"
          size="small"
          onClick={onOpenMenu}
          className="p-3 rounded-2xl hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
        >
          <Menu className="w-6 h-6 text-pink-500" />
        </IOSButton>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>
      <IOSButton 
        variant="ghost" 
        size="small" 
        className="p-3 rounded-2xl hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
      >
        <Bell className="w-6 h-6 text-pink-500" />
      </IOSButton>
    </div>
  </div>
);

export default AdminMobileHeader;
