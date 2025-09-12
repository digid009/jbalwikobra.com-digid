import React from 'react';
import { Product } from '../../../../services/adminService';
import { IOSButton, IOSCard } from '../../../../components/ios/IOSDesignSystem';
import { Package, Edit, Eye, Trash2, Star, DollarSign } from 'lucide-react';
import { cn } from '../../../../styles/standardClasses';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  className
}) => {
  return (
    <IOSCard className={cn(
      'group hover:scale-[1.02] transition-all duration-300 cursor-pointer',
      'bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm',
      'border border-pink-500/20 hover:border-pink-500/40',
      'shadow-lg shadow-pink-500/10 hover:shadow-xl hover:shadow-pink-500/20',
      className
    )}>
      <div className="p-6 space-y-4">
        {/* Product Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  'inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full',
                  product.is_active 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                )}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
                {product.is_flash_sale && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    Flash Sale
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {product.description && (
            <p className="text-sm text-gray-300 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-green-400">
                Rp {product.price?.toLocaleString() || '0'}
              </span>
            </div>
            {(product as any).rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-yellow-400">
                  {(product as any).rating}
                </span>
              </div>
            )}
          </div>

          {product.image && (
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onView?.(product)}
            className="flex-1 hover:bg-pink-500/20 border border-pink-500/30"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onEdit?.(product)}
            className="flex-1 hover:bg-blue-500/20 border border-blue-500/30"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onDelete?.(product)}
            className="hover:bg-red-500/20 border border-red-500/30 px-3"
          >
            <Trash2 className="w-4 h-4" />
          </IOSButton>
        </div>
      </div>
    </IOSCard>
  );
};

export default ProductCard;
