import React from 'react';
import { cn } from '../../styles/standardClasses';

interface IOSToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const IOSToggle: React.FC<IOSToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      track: 'w-10 h-6',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-12 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-start space-x-3">
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ios-primary/50',
          currentSize.track,
          checked 
            ? 'bg-ios-primary shadow-inner' 
            : 'bg-gray-300 shadow-inner',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
            currentSize.thumb,
            checked ? currentSize.translate : 'translate-x-1'
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label className="block text-sm font-medium text-ios-text cursor-pointer"
                   onClick={() => !disabled && onChange(!checked)}>
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-ios-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default IOSToggle;
