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
      'group hover:scale-[1.02] transition-all duration-300 overflow-hidden',
      'bg-gradient-to-br from-white/5 via-white/3 to-transparent backdrop-blur-sm',
      'border border-white/10 hover:border-pink-500/30',
      'shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-pink-500/20',
      className
    )}>
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM3Mzc0MSIvPgo8cGF0aCBkPSJNMjAgMTBWMzBNMTAgMjBIMzAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className={cn(
              'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border',
              product.is_active 
                ? 'bg-green-500/80 text-white border-green-400/50' 
                : 'bg-red-500/80 text-white border-red-400/50'
            )}>
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
            {product.is_flash_sale && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-pink-500/80 text-white border border-pink-400/50 backdrop-blur-sm">
                ⚡ Flash Sale
              </span>
            )}
          </div>
          {(product as any).rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full backdrop-blur-sm border border-white/20">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-semibold text-yellow-400">
                {(product as any).rating}
              </span>
            </div>
          )}
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/70 rounded-full backdrop-blur-sm border border-white/20">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-sm font-bold text-green-400">
              Rp {product.price?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {product.category && (
            <span className="inline-block px-2 py-1 text-xs text-gray-300 bg-white/5 rounded-md border border-white/10">
              {product.category}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onView?.(product)}
            className="flex-1 text-xs py-2 hover:bg-pink-500/20 border border-pink-500/30"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            View
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onEdit?.(product)}
            className="flex-1 text-xs py-2 hover:bg-blue-500/20 border border-blue-500/30"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="small"
            onClick={() => onDelete?.(product)}
            className="hover:bg-red-500/20 border border-red-500/30 px-3 py-2"
          >
            <Trash2 className="w-3 h-3" />
          </IOSButton>
        </div>
      </div>
    </IOSCard>
  );
};

export default ProductCard;
