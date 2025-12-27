/**
 * Utility functions for normalizing user avatar sources across different contexts
 * Some components use avatarUrl, others use avatar_url from database
 */

export interface UserAvatarData {
  avatarUrl?: string;
  avatar_url?: string;
  name?: string;
  email?: string;
}

/**
 * Get the correct avatar URL from various user data formats
 */
export const getUserAvatarUrl = (user: UserAvatarData | null | undefined): string | null => {
  if (!user) return null;
  
  // Try modern camelCase first (from auth context)
  if (user.avatarUrl) return user.avatarUrl;
  
  // Try database snake_case (from API responses)
  if (user.avatar_url) return user.avatar_url;
  
  return null;
};

/**
 * Get user display name with fallback
 */
export const getUserDisplayName = (user: UserAvatarData | null | undefined): string => {
  if (!user) return 'Anonymous';
  
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  
  return 'Anonymous';
};

/**
 * Get user initials for avatar fallback
 */
export const getUserInitials = (user: UserAvatarData | null | undefined): string => {
  const displayName = getUserDisplayName(user);
  
  const words = displayName.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
};

/**
 * Avatar component props for consistent usage
 */
export interface AvatarProps {
  user: UserAvatarData | null | undefined;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

/**
 * Get avatar size classes
 */
export const getAvatarSizeClasses = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return 'w-8 h-8 text-xs';
    case 'large':
      return 'w-12 h-12 text-base';
    default:
      return 'w-10 h-10 text-sm';
  }
};
