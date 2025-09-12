import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { IOSButton } from './IOSDesignSystem';

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

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <IOSButton
        variant="ghost"
        size={size}
        onClick={toggle}
        className={`${sizeClasses[size]} rounded-full transition-all duration-200 hover:scale-105 ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun size={iconSizes[size]} className="transition-transform duration-200" />
        ) : (
          <Moon size={iconSizes[size]} className="transition-transform duration-200" />
        )}
      </IOSButton>
      
      {showLabel && (
        <span className={`text-sm font-medium transition-colors duration-200 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
