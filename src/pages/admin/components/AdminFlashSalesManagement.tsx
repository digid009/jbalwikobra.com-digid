import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminService, FlashSale, PaginatedResponse } from '../../../services/adminService';
import { IOSCard, IOSButton } from '../../../components/ios/IOSDesignSystem';

export const AdminFlashSalesManagement: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashSales();
  }, []);

  const loadFlashSales = async () => {
    try {
      setLoading(true);
      const result = await adminService.getFlashSales(1, 50);
      setFlashSales(result.data);
    } catch (error) {
      console.error('Error loading flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (sale: FlashSale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) {
      return { status: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    } else if (now < startTime) {
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle };
    }
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flash Sales Management</h2>
          <p className="text-gray-600">Manage time-limited product promotions</p>
        </div>
        <div className="flex items-center space-x-2">
          <IOSButton onClick={loadFlashSales} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton variant="primary" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Flash Sale</span>
          </IOSButton>
        </div>
      </div>

      <IOSCard>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading flash sales...</p>
            </div>
          ) : flashSales.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flashSales.map((sale) => {
                  const statusInfo = getStatusInfo(sale);
                  const StatusIcon = statusInfo.icon;
                  const discount = calculateDiscount(sale.original_price, sale.sale_price);
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {sale.product?.image_url && (
                            <img
                              src={sale.product.image_url}
                              alt={sale.product.name}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sale.product?.name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {sale.product_id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-green-600">
                            -{discount}%
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="line-through">Rp {sale.original_price.toLocaleString()}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            Rp {sale.sale_price.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{new Date(sale.start_time).toLocaleDateString()}</div>
                          <div className="text-gray-500">to</div>
                          <div>{new Date(sale.end_time).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          sale.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sale.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <IOSButton variant="ghost" size="small">
                            Edit
                          </IOSButton>
                          <IOSButton variant="ghost" size="small">
                            <span className="text-red-500">Delete</span>
                          </IOSButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No flash sales found</p>
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};
