import React, { useState, useEffect } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { IOSButton, IOSCard } from '../../../components/ios/IOSDesignSystem';
import { Product } from '../../../services/enhancedAdminService';

interface ProductDialogProps {
  product: Product | null;
  onSave: (product: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  product,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    stock: 1,
    image: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image || '');
    }
  }, [product]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        handleInputChange('image', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Error silently handled
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Automotive',
    'Toys',
    'Food',
    'Health',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <IOSCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ios-separator">
          <h2 className="text-xl font-semibold text-ios-text">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <IOSButton
            variant="secondary"
            size="small"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </IOSButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">
              Product Image
            </label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl bg-ios-surface-secondary"
                  />
                  <IOSButton
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setImagePreview('');
                      handleInputChange('image', '');
                    }}
                    className="absolute top-2 right-2 p-2"
                  >
                    <X className="w-4 h-4" />
                  </IOSButton>
                </div>
              ) : (
                <div className="border-2 border-dashed border-ios-separator rounded-2xl p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                  <p className="text-gray-200 mb-4">Upload product image</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <IOSButton type="button" variant="secondary" size="small">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </IOSButton>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">
                Category
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none resize-none"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={formData.original_price || 0}
                onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-ios-separator rounded-2xl bg-ios-surface focus:border-ios-primary focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active !== false}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="mr-3 w-4 h-4 text-ios-primary bg-ios-surface border-ios-separator rounded focus:ring-ios-primary"
              />
              <label htmlFor="is_active" className="text-sm text-ios-text">
                Active Product
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-ios-separator">
            <IOSButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </IOSButton>
            <IOSButton
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Product'}
            </IOSButton>
          </div>
        </form>
      </IOSCard>
    </div>
  );
};

export default ProductDialog;
