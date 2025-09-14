import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Zap, Clock, CheckCircle, XCircle, Search, Edit, Trash2, Eye, Filter, X } from 'lucide-react';
import { adminService, FlashSale, PaginatedResponse } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader } from '../../../components/ios/IOSDesignSystem';
import { IOSPagination } from '../../../components/ios/IOSPagination';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../utils/cn';
import { supabase } from '../../../services/supabase';

interface AdminFlashSalesManagementProps {
  onRefresh?: () => void;
}

export const AdminFlashSalesManagement: React.FC<AdminFlashSalesManagementProps> = ({ onRefresh }) => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [discountFilter, setDiscountFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const itemsPerPage = 10;

  // Products data for selection
  const [products, setProducts] = useState<Array<{id: string, name: string, price: number, stock?: number}>>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Flash Sale Form state
  const [formData, setFormData] = useState({
    product_id: '',
    discount_type: 'percentage', // 'percentage' or 'fixed'
    discount_percentage: 0, // percentage (0-100)
    discount_amount: 0, // fixed amount
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  });
  const [saving, setSaving] = useState(false);

  // Helper functions for automatic calculation
  const calculateSalePriceFromPercentage = (originalPrice: number, percentage: number): number => {
    return originalPrice * (1 - percentage / 100);
  };

  const calculatePercentageFromSalePrice = (originalPrice: number, salePrice: number): number => {
    if (originalPrice <= 0) return 0;
    return ((originalPrice - salePrice) / originalPrice) * 100;
  };

  const calculateDiscountAmount = (originalPrice: number, salePrice: number): number => {
    return originalPrice - salePrice;
  };

  const getCurrentDiscountValue = () => {
    return formData.discount_type === 'percentage' ? formData.discount_percentage : formData.discount_amount;
  };

  const isValidDiscount = () => {
    const value = getCurrentDiscountValue();
    return value > 0 && (formData.discount_type === 'percentage' ? value <= 100 : true);
  };

  useEffect(() => {
    loadFlashSales();
    loadProducts();
  }, [currentPage, searchTerm, statusFilter, discountFilter]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

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

  const handleCreateFlashSale = async () => {
    if (!formData.product_id) {
      setError('Please select a product');
      return;
    }

    if (!formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
      setError('Please set start and end date/times');
      return;
    }

    if (!isValidDiscount()) {
      setError('Discount value must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const selectedProduct = products.find(p => p.id === formData.product_id);
      if (!selectedProduct) {
        setError('Selected product not found');
        return;
      }

      // Calculate sale price based on discount type
      let salePrice = 0;
      let discountPercentage = 0;

      if (formData.discount_type === 'percentage') {
        discountPercentage = formData.discount_percentage;
        salePrice = calculateSalePriceFromPercentage(selectedProduct.price, formData.discount_percentage);
      } else {
        salePrice = selectedProduct.price - formData.discount_amount;
        discountPercentage = calculatePercentageFromSalePrice(selectedProduct.price, salePrice);
      }

      // Combine date and time
      const startDateTime = `${formData.start_date}T${formData.start_time}:00.000Z`;
      const endDateTime = `${formData.end_date}T${formData.end_time}:00.000Z`;
      
      const flashSaleData = {
        product_id: formData.product_id,
        original_price: selectedProduct.price,
        sale_price: Math.round(salePrice),
        start_time: startDateTime,
        end_time: endDateTime,
        is_active: true,
        stock: selectedProduct.stock || 10 // Default stock if not available
      };

      await adminService.createFlashSale(flashSaleData);
      
      // Reset form and reload data
      setFormData({
        product_id: '',
        discount_type: 'percentage',
        discount_percentage: 0,
        discount_amount: 0,
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: ''
      });
      setShowCreateForm(false);
      await loadFlashSales();
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error creating flash sale:', error);
      setError(error instanceof Error ? error.message : 'Failed to create flash sale');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      discount_type: 'percentage',
      discount_percentage: 0,
      discount_amount: 0,
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: ''
    });
    setError(null);
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
  <div className="space-y-6 p-6 bg-black min-h-screen">
      <RLSDiagnosticsBanner 
        hasErrors={!!error}
        errorMessage={error || ''}
        statsLoaded={!loading}
      />

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
            onClick={() => setShowCreateForm(!showCreateForm)}
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

      {/* Filters */}
      <IOSCard variant="elevated" padding="medium">
        <div className="space-y-4">
          {/* First Row - Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-200" />
            <input
              type="text"
              placeholder="Search flash sales by product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-xl transition-colors duration-200',
                'bg-black border border-gray-700 text-white placeholder:text-white/50',
                'focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
              )}
            />
          </div>

          {/* Second Row - Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <Filter className="w-4 h-4 text-gray-200" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'border border-gray-700 rounded-xl px-4 py-2 bg-black',
                  'focus:ring-2 focus:ring-ios-primary focus:border-pink-500',
                  'transition-colors duration-200 text-white'
                )}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Discount Filter */}
            <div className="flex items-center space-x-3 min-w-[140px]">
              <span className="text-sm font-medium text-gray-200">Discount:</span>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className={cn(
                  'border border-gray-700 rounded-xl px-4 py-2 bg-black',
                  'focus:ring-2 focus:ring-ios-primary focus:border-pink-500',
                  'transition-colors duration-200 text-white'
                )}
              >
                <option value="all">All Discounts</option>
                <option value="low">Under 25%</option>
                <option value="medium">25% - 50%</option>
                <option value="high">50% - 75%</option>
                <option value="super">75%+ Off</option>
              </select>
            </div>

            {/* Clear Filters */}
            <IOSButton 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDiscountFilter('all');
              }}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Create Flash Sale Modal Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <IOSCard variant="elevated" padding="large" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Flash Sale</h3>
              <IOSButton
                variant="ghost"
                size="small"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                <X className="w-5 h-5" />
              </IOSButton>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-ios-error/10 border border-ios-error/20 rounded-xl">
                <p className="text-sm text-ios-error">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Active Product <span className="text-ios-error">*</span>
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      product_id: e.target.value
                    }));
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                    'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                  )}
                  disabled={productsLoading}
                >
                  <option value="">
                    {productsLoading ? 'Loading products...' : 'Select a product'}
                  </option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Price (View Only) */}
              {formData.product_id && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Current Price</label>
                  <div className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-black/50 text-white">
                    Rp {products.find(p => p.id === formData.product_id)?.price.toLocaleString() || '0'}
                  </div>
                </div>
              )}

              {/* Discount Type Toggle & Dual Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Discount Type <span className="text-ios-error">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <IOSButton
                      variant={formData.discount_type === 'percentage' ? 'primary' : 'ghost'}
                      onClick={() => setFormData(prev => ({ ...prev, discount_type: 'percentage' }))}
                      className="flex-1"
                    >
                      Percentage
                    </IOSButton>
                    <IOSButton
                      variant={formData.discount_type === 'fixed' ? 'primary' : 'ghost'}
                      onClick={() => setFormData(prev => ({ ...prev, discount_type: 'fixed' }))}
                      className="flex-1"
                    >
                      Fixed Amount
                    </IOSButton>
                  </div>
                </div>

                {/* Dual Inputs with Auto-Calculation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Percentage Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Discount Percentage <span className="text-ios-error">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => {
                          const percentage = Number(e.target.value);
                          const selectedProduct = products.find(p => p.id === formData.product_id);
                          if (selectedProduct && percentage >= 0 && percentage <= 100) {
                            const newAmount = (selectedProduct.price * percentage) / 100;
                            setFormData(prev => ({ 
                              ...prev, 
                              discount_percentage: percentage,
                              discount_amount: Math.round(newAmount),
                              discount_type: 'percentage'
                            }));
                          } else if (selectedProduct) {
                            setFormData(prev => ({ 
                              ...prev, 
                              discount_percentage: percentage
                            }));
                          }
                        }}
                        placeholder="0"
                        min="0"
                        max="100"
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-black',
                          'text-white placeholder:text-white/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
                          formData.discount_type === 'percentage' ? 'ring-2 ring-ios-primary' : ''
                        )}
                      />
                      <span className="text-gray-200 px-2">%</span>
                    </div>
                  </div>

                  {/* Fixed Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Discount Amount <span className="text-ios-error">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.discount_amount}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          const selectedProduct = products.find(p => p.id === formData.product_id);
                          if (selectedProduct && amount >= 0 && amount <= selectedProduct.price) {
                            const newPercentage = (amount / selectedProduct.price) * 100;
                            setFormData(prev => ({ 
                              ...prev, 
                              discount_amount: amount,
                              discount_percentage: Math.round(newPercentage * 100) / 100,
                              discount_type: 'fixed'
                            }));
                          } else if (selectedProduct) {
                            setFormData(prev => ({ 
                              ...prev, 
                              discount_amount: amount
                            }));
                          }
                        }}
                        placeholder="0"
                        min="0"
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-black',
                          'text-white placeholder:text-white/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500',
                          formData.discount_type === 'fixed' ? 'ring-2 ring-ios-primary' : ''
                        )}
                      />
                      <span className="text-gray-200 px-2">IDR</span>
                    </div>
                  </div>
                </div>

                {/* Final Price Preview */}
                {formData.product_id && (formData.discount_percentage > 0 || formData.discount_amount > 0) && (
                  <div className="p-4 bg-black/50 rounded-xl border border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Price Summary</h4>
                    <div className="space-y-1 text-sm">
                      {(() => {
                        const selectedProduct = products.find(p => p.id === formData.product_id);
                        if (!selectedProduct) return null;
                        
                        const originalPrice = selectedProduct.price;
                        let finalPrice = 0;
                        
                        if (formData.discount_type === 'percentage') {
                          finalPrice = originalPrice - (originalPrice * formData.discount_percentage / 100);
                        } else {
                          finalPrice = originalPrice - formData.discount_amount;
                        }
                        
                        finalPrice = Math.max(0, finalPrice);
                        const savings = originalPrice - finalPrice;
                        const savingsPercentage = (savings / originalPrice) * 100;
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-200">Original Price:</span>
                              <span className="text-white">Rp {originalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-200">Discount:</span>
                              <span className="text-ios-error">-Rp {savings.toLocaleString()} ({Math.round(savingsPercentage * 100) / 100}%)</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                              <span className="text-white">Final Price:</span>
                              <span className="text-ios-primary">Rp {finalPrice.toLocaleString()}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date <span className="text-ios-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                      'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Time <span className="text-ios-error">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                      'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                    )}
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Date <span className="text-ios-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                      'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Time <span className="text-ios-error">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-gray-700 bg-black',
                      'text-white focus:ring-2 focus:ring-ios-primary focus:border-pink-500'
                    )}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <IOSButton
                  variant="primary"
                  onClick={handleCreateFlashSale}
                  disabled={saving || !formData.product_id || !formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time || !isValidDiscount()}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save'}
                </IOSButton>
                <IOSButton
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </IOSButton>
              </div>
            </div>
          </IOSCard>
        </div>
      )}

      {/* Flash Sales Table */}
      <IOSCard variant="elevated" padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white/60" />
            <p className="text-white/60 font-medium">Loading flash sales...</p>
          </div>
        ) : paginatedSales.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/40 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
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
                      <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {sale.product?.image && (
                              <img
                                src={sale.product.image}
                                alt={sale.product.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-gray-700/30"
                              />
                            )}
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {sale.product?.name || 'Unknown Product'}
                              </div>
                              <div className="text-sm text-white/70">
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
                            <div className="text-sm text-white/60">
                              <span className="line-through">Rp {sale.original_price.toLocaleString()}</span>
                            </div>
                            <div className="text-sm font-semibold text-white">
                              Rp {sale.sale_price.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white space-y-1">
                            <div className="font-medium">
                              {new Date(sale.start_time).toLocaleDateString()}
                            </div>
                            <div className="text-white/60 text-xs">to</div>
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
                              <Eye className="w-4 h-4 text-white/70" />
                            </IOSButton>
                            <IOSButton variant="ghost" size="small" className="p-2">
                              <Edit className="w-4 h-4 text-white/70" />
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
              <div className="px-6 py-4 border-t border-gray-700/30 bg-black/40">
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/60 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 font-medium mb-1">No flash sales found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or create your first flash sale</p>
          </div>
        )}
      </IOSCard>
    </div>
  );
};
