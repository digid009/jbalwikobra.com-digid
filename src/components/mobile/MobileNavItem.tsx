import React from 'react';
import { Link } from 'react-router-dom';

export interface MobileNavItemConfig {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isSpecial?: boolean;
  badge?: number;
  animateBadge?: boolean;
}

interface Props {
  item: MobileNavItemConfig;
  isActive: boolean;
  touchSize?: number;
  onClick?: () => void;
}

const MobileNavItem: React.FC<Props> = ({ item, isActive, touchSize = 44 }) => {
  const IconComponent = item.activeIcon && isActive ? item.activeIcon : item.icon;

  return (
    <Link
      to={item.path}
      aria-label={item.label}
      className={`group mobile-nav-item-base focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60
        ${item.isSpecial ? 'mobile-nav-item-special' : isActive ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'}`}
      style={{ minHeight: touchSize, minWidth: touchSize }}
    >
      <div className="relative flex items-center justify-center">
        <div className={`transition-all duration-300 ease-out group-active:scale-95 ${isActive ? 'scale-110 text-pink-200' : ''}`}>
          <IconComponent size={item.isSpecial ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        {item.badge && item.badge > 0 && (
          <div className={`mobile-nav-badge ${item.animateBadge ? 'mobile-nav-badge-anim' : ''}`}>
            <span>{item.badge > 99 ? '99+' : item.badge}</span>
          </div>
        )}
        {isActive && !item.isSpecial && <div className="mobile-nav-active-dot" />}
      </div>
    </Link>
  );
};

export default React.memo(MobileNavItem);
