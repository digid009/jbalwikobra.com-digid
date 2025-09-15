// DEPRECATION NOTICE:
// This component is superseded by AdminDSTable (src/pages/admin/components/ui/AdminDSTable.tsx)
// Prefer AdminDSTable for new tables; migrate existing usages over time.
import React from 'react';
import { MoreVertical, ArrowUpDown } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
  disabled?: (item: T) => boolean;
}

interface AdminDataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: TableAction<T>[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  showRowNumbers?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export const AdminDataTable = <T,>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  actions,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  rowClassName,
  showRowNumbers = false,
  pageSize,
  currentPage,
  totalItems,
  onPageChange
}: AdminDataTableProps<T>) => {
  const renderSortButton = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return null;
    
    const isActive = sortColumn === column.key;
    
    return (
      <button
        onClick={() => onSort(column.key)}
        className="ml-cluster-xs hover:text-surface-tint-pink transition-colors"
      >
        <ArrowUpDown 
          size={14} 
          className={isActive ? 'text-surface-tint-pink' : 'text-surface-tint-gray'} 
        />
      </button>
    );
  };

  const renderActions = (item: T) => {
    if (!actions?.length) return null;

    return (
      <div className="relative group">
        <button type="button" className="btn btn-secondary btn-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-haspopup="menu" aria-expanded="false">
          <MoreVertical size={16} />
        </button>

        <div className="absolute right-0 top-full mt-stack-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            {actions.map((action, index) => {
              const isDisabled = action.disabled?.(item);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && action.onClick(item)}
                  disabled={isDisabled}
                  className={`w-full text-left py-2 px-3 flex items-center gap-2 fs-sm rounded ${
                    action.variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-white hover:bg-white/10'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="menuitem"
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!pageSize || !currentPage || !totalItems || !onPageChange) return null;
    
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return (
      <div className="flex items-center justify-between pt-stack-lg border-t border-surface-tint-gray/30">
        <div className="fs-sm text-surface-tint-gray" role="status" aria-live="polite">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>

        <nav className="flex items-center gap-cluster-sm" role="navigation" aria-label="Pagination">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>

          <span className="fs-sm text-surface-tint-gray px-stack-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  if (loading) {
    return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
        <div className="p-stack-xl text-center">
          <div className="animate-spin w-8 h-8 border-2 border-surface-tint-pink border-t-transparent rounded-full mx-auto" aria-label="Loading"></div>
          <p className="mt-stack-sm fs-sm text-surface-tint-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
        <div className="p-stack-xl text-center">
          <p className="fs-md text-surface-tint-gray">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg" role="region" aria-label="Data table">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-surface-tint-gray/30" role="row">
              {showRowNumbers && (
                <th scope="col" className="text-left py-stack-md px-stack-lg fs-sm font-medium text-surface-tint-gray w-16">
                  #
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  scope="col"
                  className={`text-left py-stack-md px-stack-lg fs-sm font-medium text-surface-tint-gray ${column.width || ''} ${column.className || ''}`}
                >
                  <div className="flex items-center">
                    {column.label}
                    {renderSortButton(column)}
                  </div>
                </th>
              ))}
              {actions?.length && (
                <th scope="col" className="text-right py-stack-md px-stack-lg fs-sm font-medium text-surface-tint-gray w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-surface-tint-gray/20 hover:bg-surface-tint-gray/10 transition-colors group ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${rowClassName?.(item) || ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {showRowNumbers && (
                  <td className="py-stack-md px-stack-lg fs-sm text-surface-tint-gray">
                    {index + 1}
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={`py-stack-md px-stack-lg fs-sm text-white ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item[column.key], item, index)
                      : item[column.key]
                    }
                  </td>
                ))}
                {actions?.length && (
                  <td className="py-stack-md px-stack-lg text-right">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
};
