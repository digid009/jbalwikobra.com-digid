import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

export interface PageHeaderAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: PageHeaderAction[];
  breadcrumb?: {
    label: string;
    href?: string;
  }[];
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  breadcrumb,
  className
}) => {
  const getActionButtonClass = (action: PageHeaderAction) => {
    switch (action.variant) {
      case 'primary':
        return "btn btn-primary btn-sm";
      case 'danger':
        return "btn btn-ghost btn-sm";
      case 'secondary':
      default:
        return "btn btn-secondary btn-sm";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-ds-text-tertiary">/</span>}
              {item.href ? (
                <a 
                  href={item.href}
                  className="text-ds-text-secondary hover:text-ds-text transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-ds-text font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title Section */}
    <div className="flex items-center gap-4">
          {Icon && <Icon className="w-6 h-6 text-ds-pink flex-shrink-0" />}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ds-text">{title}</h1>
            {subtitle && (
              <p className="text-sm text-ds-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-4 flex-wrap">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              
              return (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className={cn(
                    "flex items-center gap-2",
                    getActionButtonClass(action)
                  )}
                  type="button"
                >
                  {action.loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ActionIcon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
