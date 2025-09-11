import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Camera, Tag, Calendar } from 'lucide-react';
import { IOSButton, IOSCard, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { useProducts } from '../hooks/useAdminData';
import { Product } from '../types';
import ProductDialog from './ProductDialog';

const ProductsTab: React.FC = () => {
  const { products, loading, error, saveProduct, deleteProduct } = useProducts();
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      await saveProduct(productData);
      setShowProductDialog(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-ios-surface-secondary rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-ios-surface-secondary rounded mb-2"></div>
                <div className="h-3 bg-ios-surface-secondary rounded w-2/3"></div>
              </div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <IOSCard className="p-6 text-center">
        <div className="text-ios-destructive mb-4">
          <Package className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm text-ios-text-secondary">{error}</p>
        </div>
      </IOSCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ios-text">Products Management</h2>
        <IOSButton
          variant="primary"
          size="medium"
          onClick={handleAddProduct}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </IOSButton>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <IOSCard className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-ios-text-secondary" />
          <h3 className="text-lg font-medium text-ios-text mb-2">No products found</h3>
          <p className="text-ios-text-secondary mb-4">Start by adding your first product</p>
          <IOSButton variant="primary" onClick={handleAddProduct}>
            Add Product
          </IOSButton>
        </IOSCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <IOSCard key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 bg-ios-surface-secondary">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-ios-text-secondary" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-ios-text line-clamp-2">{product.name}</h3>
                  <div className="flex gap-1">
                    {product.is_flash_sale && (
                      <IOSBadge variant="destructive" className="text-xs">
                        Flash Sale
                      </IOSBadge>
                    )}
                    {!product.is_active && (
                      <IOSBadge variant="secondary" className="text-xs">
                        Inactive
                      </IOSBadge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-ios-text-secondary mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-ios-primary">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-ios-text-secondary line-through">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-ios-text-secondary">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {product.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {product.stock_quantity} left
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-ios-text-secondary">
                    <Calendar className="w-3 h-3" />
                    {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <IOSButton
                    variant="secondary"
                    size="small"
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </IOSButton>
                  <IOSButton
                    variant="destructive"
                    size="small"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IOSButton>
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      )}

      {/* Product Dialog */}
      {showProductDialog && (
        <ProductDialog
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductDialog(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
