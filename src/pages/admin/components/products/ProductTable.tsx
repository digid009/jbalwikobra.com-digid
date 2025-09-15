import React from 'react';
import { cn } from '../../../../utils/cn';
import { t } from '../../../../i18n/strings';
import { AdminDSTable, DSTableColumn, DSTableAction } from '../ui/AdminDSTable';
import { Pencil, RotateCcw, Archive, Trash2, Image as ImageIcon } from 'lucide-react';

const standardClasses = { 
  flex: { 
    rowGap3: 'flex items-center gap-3',
    rowGap2: 'flex items-center gap-2',
    row: 'flex'
  }
};

// Looser product shape to support both legacy and adminService variants
type ProductLike = {
  id: string;
  name: string;
  price?: number;
  image?: string;
  gameTitleData?: { name?: string } | null;
  // flags across variants
  is_active?: boolean;
  isActive?: boolean;
  archived_at?: string | null;
  archivedAt?: string | null;
};

interface ProductTableProps {
  products: ProductLike[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalProducts: number;
  onPageChange: (page: number) => void | Promise<void>;
  onItemsPerPageChange: (items: number) => void | Promise<void>;
  onEdit: (product: ProductLike) => void | Promise<void>;
  onArchive: (product: ProductLike) => void | Promise<void>;
  onRestore: (product: ProductLike) => void | Promise<void>;
  onDelete: (product: ProductLike) => void | Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalProducts,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const columns: DSTableColumn<ProductLike>[] = [
    {
      key: 'name',
      header: 'Produk',
      render: (_, p) => (
        <div className={cn('flex items-center gap-3')}>
          <img
            src={p.image}
            alt={p.name}
            className="w-12 h-12 rounded-lg object-cover border border-surface-tint-light"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
          />
          <div className="min-w-0">
            <div className="text-ds-text font-medium line-clamp-1">{p.name}</div>
            <div className="text-xs text-ds-text-tertiary line-clamp-1">
              {(((p as any).isActive === false) || (p as any).archivedAt || p.is_active === false || !!p.archived_at) && (
                <span className="px-2 py-0.5 rounded-full bg-surface-tint-light text-ds-text-secondary border border-surface-tint-light text-xs font-medium">
                  Diarsipkan
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      width: '40%',
    },
    {
      key: 'game',
      header: 'Game',
      render: (_, p) => p.gameTitleData?.name || '-',
      width: '20%',
    },
    {
      key: 'price',
      header: 'Harga',
      render: (value) => (
        <span className="font-semibold">Rp {Number(value || 0).toLocaleString('id-ID')}</span>
      ),
      width: '20%',
    },
  ];

  const actions: DSTableAction<ProductLike>[] = [
    { key: 'edit', label: 'Edit', icon: Pencil, onClick: onEdit, variant: 'secondary' },
    {
      key: 'archive',
      label: 'Arsipkan',
      icon: Archive,
      onClick: onArchive,
      variant: 'secondary',
      hidden: (p) => ((p as any).isActive === false) || (p as any).archivedAt || p.is_active === false || !!p.archived_at,
    },
    {
      key: 'restore',
      label: 'Pulihkan',
      icon: RotateCcw,
      onClick: onRestore,
      variant: 'secondary',
      hidden: (p) => !(((p as any).isActive === false) || (p as any).archivedAt || p.is_active === false || !!p.archived_at),
    },
    { key: 'delete', label: 'Hapus', icon: Trash2, onClick: onDelete, variant: 'danger' },
  ];

  return (
    <AdminDSTable<ProductLike>
      columns={columns}
      data={products}
      loading={loading}
      emptyMessage={t('common.noProducts')}
      actions={actions}
      // pagination
      currentPage={currentPage}
      pageSize={itemsPerPage}
      totalItems={totalProducts}
      onPageChange={onPageChange}
      footerStart={(
        <div className="flex items-center gap-3">
          <span className="text-ds-text-tertiary">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 rounded border border-surface-tint-light bg-surface-glass-light text-ds-text text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    />
  );
};
