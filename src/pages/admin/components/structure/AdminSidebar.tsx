import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { cn } from '../../../../styles/standardClasses';
import { navigationItems } from './navigationConfig';
import { AdminTab } from './adminTypes';
import { SettingsService } from '../../../../services/settingsService';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle(): void;
  activeTab: AdminTab;
  onChangeTab(tab: AdminTab): void;
  version?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, activeTab, onChangeTab, version = '2.2.0' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch website settings for logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await SettingsService.get();
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch website settings:', error);
      }
    };
    
    fetchLogo();
  }, []);

  const formatDateTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      date: date.toLocaleDateString('id-ID', { 
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      })
    };
  };

  const { time, date } = formatDateTime(currentTime);
  return (
    <div className={cn(
      'hidden lg:flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-20' : 'w-64',
      'bg-gradient-to-b from-black via-gray-950 to-black border-r border-pink-500/20 fixed left-0 top-0 h-screen overflow-y-auto shadow-2xl shadow-pink-500/10 z-40'
    )}>
      <div className={cn(
        'transition-all duration-300',
        collapsed ? 'p-4' : 'p-6'
      )}>
        <div className={cn(
          'flex items-center mb-8 transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-pink-500/30 overflow-hidden">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="JB Alwikobra" 
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      // Fallback to default icon if logo fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={cn(
                  'w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 rounded-2xl flex items-center justify-center',
                  logoUrl ? 'hidden' : ''
                )}>
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                  JB Alwikobra
                </h1>
                <p className="text-sm font-medium text-pink-300/80">Admin Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-pink-500/30 overflow-hidden">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="JB Alwikobra" 
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    // Fallback to default icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={cn(
                'w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 rounded-2xl flex items-center justify-center',
                logoUrl ? 'hidden' : ''
              )}>
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          {!collapsed && (
            <IOSButton
              variant="ghost"
              size="small"
              onClick={onToggle}
              className="p-3 rounded-full hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-pink-500" />
            </IOSButton>
          )}
        </div>

        {/* Date/Time Display */}
        {!collapsed && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
            <div className="text-center">
              <div className="text-xl font-bold text-pink-200">{time}</div>
              <div className="text-sm text-gray-400 mt-1">{date}</div>
            </div>
          </div>
        )}

        {/* Back to Store Button */}
        {!collapsed && (
          <div className="mb-6">
            <IOSButton
              variant="ghost"
              size="small"
              onClick={() => window.open('/', '_blank')}
              className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 font-medium">Back to Store</span>
            </IOSButton>
          </div>
        )}

        {/* Collapse/Expand Toggle for Collapsed State */}
        {collapsed && (
          <div className="mb-6 space-y-4">
            {/* Compact date/time for collapsed state */}
            <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 group relative">
              <div className="text-xs font-bold text-pink-200">{time.split(':')[0]}:{time.split(':')[1]}</div>
              <div className="text-[10px] text-gray-400">{date.split(' ')[0]}</div>
              
              {/* Tooltip for collapsed date/time */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-pink-500/30">
                {date} - {time}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/95 rotate-45 border-l border-b border-pink-500/30"></div>
              </div>
            </div>
            
            {/* Compact Back to Store Button */}
            <div className="flex justify-center group relative">
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => window.open('/', '_blank')}
                className="p-2 rounded-full hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
              </IOSButton>
              
              {/* Tooltip for Back to Store */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-blue-500/30">
                Back to Store
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/95 rotate-45 border-l border-b border-blue-500/30"></div>
              </div>
            </div>
            
            {/* Expand Button */}
            <div className="flex justify-center">
              <IOSButton
                variant="ghost"
                size="small"
                onClick={onToggle}
                className="p-3 rounded-full hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-pink-500" />
              </IOSButton>
            </div>
          </div>
        )}

        <nav className="space-y-3">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onChangeTab(item.id)}
                  className={cn(
                    'w-full flex items-center transition-all duration-300 font-semibold text-base relative rounded-2xl',
                    collapsed ? 'justify-center p-3 aspect-square' : 'gap-4 px-5 py-4',
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-fuchsia-600 text-white shadow-lg shadow-pink-500/40 ring-2 ring-pink-500/50 scale-[1.02]'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-pink-600/20 hover:text-pink-300 hover:scale-[1.01] hover:shadow-md hover:ring-1 hover:ring-pink-500/30'
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
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-pink-500/30">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/95 rotate-45 border-l border-b border-pink-500/30"></div>
                  </div>
                )}
              </div>
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
