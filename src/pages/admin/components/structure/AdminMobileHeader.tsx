import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';

interface AdminMobileHeaderProps {
  onOpenMenu(): void;
}

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({ onOpenMenu }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const { time, date } = formatDateTime(currentTime);

  return (
    <div className="lg:hidden bg-gradient-to-r from-black via-gray-950 to-black backdrop-blur-md border-b border-pink-500/30 sticky top-0 left-0 right-0 z-50 shadow-2xl shadow-pink-500/10">
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
        
        <div className="flex items-center space-x-3">
          {/* Current Date and Time */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="text-sm font-semibold text-pink-200">{time}</div>
            <div className="text-xs text-gray-400">{date}</div>
          </div>
          
          {/* Back to Store Button */}
          <IOSButton 
            variant="ghost" 
            size="small" 
            onClick={() => window.open('/', '_blank')}
            className="flex items-center space-x-2 p-3 rounded-2xl hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-blue-400" />
            <span className="text-blue-200 font-medium text-sm">Store</span>
          </IOSButton>
        </div>
      </div>
    </div>
  );
};

export default AdminMobileHeader;
