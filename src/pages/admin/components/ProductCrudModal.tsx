import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../../services/adminService';
import { ProductService } from '../../../services/productService';
import { IOSButton } from '../../../components/ios/IOSDesignSystemV2';
import { useNotifications } from '../../../components/ios/NotificationSystem';
import { 
  ProductDetailsForm, 
  ProductImagesUpload, 
  RentalOptionsForm 
} from './product-crud';
import type { RentalOption } from './product-crud';
import { useCategories } from '../../../hooks/useCategories';

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
  const initialFocusRef = useRef<HTMLHeadingElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
  categoryId: '',
  gameTitleId: '', // FK only
  tierId: '', // reintroduced relational tier FK
    stock: 0,
    isActive: true,
    isFlashSale: false,
    hasRental: false,
    image: '',
    images: [] as string[],
  });

  const [rentalOptions, setRentalOptions] = useState<RentalOption[]>([]);
  const { categories, loading: loadingCategories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false); // track child uploader state
  const [error, setError] = useState<string | null>(null);
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();

  const isEdit = !!product;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        console.debug('[ProductCrudModal] Editing product raw:', {
          id: product.id,
          category_id: (product as any).category_id,
          categoryId: (product as any).categoryId,
          // tiers removed
        });
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          originalPrice: product.original_price || 0,
          // categoryId: product may have either category_id (snake) or categoryId (camel) depending on fetch path
          categoryId: (product as any).category_id || (product as any).categoryId || '',
          gameTitleId: (product as any).game_title_id || (product as any).gameTitleId || '',
          tierId: (product as any).tier_id || (product as any).tierId || '',
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
          categoryId: '',
          gameTitleId: '',
          tierId: '',
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

  // After categories load, ensure categoryId persists (avoid cleared select when option appears later)
  useEffect(() => {
    if (!loadingCategories && product) {
      const existing = (product as any).category_id || (product as any).categoryId;
      if (existing && !formData.categoryId) {
        const existsInList = categories.some(c => c.id === existing);
        if (existsInList) {
          setFormData(prev => ({ ...prev, categoryId: existing }));
        }
      }
    }
  }, [loadingCategories, categories, product, formData.categoryId]);

  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen]);

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
  if (!formData.categoryId) {
        throw new Error('Product category is required');
      }
      if (!formData.gameTitleId) {
        throw new Error('Please select a game title');
      }
      if (formData.stock < 0) {
        throw new Error('Stock cannot be negative');
      }

      // Block submit if uploads still in progress
      if (imagesUploading) {
        throw new Error('Masih mengupload gambar. Mohon tunggu sampai selesai.');
      }

      // Sanitize images: disallow ANY blob: leftover (stricter)
      const hasBlob = (formData.images || []).some(img => img.startsWith('blob:'));
      if (hasBlob) {
        throw new Error('Ada gambar yang belum selesai diupload. Tunggu atau hapus gambar blob.');
      }
      const sanitizedImages = formData.images || [];

      // Map form data to both camelCase and snake_case to satisfy both TypeScript and API
      const apiData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        originalPrice: formData.originalPrice,
        original_price: formData.originalPrice,
        categoryId: formData.categoryId,
        category_id: formData.categoryId,
        // Only send relational foreign key for game title (legacy text column removed)
  // legacy gameTitle placeholder removed
  gameTitleId: formData.gameTitleId,
  game_title_id: formData.gameTitleId,
  tierId: formData.tierId || null,
  tier_id: formData.tierId || null,
        stock: formData.stock,
        isActive: formData.isActive,
        is_active: formData.isActive,
        isFlashSale: formData.isFlashSale,
        is_flash_sale: formData.isFlashSale,
        hasRental: formData.hasRental,
        has_rental: formData.hasRental,
        image: sanitizedImages[0] || '',
        images: sanitizedImages,
      } as const;

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

  // Close on Escape key (register regardless, logic checks isOpen)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-shell">
        <div className="modal-header">
          <h2 ref={initialFocusRef} tabIndex={-1} id="product-modal-title" className="modal-title focus-ring">
            {isEdit ? 'Ubah Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} type="button" className="modal-close focus-ring" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body stack-xl">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="stack-lg">
            <ProductDetailsForm
              formData={formData}
              setFormData={setFormData}
            />
            <ProductImagesUpload
              images={formData.images}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              onUploadingChange={setImagesUploading}
            />
            {/* Product Active Switch Section */}
            <div className="section-block stack-md">
              <div className="section-title">Status Produk</div>
              <div className="section-divider" />
              <div className="flex items-center justify-between p-sm rounded-xl bg-white/5 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white/90">Aktif</span>
                  <span className="text-xs text-white/50">Tentukan apakah produk dapat ditampilkan & dijual</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`toggle ${formData.isActive ? 'active' : ''}`}
                />
              </div>
            </div>
            <RentalOptionsForm
              hasRental={formData.hasRental}
              onHasRentalChange={(hasRental) => setFormData(prev => ({ ...prev, hasRental }))}
              rentalOptions={rentalOptions}
              onRentalOptionsChange={setRentalOptions}
              isActive={formData.isActive}
              onIsActiveChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
            />
          </div>
          <div className="modal-footer flex items-center justify-end gap-3 pt-4">
            <IOSButton
              type="button"
              variant="tertiary"
              size="md"
              onClick={onClose}
              className="min-w-[120px]"
            >
              Batal
            </IOSButton>
            <IOSButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || imagesUploading || !formData.name.trim()}
              className="min-w-[160px]"
            >
              {loading ? 'Menyimpan...' : imagesUploading ? 'Menunggu Upload...' : (isEdit ? 'Perbarui Produk' : 'Buat Produk')}
            </IOSButton>
          </div>
        </form>
      </div>
    </div>
  );
};
