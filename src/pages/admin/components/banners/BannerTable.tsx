import React from 'react';
import { Eye, Edit, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import { BannerTableProps } from './types';
import { AdminDSTable, DSTableColumn, DSTableAction } from '../ui/AdminDSTable';

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  onToggleStatus,
  onDeleteBanner,
  onEditBanner,
  onImagePreview
}) => {
  const columns: DSTableColumn<typeof banners[number]>[] = [
    {
      key: 'title',
      header: 'Banner',
      render: (_, banner) => (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-ds-text">{banner.title}</div>
          <div className="text-sm text-ds-text-secondary">{banner.subtitle}</div>
          {banner.link_url && (
            <div className="text-xs text-blue-400 truncate max-w-xs">{banner.link_url}</div>
          )}
        </div>
      ),
    },
    {
      key: 'preview',
      header: 'Preview',
      render: (_, banner) => (
        <div className="flex items-center gap-3">
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-16 h-10 rounded-2xl object-cover cursor-pointer border border-surface-tint-light"
            onClick={() => onImagePreview(banner.image_url)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <button type="button" className="btn btn-ghost btn-sm p-2" onClick={() => onImagePreview(banner.image_url)}>
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-400/20">
          #{value}
        </span>
      ),
      width: '120px',
      align: 'center',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value, banner) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(banner.id, banner.is_active)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {banner.is_active ? (
              <ToggleRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-white/40" />
            )}
          </button>
          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
            value
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-400/30'
          }`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
      width: '160px',
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => <span className="text-sm text-ds-text-secondary">{new Date(value).toLocaleDateString()}</span>,
      width: '140px',
    },
  ];

  const actions: DSTableAction<typeof banners[number]>[] = [
    {
      key: 'preview',
      label: 'Preview',
      icon: Eye,
      onClick: (b) => onImagePreview(b.image_url),
      variant: 'secondary',
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (b) => onEditBanner(b),
      variant: 'secondary',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: (b) => onDeleteBanner(b.id),
      variant: 'danger',
    },
  ];

  return (
    <AdminDSTable
      data={banners}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage="No banners found"
      emptyIcon={ImageIcon}
      currentPage={currentPage}
      pageSize={10}
      totalItems={banners.length}
      onPageChange={onPageChange}
      stickyHeader
    />
  );
};
