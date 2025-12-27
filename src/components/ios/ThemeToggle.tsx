import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { IOSButton } from './IOSDesignSystem';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'medium',
  showLabel = false 
}) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10', 
    large: 'h-12 w-12'
  };
  
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24
  };

  const baseTokenClasses = isDark
    ? 'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] text-yellow-300'
    : 'bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.12)] text-pink-600';

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <IOSButton
        variant="ghost"
        size={size}
        onClick={toggle}
        className={cn(
          sizeClasses[size],
          'rounded-full transition-all duration-200 hover:scale-105 focus-ring border border-transparent',
          baseTokenClasses
        )}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun size={iconSizes[size]} className="transition-transform duration-200" />
        ) : (
          <Moon size={iconSizes[size]} className="transition-transform duration-200" />
        )}
      </IOSButton>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium transition-colors duration-200',
            isDark ? 'text-[var(--dash-text-secondary)]' : 'text-[var(--dash-text-secondary)]'
          )}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
