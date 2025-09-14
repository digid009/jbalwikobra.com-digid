import React from 'react';
import { Product } from '../../../../services/adminService';
import { IOSButton, IOSCard } from '../../../../components/ios/IOSDesignSystemV2';
import { Package, Edit, Eye, Trash2, Star, DollarSign, Crown, Users, Trophy } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');
import { Tier, GameTitle } from '../../../../types';

interface ProductCardProps {
  product: Product;
  tiers?: Tier[];
  gameTitles?: GameTitle[];
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  tiers,
  gameTitles,
  onView,
  onEdit,
  onDelete,
  className
}) => {
  // Get tier data for styling - matching products page style
  const getTierStyles = (product: Product) => {
    // First try to get tier from the tiers array using tier_id
    let tierData = null;
    if (product.tier_id && tiers) {
      tierData = tiers.find(t => t.id === product.tier_id);
    }
    
    // Try to get tier from product data relationships (fallback)
    const tierSlug = tierData?.slug || (product as any).tiers?.slug || (product as any).tier_slug || product.tier;
    const tierName = tierData?.name || (product as any).tiers?.name || (product as any).tier_name;
    const tierColor = tierData?.color || (product as any).tiers?.color;
    
    switch (tierSlug) {
      case 'premium':
        return {
          // Card background gradient - matching products page
          cardBg: 'bg-gradient-to-br from-amber-700/40 via-amber-700/30 to-yellow-700/40',
          cardBorder: 'border-amber-500/30',
          // Tier tag gradient 
          bg: 'from-amber-500/20 to-orange-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-200',
          icon: Crown,
          name: tierName || 'PREMIUM'
        };
      case 'pelajar':
        return {
          // Card background gradient - matching products page
          cardBg: 'bg-gradient-to-br from-blue-700/40 via-blue-700/30 to-indigo-700/40',
          cardBorder: 'border-blue-500/30',
          // Tier tag gradient
          bg: 'from-blue-500/20 to-indigo-500/20', 
          border: 'border-blue-500/30',
          text: 'text-blue-200',
          icon: Users,
          name: tierName || 'PELAJAR'
        };
      case 'reguler':
      default:
        return {
          // Card background gradient - matching products page
          cardBg: 'bg-gradient-to-br from-zinc-700/40 via-zinc-700/30 to-gray-700/40',
          cardBorder: 'border-gray-500/30',
          // Tier tag gradient
          bg: 'from-gray-500/20 to-slate-500/20',
          border: 'border-gray-500/30', 
          text: 'text-gray-200',
          icon: Trophy,
          name: tierName || 'REGULER'
        };
    }
  };

  const tierStyle = getTierStyles(product);
  const TierIcon = tierStyle.icon;

  // Get game title data - use passed gameTitles array for better data
  const getGameTitleData = () => {
    if (product.game_title_id && gameTitles) {
      const gameTitle = gameTitles.find(gt => gt.id === product.game_title_id);
      if (gameTitle) {
        return {
          name: gameTitle.name,
          slug: gameTitle.slug
        };
      }
    }
    
    // Fallback to existing data
    return {
      name: (product as any).game_titles?.name || (product as any).game_title_name || product.game_title || 'Game',
      slug: (product as any).game_titles?.slug || (product as any).game_title_slug
    };
  };

  const gameTitle = getGameTitleData().name;

  return (
    <IOSCard 
      variant="elevated" 
      padding="none"
      hoverable
      className={cn(
        'group overflow-hidden transition-all duration-300 border',
        // Apply tier styling to entire card - matching products page
        tierStyle.cardBg,
        tierStyle.cardBorder,
        'shadow-lg shadow-black/20 hover:shadow-xl',
        // Tier-specific hover effects
        tierStyle.cardBorder.includes('amber') ? 'hover:shadow-amber-500/20' :
        tierStyle.cardBorder.includes('blue') ? 'hover:shadow-blue-500/20' :
        'hover:shadow-gray-500/20',
        className
      )}
    >
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
            {/* Tier Tag */}
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border',
              `bg-gradient-to-r ${tierStyle.bg} ${tierStyle.border} ${tierStyle.text}`
            )}>
              <TierIcon className="w-3 h-3" />
              {tierStyle.name}
            </span>
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
          
          {/* Game Title and Category */}
          <div className="flex flex-wrap gap-2">
            {gameTitle && (
              <span className="inline-block px-2 py-1 text-xs text-blue-300 bg-blue-500/10 rounded-md border border-blue-500/20">
                🎮 {gameTitle}
              </span>
            )}
            {product.category && (
              <span className="inline-block px-2 py-1 text-xs text-gray-300 bg-white/5 rounded-md border border-white/10">
                {product.category}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <IOSButton
            variant="ghost"
            size="sm"
            onClick={() => onView?.(product)}
            className="flex-1 text-xs py-2 hover:bg-pink-500/20 border border-pink-500/30"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            View
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(product)}
            className="flex-1 text-xs py-2 hover:bg-blue-500/20 border border-blue-500/30"
          >
            <Edit className="w-3 h-3 mr-1.5" />
            Edit
          </IOSButton>
          <IOSButton
            variant="ghost"
            size="sm"
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
