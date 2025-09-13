import React from 'react';
import { Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Eye, EyeOff } from 'lucide-react';
import { IOSCard, IOSButton } from '../../ios/IOSDesignSystemV2';

interface FlashSale {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string;
  };
  original_price: number;
  sale_price: number;
  discount_percentage?: number;
  start_time: string;
  end_time: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

interface AdminFlashSalesTableProps {
  flashSales: FlashSale[];
  loading: boolean;
  onEdit: (flashSale: FlashSale) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const AdminFlashSalesTable: React.FC<AdminFlashSalesTableProps> = ({
  flashSales,
  loading,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getStatusInfo = (sale: FlashSale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) {
      return { 
        status: 'Inactive', 
        color: 'bg-red-500/10 text-red-400 border-red-500/30', 
        icon: XCircle 
      };
    } else if (now < startTime) {
      return { 
        status: 'Scheduled', 
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', 
        icon: Calendar 
      };
    } else if (now >= startTime && now <= endTime) {
      return { 
        status: 'Active', 
        color: 'bg-green-500/10 text-green-400 border-green-500/30', 
        icon: CheckCircle 
      };
    } else {
      return { 
        status: 'Expired', 
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', 
        icon: Clock 
      };
    }
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (!flashSales.length) {
    return (
      <IOSCard className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Tidak ada flash sales</h3>
        <p className="text-gray-400">Belum ada flash sales yang dibuat.</p>
      </IOSCard>
    );
  }

  return (
    <div className="space-y-4">
      {flashSales.map((sale) => {
        const statusInfo = getStatusInfo(sale);
        const StatusIcon = statusInfo.icon;
        const discount = sale.discount_percentage || calculateDiscount(sale.original_price, sale.sale_price);

        return (
          <IOSCard key={sale.id} className="p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                {sale.product.image ? (
                  <img
                    src={sale.product.image}
                    alt={sale.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-400">IMG</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white truncate">{sale.product.name}</h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusInfo.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">Harga Sale</span>
                    <span className="text-green-400 font-medium">{formatCurrency(sale.sale_price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Diskon</span>
                    <span className="text-red-400 font-medium">{discount}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Stok</span>
                    <span className="text-white font-medium">{sale.stock}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Berakhir</span>
                    <span className="text-white font-medium">
                      {new Date(sale.end_time).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <IOSButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleStatus(sale.id, sale.is_active)}
                  className="p-2"
                >
                  {sale.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </IOSButton>
                <IOSButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(sale)}
                  className="p-2"
                >
                  <Edit className="w-4 h-4" />
                </IOSButton>
                <IOSButton
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(sale.id)}
                  className="p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </IOSButton>
              </div>
            </div>
          </IOSCard>
        );
      })}
    </div>
  );
};
