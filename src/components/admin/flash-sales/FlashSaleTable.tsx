import React from 'react';
import { Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Eye, EyeOff, Package, Percent, DollarSign } from 'lucide-react';
import { IOSCard, IOSButton } from '../../ios/IOSDesignSystemV2';
import { FlashSaleData, FlashSaleStatusInfo } from '../../../types/flashSales';
import { formatCurrency } from '../../../utils/helpers';

interface FlashSaleTableProps {
  flashSales: FlashSaleData[];
  loading?: boolean;
  onEdit: (flashSale: FlashSaleData) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const FlashSaleTable: React.FC<FlashSaleTableProps> = ({
  flashSales,
  loading = false,
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

  const handleDelete = (flashSale: FlashSaleData) => {
    if (window.confirm(`Hapus flash sale "${flashSale.product?.name || 'Produk'}"?`)) {
      onDelete(flashSale.id);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <IOSCard variant="elevated" className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg mb-3"></div>
          ))}
        </div>
      </IOSCard>
    );
  }

  if (flashSales.length === 0) {
    return (
      <IOSCard variant="elevated" className="p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Belum ada flash sales</h3>
        <p className="text-gray-400 mb-6">Mulai dengan membuat flash sale pertama Anda</p>
      </IOSCard>
    );
  }

  return (
    <IOSCard variant="elevated" padding="none" className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Harga & Diskon
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {flashSales.map((flashSale) => {
                const statusInfo = getStatusInfo(flashSale);
                const StatusIcon = statusInfo.icon;
                const discountAmount = flashSale.original_price - flashSale.sale_price;

                return (
                  <tr key={flashSale.id} className="hover:bg-gray-800/30 transition-colors">
                    {/* Product */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                          {flashSale.product?.image ? (
                            <img
                              src={flashSale.product.image}
                              alt={flashSale.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {flashSale.product?.name || 'Produk Tidak Ditemukan'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {flashSale.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price & Discount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300 line-through">
                            {formatCurrency(flashSale.original_price)}
                          </span>
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded border border-red-500/30">
                            -{flashSale.discount_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-pink-400">
                          {formatCurrency(flashSale.sale_price)}
                        </div>
                        <div className="text-xs text-green-400">
                          Hemat {formatCurrency(discountAmount)}
                        </div>
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Mulai</div>
                        <div className="text-sm text-white">
                          {formatDateTime(flashSale.start_time)}
                        </div>
                        <div className="text-xs text-gray-400">Berakhir</div>
                        <div className="text-sm text-white">
                          {formatDateTime(flashSale.end_time)}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {statusInfo.description}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {flashSale.stock || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IOSButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(flashSale.id, flashSale.is_active)}
                          className="p-2"
                        >
                          {flashSale.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </IOSButton>

                        <IOSButton
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(flashSale)}
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </IOSButton>

                        <IOSButton
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(flashSale)}
                          className="p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IOSButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - shown on smaller screens */}
      <div className="lg:hidden p-4 space-y-4">
        {flashSales.map((flashSale) => {
          const statusInfo = getStatusInfo(flashSale);
          const StatusIcon = statusInfo.icon;
          const discountAmount = flashSale.original_price - flashSale.sale_price;

          return (
            <div key={flashSale.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              {/* Mobile Product Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                  {flashSale.product?.image ? (
                    <img
                      src={flashSale.product.image}
                      alt={flashSale.product?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate mb-1">
                    {flashSale.product?.name || 'Produk Tidak Ditemukan'}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.status}
                  </span>
                </div>
              </div>

              {/* Mobile Pricing */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Harga Asli</div>
                  <div className="text-sm text-gray-300 line-through">
                    {formatCurrency(flashSale.original_price)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Harga Sale</div>
                  <div className="text-sm font-semibold text-pink-400">
                    {formatCurrency(flashSale.sale_price)}
                  </div>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="grid grid-cols-3 gap-3 mb-3 p-2 bg-black/20 rounded-lg">
                <div className="text-center">
                  <div className="text-xs font-bold text-red-400">
                    -{flashSale.discount_percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Diskon</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-green-400">
                    {formatCurrency(discountAmount)}
                  </div>
                  <div className="text-xs text-gray-400">Hemat</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">
                    {flashSale.stock || 0}
                  </div>
                  <div className="text-xs text-gray-400">Stok</div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center gap-2">
                <IOSButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleStatus(flashSale.id, flashSale.is_active)}
                  className="flex-1 flex items-center justify-center gap-2"
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
                  className="p-2"
                >
                  <Edit className="w-4 h-4" />
                </IOSButton>

                <IOSButton
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(flashSale)}
                  className="p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </IOSButton>
              </div>
            </div>
          );
        })}
      </div>
    </IOSCard>
  );
};
