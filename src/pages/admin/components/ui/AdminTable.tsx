// DEPRECATION NOTICE:
// This component predates AdminDSTable and should be considered legacy.
// Prefer AdminDSTable (src/pages/admin/components/ui/AdminDSTable.tsx) for all new tables.
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

interface AdminTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  onRowClick?: (item: T) => void;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
}

export const AdminTable = <T extends Record<string, any>>({
  columns,
  data,
  actions = [],
  loading = false,
  emptyMessage = "Tidak ada data tersedia",
  emptyIcon: EmptyIcon,
  onRowClick,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  className,
  rowClassName,
  sortBy,
  sortOrder,
  onSort,
  ...props
}: AdminTableProps<T>) => {
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newOrder);
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortBy === column.key) {
      return sortOrder === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  const getActionButtonClass = (action: TableAction<T>) => {
    const baseClass = "p-2 rounded-lg transition-colors";
    switch (action.variant) {
      case 'primary':
        return `${baseClass} bg-ds-pink text-white hover:bg-ds-pink/90`;
      case 'danger':
        return `${baseClass} bg-red-500 text-white hover:bg-red-600`;
      case 'secondary':
      default:
        return `${baseClass} bg-[var(--bg-tertiary)] text-ds-text-secondary hover:text-ds-text hover:bg-[var(--bg-secondary)]`;
    }
  };

  if (loading) {
    return (
  <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl", className)}>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-surface-tint-light rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-ds-text-secondary font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
  <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl", className)}>
        <div className="p-12 text-center">
          {EmptyIcon && <EmptyIcon className="w-16 h-16 text-ds-text-tertiary mx-auto mb-4" />}
          <p className="text-ds-text-secondary font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("dashboard-data-panel padded bg-surface-glass-light border border-surface-tint-light rounded-xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-tint-light">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left py-4 px-4 text-sm font-medium text-ds-text-secondary",
                    column.sortable && "cursor-pointer hover:text-ds-text transition-colors",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <span className="text-xs opacity-50">
                        {getSortIcon(column)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="text-left py-4 px-4 text-sm font-medium text-ds-text-secondary">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const visibleActions = actions.filter(action => 
                !action.hidden || !action.hidden(item)
              );

              return (
                <tr
                  key={item.id || index}
                  className={cn(
                    "border-b border-surface-tint-light transition-colors",
                    onRowClick && "cursor-pointer hover:bg-[var(--bg-secondary)]",
                    rowClassName && rowClassName(item, index)
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("py-4 px-4", column.className)}
                      style={{ width: column.width }}
                    >
                      {column.render 
                        ? column.render(item[column.key], item, index)
                        : item[column.key]
                      }
                    </td>
                  ))}
                  {visibleActions.length > 0 && (
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {visibleActions.map((action) => {
                          const Icon = action.icon;
                          const isDisabled = action.disabled && action.disabled(item);
                          
                          return (
                            <button
                              key={action.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) {
                                  action.onClick(item);
                                }
                              }}
                              disabled={isDisabled}
                              className={cn(
                                getActionButtonClass(action),
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                              title={action.label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination (Design System) */}
      {currentPage !== undefined && totalPages !== undefined && onPageChange && (
        <div className="mt-6 pt-6 border-t border-surface-tint-light">
          <div className="flex items-center justify-between">
            <div className="text-sm text-ds-text-secondary">
              {(() => {
                const size = itemsPerPage || 10;
                const total = totalItems ?? data.length;
                const start = (currentPage - 1) * size + 1;
                const end = Math.min(currentPage * size, total);
                return `Showing ${start}-${end} of ${total}`;
              })()}
            </div>
            <nav className="flex items-center gap-4" role="navigation" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <span className="text-sm text-ds-text-secondary px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
