import React from 'react';
import { Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Eye, EyeOff, Percent, Package, DollarSign } from 'lucide-react';
import { IOSCard, IOSButton } from '../../ios/IOSDesignSystemV2';
import { FlashSaleData, FlashSaleStatusInfo } from '../../../types/flashSales';
import { formatCurrency } from '../../../utils/helpers';

interface FlashSaleCardProps {
  flashSale: FlashSaleData;
  onEdit: (flashSale: FlashSaleData) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  flashSale,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getStatusInfo = (sale: FlashSaleData): FlashSaleStatusInfo => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) {
      return {
        status: 'Tidak Aktif',
        color: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: XCircle,
        description: 'Flash sale dinonaktifkan'
      };
    } else if (now < startTime) {
      return {
        status: 'Terjadwal',
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        icon: Calendar,
        description: 'Belum dimulai'
      };
    } else if (now <= endTime) {
      return {
        status: 'Aktif',
        color: 'bg-green-500/10 text-green-400 border-green-500/30',
        icon: CheckCircle,
        description: 'Sedang berlangsung'
      };
    } else {
      return {
        status: 'Berakhir',
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        icon: Clock,
        description: 'Waktu habis'
      };
    }
  };

  const statusInfo = getStatusInfo(flashSale);
  const StatusIcon = statusInfo.icon;
  const discountAmount = flashSale.original_price - flashSale.sale_price;
  const discountPercentage = flashSale.discount_percentage;

  const handleDelete = () => {
    if (window.confirm(`Hapus flash sale "${flashSale.product?.name || 'Produk'}"?`)) {
      onDelete(flashSale.id);
    }
  };

  // Calculate time remaining for active sales
  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(flashSale.end_time);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}h ${hours}j`;
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

  const timeRemaining = statusInfo.status === 'Aktif' ? getTimeRemaining() : null;

  return (
    <IOSCard variant="elevated" className="p-stack-lg surface-glass-md hover:border-surface-tint-pink/30 transition-colors">
      {/* Product Header */}
      <div className="flex items-start gap-stack-md mb-stack-md">
        {/* Product Image */}
        <div className="w-16 h-16 surface-glass-sm rounded-xl overflow-hidden shrink-0">
          {flashSale.product?.image ? (
            <img
              src={flashSale.product.image}
              alt={flashSale.product?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-surface-tint-gray" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="heading-md text-white truncate mb-1">
            {flashSale.product?.name || 'Produk Tidak Ditemukan'}
          </h3>
          <div className="flex items-center gap-cluster-xs">
            <span className={`inline-flex items-center px-2 py-1 rounded-md fs-sm font-medium border ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.status}
            </span>
            {timeRemaining && (
              <span className="fs-xs text-surface-tint-orange surface-tint-orange/10 px-2 py-1 rounded-md border border-surface-tint-orange/30">
                {timeRemaining}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="grid grid-cols-2 gap-stack-md mb-stack-md">
        <div className="space-y-stack-xs">
          <div className="fs-sm text-surface-tint-gray">Harga Asli</div>
          <div className="heading-sm text-surface-tint-gray line-through">
            {formatCurrency(flashSale.original_price)}
          </div>
        </div>
        <div className="space-y-stack-xs">
          <div className="fs-sm text-surface-tint-gray">Harga Flash Sale</div>
          <div className="heading-sm font-bold text-surface-tint-pink">
            {formatCurrency(flashSale.sale_price)}
          </div>
        </div>
      </div>

      {/* Discount & Stock Info */}
      <div className="grid grid-cols-3 gap-stack-md mb-stack-md p-stack-sm surface-glass-sm rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Percent className="w-4 h-4 text-surface-tint-red" />
          </div>
          <div className="fs-sm font-bold text-surface-tint-red">
            {discountPercentage.toFixed(1)}%
          </div>
          <div className="fs-xs text-surface-tint-gray">Diskon</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-surface-tint-green" />
          </div>
          <div className="fs-sm font-bold text-surface-tint-green">
            {formatCurrency(discountAmount)}
          </div>
          <div className="fs-xs text-surface-tint-gray">Hemat</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Package className="w-4 h-4 text-surface-tint-blue" />
          </div>
          <div className="fs-sm font-bold text-white">
            {flashSale.stock || 0}
          </div>
          <div className="fs-xs text-surface-tint-gray">Stok</div>
        </div>
      </div>

      {/* Time Period */}
      <div className="mb-stack-md p-stack-sm surface-glass-sm rounded-xl">
        <div className="grid grid-cols-2 gap-stack-md">
          <div>
            <div className="fs-xs text-surface-tint-gray mb-1">Mulai</div>
            <div className="fs-sm font-medium text-white">
              {new Date(flashSale.start_time).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div>
            <div className="fs-xs text-surface-tint-gray mb-1">Berakhir</div>
            <div className="fs-sm font-medium text-white">
              {new Date(flashSale.end_time).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-cluster-xs">
        <IOSButton
          variant="secondary"
          size="sm"
          onClick={() => onToggleStatus(flashSale.id, flashSale.is_active)}
          className="flex items-center gap-cluster-xs flex-1"
        >
          {flashSale.is_active ? (
            <>
              <EyeOff className="w-4 h-4" />
              Nonaktifkan
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Aktifkan
            </>
          )}
        </IOSButton>

        <IOSButton
          variant="ghost"
          size="sm"
          onClick={() => onEdit(flashSale)}
          className="p-stack-sm"
        >
          <Edit className="w-4 h-4" />
        </IOSButton>

        <IOSButton
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="p-stack-sm"
        >
          <Trash2 className="w-4 h-4" />
        </IOSButton>
      </div>

      {/* Created Date */}
      <div className="mt-stack-sm pt-stack-sm border-t border-surface-tint-gray/30">
        <div className="fs-xs text-surface-tint-gray">
          Dibuat: {new Date(flashSale.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </IOSCard>
  );
};
