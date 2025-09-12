import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../../services/adminService';
import { ProductService } from '../../../services/productService';
import { ProductTier } from '../../../types';
import { IOSButton } from '../../../components/ios/IOSDesignSystem';
import { NotificationContainer, useNotifications } from '../../../components/ios/NotificationSystem';
import { 
  ProductDetailsForm, 
  ProductImagesUpload, 
  RentalOptionsForm 
} from './product-crud';
import type { RentalOption } from './product-crud';

interface ProductCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductCrudModal: React.FC<ProductCrudModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    gameTitle: '',
    gameTitleId: '', // Add gameTitleId field
    tier: 'reguler' as ProductTier,
    accountLevel: '',
    accountDetails: '',
    stock: 0,
    isActive: true,
    isFlashSale: false,
    hasRental: false,
    image: '',
    images: [] as string[],
  });

  const [rentalOptions, setRentalOptions] = useState<RentalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  const isEdit = !!product;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          originalPrice: product.original_price || 0,
          category: product.category || '',
          gameTitle: product.game_title || '',
          gameTitleId: product.game_title_id || '', // Add gameTitleId from product
          tier: (product.tier || 'reguler') as ProductTier,
          accountLevel: product.account_level || '',
          accountDetails: product.account_details || '',
          stock: product.stock || 0,
          isActive: product.is_active ?? true,
          isFlashSale: product.is_flash_sale ?? false,
          hasRental: product.has_rental ?? false,
          image: product.image || '',
          images: product.images || [],
        });
        // Initialize rental options if they exist (for now, empty array)
        setRentalOptions([]);
      } else {
        // Reset form for add mode
        setFormData({
          name: '',
          description: '',
          price: 0,
          originalPrice: 0,
          category: '',
          gameTitle: '',
          gameTitleId: '', // Add empty gameTitleId
          tier: 'reguler' as ProductTier,
          accountLevel: '',
          accountDetails: '',
          stock: 0,
          isActive: true,
          isFlashSale: false,
          hasRental: false,
          image: '',
          images: [],
        });
        setRentalOptions([]);
      }
      setError(null);
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Product description is required');
      }
      if (formData.price <= 0) {
        throw new Error('Product price must be greater than 0');
      }
      if (!formData.category.trim()) {
        throw new Error('Product category is required');
      }
      if (!formData.gameTitleId) {
        throw new Error('Please select a game title');
      }
      if (formData.stock < 0) {
        throw new Error('Stock cannot be negative');
      }

      // Map form data to both camelCase and snake_case to satisfy both TypeScript and API
      const apiData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        originalPrice: formData.originalPrice, // camelCase for TypeScript
        original_price: formData.originalPrice, // snake_case for database
        category: formData.category.trim(),
        gameTitle: formData.gameTitle, // camelCase for TypeScript
        game_title: formData.gameTitle, // snake_case for database
        gameTitleId: formData.gameTitleId, // camelCase for TypeScript
        game_title_id: formData.gameTitleId, // snake_case for database
        tier: formData.tier,
        accountLevel: formData.accountLevel?.trim() || null, // camelCase for TypeScript
        account_level: formData.accountLevel?.trim() || null, // snake_case for database
        accountDetails: formData.accountDetails?.trim() || null, // camelCase for TypeScript
        account_details: formData.accountDetails?.trim() || null, // snake_case for database
        stock: formData.stock,
        isActive: formData.isActive, // camelCase for TypeScript
        is_active: formData.isActive, // snake_case for database
        isFlashSale: formData.isFlashSale, // camelCase for TypeScript
        is_flash_sale: formData.isFlashSale, // snake_case for database
        hasRental: formData.hasRental, // camelCase for TypeScript
        has_rental: formData.hasRental, // snake_case for database
        image: formData.images[0] || '',
        images: formData.images,
      };

      if (isEdit && product) {
        // Update existing product
        console.log('🔄 Updating product:', apiData);
        const result = await ProductService.updateProduct(product.id, apiData);
        if (result) {
          console.log('✅ Product updated successfully');
          showSuccess('Product Updated', 'Product has been successfully updated.');
        } else {
          throw new Error('Failed to update product');
        }
      } else {
        // Create new product
        console.log('➕ Creating product:', apiData);
        const result = await ProductService.createProduct(apiData);
        if (result) {
          console.log('✅ Product created successfully');
          showSuccess('Product Created', 'New product has been successfully added.');
        } else {
          throw new Error('Failed to create product');
        }
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error saving product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product. Please try again.';
      showError('Save Failed', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <IOSButton 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 border-white/20"
          >
            <X className="w-5 h-5" />
          </IOSButton>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Details */}
              <div className="lg:col-span-1">
                <ProductDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>

              {/* Product Images */}
              <div className="lg:col-span-1">
                <ProductImagesUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                />
              </div>

              {/* Rental Options */}
              <div className="lg:col-span-1">
                <RentalOptionsForm
                  hasRental={formData.hasRental}
                  onHasRentalChange={(hasRental) => setFormData(prev => ({ ...prev, hasRental }))}
                  rentalOptions={rentalOptions}
                  onRentalOptionsChange={setRentalOptions}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4">
              <IOSButton
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                Cancel
              </IOSButton>
              <IOSButton
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 hover:from-pink-500/30 hover:to-fuchsia-500/30 text-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </IOSButton>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};
