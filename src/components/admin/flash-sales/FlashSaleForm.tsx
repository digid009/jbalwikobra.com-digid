import React, { useState, useEffect } from 'react';
import { X, Save, Percent, DollarSign, Calendar, Clock, Package, AlertTriangle } from 'lucide-react';
import { FlashSaleFormData, FlashSaleData, FlashSaleProduct } from '../../../types/flashSales';
import { formatCurrency, parseNumberID } from '../../../utils/helpers';

interface FlashSaleFormProps {
  initialData?: FlashSaleData;
  products: FlashSaleProduct[];
  productsLoading?: boolean;
  onSubmit: (data: FlashSaleFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export const FlashSaleForm: React.FC<FlashSaleFormProps> = ({
  initialData,
  products,
  productsLoading = false,
  onSubmit,
  onCancel,
  saving = false
}) => {
  const [formData, setFormData] = useState<FlashSaleFormData>({
    id: initialData?.id,
    product_id: initialData?.product_id || '',
    discount_type: 'percentage',
    discount_percentage: initialData?.discount_percentage || 0,
    discount_amount: 0,
    start_date: initialData?.start_time ? new Date(initialData.start_time).toISOString().split('T')[0] : '',
    start_time: initialData?.start_time ? new Date(initialData.start_time).toTimeString().slice(0, 5) : '',
    end_date: initialData?.end_time ? new Date(initialData.end_time).toISOString().split('T')[0] : '',
    end_time: initialData?.end_time ? new Date(initialData.end_time).toTimeString().slice(0, 5) : '',
    stock: initialData?.stock || 1,
    is_active: initialData?.is_active ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<{
    originalPrice: number;
    salePrice: number;
    discountAmount: number;
    discountPercentage: number;
  } | null>(null);

  // Get selected product
  const selectedProduct = products.find(p => p.id === formData.product_id);

  // Calculate pricing preview
  useEffect(() => {
    if (!selectedProduct) {
      setPreviewData(null);
      return;
    }

    let salePrice = 0;
    let discountPercentage = 0;
    const originalPrice = selectedProduct.price;

    if (formData.discount_type === 'percentage' && formData.discount_percentage > 0) {
      discountPercentage = formData.discount_percentage;
      salePrice = originalPrice * (1 - discountPercentage / 100);
    } else if (formData.discount_type === 'fixed' && formData.discount_amount > 0) {
      salePrice = originalPrice - formData.discount_amount;
      discountPercentage = originalPrice > 0 ? ((originalPrice - salePrice) / originalPrice) * 100 : 0;
    }

    if (salePrice < 0) salePrice = 0;
    if (discountPercentage < 0) discountPercentage = 0;

    setPreviewData({
      originalPrice,
      salePrice: Math.round(salePrice),
      discountAmount: originalPrice - salePrice,
      discountPercentage
    });
  }, [selectedProduct, formData.discount_type, formData.discount_percentage, formData.discount_amount]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    // Validate date range
    if (formData.start_date && formData.start_time && formData.end_date && formData.end_time) {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      const now = new Date();

      if (startDateTime >= endDateTime) {
        newErrors.end_date = 'End time must be after start time';
      }

      if (endDateTime <= now) {
        newErrors.end_date = 'End time must be in the future';
      }
    }

    // Validate discount
    if (formData.discount_type === 'percentage') {
      if (formData.discount_percentage <= 0) {
        newErrors.discount_percentage = 'Discount percentage must be greater than 0%';
      }
      if (formData.discount_percentage >= 100) {
        newErrors.discount_percentage = 'Discount percentage must be less than 100%';
      }
    } else if (formData.discount_type === 'fixed') {
      if (formData.discount_amount <= 0) {
        newErrors.discount_amount = 'Discount amount must be greater than 0';
      }
      if (selectedProduct && formData.discount_amount >= selectedProduct.price) {
        newErrors.discount_amount = 'Discount amount must be less than original price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleFieldChange = (field: keyof FlashSaleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Format number with thousand separators for display
  const formatNumberWithSeparators = (value: number | string): string => {
    if (!value) return '';
    const numStr = value.toString().replace(/\D/g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted number back to number
  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/\./g, '');
    return parseInt(cleaned) || 0;
  };

  // Handle discount amount change with formatting
  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    const numericValue = parseInt(rawValue) || 0;
    handleFieldChange('discount_amount', numericValue);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {initialData ? 'Edit Flash Sale' : 'Create New Flash Sale'}
              </h2>
              <p className="text-gray-400 mt-1">
                {initialData ? 'Update flash sale settings' : 'Create a time-limited promotion for a product'}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label htmlFor="flash-product" className="block text-sm font-medium text-gray-300 mb-3">
                Product <span className="text-red-400">*</span>
              </label>
              <select
                id="flash-product"
                value={formData.product_id}
                onChange={(e) => handleFieldChange('product_id', e.target.value)}
                className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                  errors.product_id ? 'border-red-500' : 'border-gray-700'
                }`}
                disabled={saving || productsLoading}
              >
                <option value="">
                  {productsLoading ? 'Loading products...' : 'Select a product'}
                </option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="mt-2 text-sm text-red-400">{errors.product_id}</p>
              )}
            </div>

            {/* Discount Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Discount Settings <span className="text-red-400">*</span>
              </label>
              
              {/* Discount Type */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => handleFieldChange('discount_type', 'percentage')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.discount_type === 'percentage'
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Percent className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <div className="text-sm font-medium">Percentage</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('discount_type', 'fixed')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.discount_type === 'fixed'
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <div className="text-sm font-medium">Fixed Amount</div>
                </button>
              </div>

              {/* Discount Value Input */}
              {formData.discount_type === 'percentage' ? (
                <div>
                  <label htmlFor="discount-percentage" className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    id="discount-percentage"
                    type="number"
                    min="0.1"
                    max="99.9"
                    step="0.1"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => handleFieldChange('discount_percentage', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.discount_percentage ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="e.g., 20"
                  />
                  {errors.discount_percentage && (
                    <p className="mt-2 text-sm text-red-400">{errors.discount_percentage}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="discount-amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Amount (Rp)
                  </label>
                  <input
                    id="discount-amount"
                    type="text"
                    value={formatNumberWithSeparators(formData.discount_amount || '')}
                    onChange={handleDiscountAmountChange}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.discount_amount ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="e.g., 100.000"
                  />
                  {errors.discount_amount && (
                    <p className="mt-2 text-sm text-red-400">{errors.discount_amount}</p>
                  )}
                </div>
              )}
            </div>

            {/* Price Preview */}
            {previewData && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-pink-400" />
                  Price Preview
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Original Price</div>
                    <div className="text-sm font-medium text-gray-300 line-through">
                      {formatCurrency(previewData.originalPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Sale Price</div>
                    <div className="text-lg font-bold text-pink-400">
                      {formatCurrency(previewData.salePrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">You Save</div>
                    <div className="text-sm font-medium text-green-400">
                      {formatCurrency(previewData.discountAmount)}
                    </div>
                    <div className="text-xs text-green-300">
                      ({previewData.discountPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Flash Sale Period <span className="text-red-400">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Start Date & Time */}
                <div>
                  <label htmlFor="start-date" className="block text-xs text-gray-400 mb-2">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.start_date ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-xs text-red-400">{errors.start_date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="start-time" className="block text-xs text-gray-400 mb-2">Start Time</label>
                  <input
                    id="start-time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleFieldChange('start_time', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.start_time ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-xs text-red-400">{errors.start_time}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* End Date & Time */}
                <div>
                  <label htmlFor="end-date" className="block text-xs text-gray-400 mb-2">End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-400">{errors.end_date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="end-time" className="block text-xs text-gray-400 mb-2">End Time</label>
                  <input
                    id="end-time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleFieldChange('end_time', e.target.value)}
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                      errors.end_time ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-xs text-red-400">{errors.end_time}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="flash-stock" className="block text-sm font-medium text-gray-300 mb-3">
                Flash Sale Stock
              </label>
              <input
                id="flash-stock"
                type="number"
                min="1"
                value={formData.stock || ''}
                onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
                placeholder="Available stock amount"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700 rounded-xl">
              <div>
                <div className="text-sm font-medium text-white mb-1">Flash Sale Status</div>
                <p className="text-xs text-gray-400">
                  Flash sale will be {formData.is_active ? 'active' : 'inactive'} after saving
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('is_active', !formData.is_active)}
                className={`relative inline-flex w-12 h-6 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-pink-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.is_active ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={saving || productsLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {initialData ? 'Update Flash Sale' : 'Create Flash Sale'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
