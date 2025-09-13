import React, { useState, useEffect } from 'react';
import { X, Save, Percent, DollarSign, Calendar, Clock, Package, AlertTriangle } from 'lucide-react';
import { IOSCard, IOSButton } from '../../ios/IOSDesignSystemV2';
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
      newErrors.product_id = 'Pilih produk terlebih dahulu';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai wajib diisi';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Waktu mulai wajib diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal berakhir wajib diisi';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'Waktu berakhir wajib diisi';
    }

    // Validate date range
    if (formData.start_date && formData.start_time && formData.end_date && formData.end_time) {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      const now = new Date();

      if (startDateTime >= endDateTime) {
        newErrors.end_date = 'Waktu berakhir harus setelah waktu mulai';
      }

      if (endDateTime <= now) {
        newErrors.end_date = 'Waktu berakhir harus di masa depan';
      }
    }

    // Validate discount
    if (formData.discount_type === 'percentage') {
      if (formData.discount_percentage <= 0) {
        newErrors.discount_percentage = 'Persentase diskon harus lebih dari 0%';
      }
      if (formData.discount_percentage >= 100) {
        newErrors.discount_percentage = 'Persentase diskon harus kurang dari 100%';
      }
    } else if (formData.discount_type === 'fixed') {
      if (formData.discount_amount <= 0) {
        newErrors.discount_amount = 'Jumlah diskon harus lebih dari 0';
      }
      if (selectedProduct && formData.discount_amount >= selectedProduct.price) {
        newErrors.discount_amount = 'Jumlah diskon harus kurang dari harga asli';
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <IOSCard variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {initialData ? 'Edit Flash Sale' : 'Buat Flash Sale Baru'}
              </h2>
              <p className="text-gray-400 mt-1">
                {initialData ? 'Update pengaturan flash sale' : 'Buat promo terbatas waktu untuk produk'}
              </p>
            </div>
            <IOSButton
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </IOSButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Produk <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => handleFieldChange('product_id', e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                disabled={saving || productsLoading}
              >
                <option value="">
                  {productsLoading ? 'Memuat produk...' : 'Pilih produk'}
                </option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="text-red-400 text-sm mt-1">{errors.product_id}</p>
              )}
            </div>

            {/* Discount Settings */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">
                Pengaturan Diskon <span className="text-red-400">*</span>
              </label>
              
              {/* Discount Type */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleFieldChange('discount_type', 'percentage')}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    formData.discount_type === 'percentage'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <Percent className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <div className="text-sm font-medium text-white">Persentase</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('discount_type', 'fixed')}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    formData.discount_type === 'fixed'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <div className="text-sm font-medium text-white">Nominal</div>
                </button>
              </div>

              {/* Discount Value Input */}
              {formData.discount_type === 'percentage' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Persentase Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="99.9"
                    step="0.1"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => handleFieldChange('discount_percentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Contoh: 20"
                  />
                  {errors.discount_percentage && (
                    <p className="text-red-400 text-sm mt-1">{errors.discount_percentage}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nominal Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.discount_amount || ''}
                    onChange={(e) => handleFieldChange('discount_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Contoh: 100000"
                  />
                  {errors.discount_amount && (
                    <p className="text-red-400 text-sm mt-1">{errors.discount_amount}</p>
                  )}
                </div>
              )}
            </div>

            {/* Price Preview */}
            {previewData && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Preview Harga
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400">Harga Asli</div>
                    <div className="text-lg font-medium text-gray-300 line-through">
                      {formatCurrency(previewData.originalPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Harga Sale</div>
                    <div className="text-lg font-bold text-pink-400">
                      {formatCurrency(previewData.salePrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Hemat</div>
                    <div className="text-lg font-bold text-green-400">
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
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">
                Periode Flash Sale <span className="text-red-400">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date & Time */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {errors.start_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.start_date}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleFieldChange('start_time', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {errors.start_time && (
                    <p className="text-red-400 text-sm mt-1">{errors.start_time}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* End Date & Time */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {errors.end_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Waktu Berakhir
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleFieldChange('end_time', e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                  {errors.end_time && (
                    <p className="text-red-400 text-sm mt-1">{errors.end_time}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Stok Flash Sale
              </label>
              <input
                type="number"
                min="1"
                value={formData.stock || ''}
                onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Jumlah stok yang tersedia"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-white">
                  Status Flash Sale
                </label>
                <p className="text-xs text-gray-400">
                  Flash sale akan {formData.is_active ? 'aktif' : 'tidak aktif'} setelah disimpan
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('is_active', !formData.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-pink-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <IOSButton
                type="submit"
                variant="primary"
                disabled={saving || productsLoading}
                loading={saving}
                className="flex-1"
              >
                {saving ? 'Menyimpan...' : (initialData ? 'Update Flash Sale' : 'Buat Flash Sale')}
              </IOSButton>
              <IOSButton
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Batal
              </IOSButton>
            </div>
          </form>
        </div>
      </IOSCard>
    </div>
  );
};
