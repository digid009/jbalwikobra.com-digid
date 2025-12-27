import React from 'react';
import { Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Eye, EyeOff, Percent, Package, DollarSign } from 'lucide-react';
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
    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-200">
      {/* Product Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shrink-0">
          {flashSale.product?.image ? (
            <img
              src={flashSale.product.image}
              alt={flashSale.product?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate mb-2">
            {flashSale.product?.name || 'Produk Tidak Ditemukan'}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.status}
            </span>
            {timeRemaining && (
              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/30">
                {timeRemaining}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Harga Asli</div>
          <div className="text-base text-gray-400 line-through">
            {formatCurrency(flashSale.original_price)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-400">Harga Flash Sale</div>
          <div className="text-lg font-bold text-pink-400">
            {formatCurrency(flashSale.sale_price)}
          </div>
        </div>
      </div>

      {/* Discount & Stock Info */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Percent className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-sm font-bold text-red-400">
            {discountPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Diskon</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-sm font-bold text-green-400">
            {formatCurrency(discountAmount)}
          </div>
          <div className="text-xs text-gray-400">Hemat</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-white">
            {flashSale.stock || 0}
          </div>
          <div className="text-xs text-gray-400">Stok</div>
        </div>
      </div>

      {/* Time Period */}
      <div className="mb-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Mulai</div>
            <div className="text-sm font-medium text-white">
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
            <div className="text-xs text-gray-400 mb-1">Berakhir</div>
            <div className="text-sm font-medium text-white">
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleStatus(flashSale.id, flashSale.is_active)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-all duration-200"
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
        </button>

        <button
          onClick={() => onEdit(flashSale)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Dibuat: {new Date(flashSale.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
};
