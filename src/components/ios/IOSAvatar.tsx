import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../styles/standardClasses';
import { 
  AvatarProps, 
  getUserAvatarUrl, 
  getUserInitials, 
  getAvatarSizeClasses 
} from '../../utils/avatarUtils';

export const IOSAvatar: React.FC<AvatarProps> = ({
  user,
  size = 'medium',
  className = '',
  fallbackIcon: FallbackIcon = User
}) => {
  const avatarUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(user);
  const sizeClasses = getAvatarSizeClasses(size);

  const baseClasses = cn(
    'rounded-full flex items-center justify-center overflow-hidden',
    'bg-ios-surface-secondary border border-ios-border',
    'transition-all duration-200',
    sizeClasses,
    className
  );

  if (avatarUrl) {
    return (
      <div className={baseClasses}>
        <img
          src={avatarUrl}
          alt={`Avatar for ${initials}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-ios-text-secondary font-medium">${initials}</span>`;
            }
          }}
        />
      </div>
    );
  }

  // Show initials if we have user data but no avatar
  if (user && initials && initials !== 'AN') {
    return (
      <div className={cn(baseClasses, 'bg-gradient-to-br from-ios-accent/20 to-ios-secondary/20')}>
        <span className="text-ios-text font-semibold">
          {initials}
        </span>
      </div>
    );
  }

  // Fallback icon
  return (
    <div className={baseClasses}>
      <FallbackIcon className="w-1/2 h-1/2 text-ios-text-secondary" />
    </div>
  );
};
