import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Zap, Clock, CheckCircle, XCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { adminService, FlashSale, PaginatedResponse } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { IOSPagination } from '../../../components/ios/IOSPagination';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

interface AdminFlashSalesManagementProps {
  onRefresh?: () => void;
}

export const AdminFlashSalesManagement: React.FC<AdminFlashSalesManagementProps> = ({ onRefresh }) => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadFlashSales();
  }, [currentPage, searchTerm]);

  const loadFlashSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getFlashSales(1, 50);
      setFlashSales(result.data || []);
      setTotalPages(Math.ceil((result.data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading flash sales:', error);
      setError(error instanceof Error ? error.message : 'Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (sale: FlashSale) => {
    const now = new Date();
    const startTime = new Date(sale.start_time);
    const endTime = new Date(sale.end_time);

    if (!sale.is_active) {
      return { status: 'Inactive', color: 'bg-ios-error/10 text-ios-error border-ios-error/30', icon: XCircle };
    } else if (now < startTime) {
      return { status: 'Scheduled', color: 'bg-ios-primary/10 text-ios-primary border-ios-primary/30', icon: Clock };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', color: 'bg-ios-success/10 text-ios-success border-ios-success/30', icon: CheckCircle };
    } else {
      return { status: 'Expired', color: 'bg-ios-error/10 text-ios-error border-ios-error/30', icon: XCircle };
    }
  };

  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const filteredSales = flashSales.filter(sale =>
    (sale.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-6 bg-ios-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader
          title="Flash Sales Management"
          subtitle="Manage time-limited product promotions"
        />
        <div className="flex items-center space-x-3">
          <IOSButton 
            variant="ghost" 
            onClick={loadFlashSales}
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton 
            variant="primary" 
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flash Sale</span>
          </IOSButton>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <RLSDiagnosticsBanner
          hasErrors={true}
          errorMessage={error}
          isConnected={!error.includes('network')}
          className="mb-4"
        />
      )}

      {/* Search */}
      <IOSCard variant="elevated" padding="medium">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ios-text/60" />
          <input
            type="text"
            placeholder="Search flash sales by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-ios-background border border-ios-border rounded-xl 
                       focus:ring-2 focus:ring-ios-primary focus:border-transparent 
                       transition-colors duration-200 text-ios-text placeholder-ios-text/60"
          />
        </div>
      </IOSCard>

      {/* Flash Sales Table */}
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ios-text/60" />
            <p className="text-ios-text/60 font-medium">Loading flash sales...</p>
          </div>
        ) : paginatedSales.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ios-background/50 border-b border-ios-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-ios-text/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ios-border/30">
                  {paginatedSales.map((sale) => {
                    const statusInfo = getStatusInfo(sale);
                    const StatusIcon = statusInfo.icon;
                    const discount = calculateDiscount(sale.original_price, sale.sale_price);
                    
                    return (
                      <tr key={sale.id} className="hover:bg-ios-background/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {sale.product?.image_url && (
                              <img
                                src={sale.product.image_url}
                                alt={sale.product.name}
                                className="w-12 h-12 rounded-lg object-cover border border-ios-border/30"
                              />
                            )}
                            <div>
                              <div className="text-sm font-semibold text-ios-text">
                                {sale.product?.name || 'Unknown Product'}
                              </div>
                              <div className="text-sm text-ios-text/70">
                                ID: {sale.product_id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold 
                                           bg-ios-success/10 text-ios-success border border-ios-success/20">
                              -{discount}% OFF
                            </div>
                            <div className="text-sm text-ios-text/60">
                              <span className="line-through">Rp {sale.original_price.toLocaleString()}</span>
                            </div>
                            <div className="text-sm font-semibold text-ios-text">
                              Rp {sale.sale_price.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-ios-text space-y-1">
                            <div className="font-medium">
                              {new Date(sale.start_time).toLocaleDateString()}
                            </div>
                            <div className="text-ios-text/60 text-xs">to</div>
                            <div className="font-medium">
                              {new Date(sale.end_time).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
                            sale.stock > 0 
                              ? 'bg-ios-success/10 text-ios-success border-ios-success/30'
                              : 'bg-ios-error/10 text-ios-error border-ios-error/30'
                          )}>
                            {sale.stock} left
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4" />
                            <span className={cn("inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border", statusInfo.color)}>
                              {statusInfo.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <IOSButton variant="ghost" size="small" className="p-2">
                              <Eye className="w-4 h-4 text-ios-text/70" />
                            </IOSButton>
                            <IOSButton variant="ghost" size="small" className="p-2">
                              <Edit className="w-4 h-4 text-ios-text/70" />
                            </IOSButton>
                            <IOSButton variant="ghost" size="small" className="p-2">
                              <Trash2 className="w-4 h-4 text-ios-error hover:text-ios-error/80" />
                            </IOSButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-ios-border/30 bg-ios-background/50">
                <IOSPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSales.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ios-background flex items-center justify-center">
              <Zap className="w-8 h-8 text-ios-text/40" />
            </div>
            <p className="text-ios-text/60 font-medium mb-1">No flash sales found</p>
            <p className="text-ios-text/40 text-sm">Try adjusting your search or create your first flash sale</p>
          </div>
        )}
      </IOSCard>
    </div>
  );
};
