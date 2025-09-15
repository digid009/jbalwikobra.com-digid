import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  actions,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-stack-lg">
      <div className="space-y-stack-xs">
        <h1 className="heading-lg text-white">{title}</h1>
        {description && (
          <p className="text-surface-tint-gray font-medium">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-cluster-sm">
        {onRefresh && (
          <button 
            type="button"
            onClick={onRefresh}
            className="btn btn-secondary btn-sm flex items-center gap-cluster-xs"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        )}
        {actions}
      </div>
    </div>
  );
};
