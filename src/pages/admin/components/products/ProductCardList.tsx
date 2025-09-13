import React from 'react';
import { Product } from '../../../../services/adminService';
import { IOSButton } from '../../../../components/ios/IOSDesignSystemV2';
import { Package, Edit, Crown, Users, Trophy } from 'lucide-react';
import { cn } from '../../../../styles/standardClasses';
import { Tier, GameTitle } from '../../../../types';

interface ProductCardListProps {
  product: Product;
  tiers?: Tier[];
  gameTitles?: GameTitle[];
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  className?: string;
}

export const ProductCardList: React.FC<ProductCardListProps> = ({
  product,
  tiers,
  gameTitles,
  onEdit,
  onView,
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
          cardBg: 'bg-gradient-to-r from-amber-700/40 via-amber-700/30 to-yellow-700/40',
          cardBorder: 'border-amber-500/30',
          hoverBorder: 'hover:border-amber-500/50',
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
          cardBg: 'bg-gradient-to-r from-blue-700/40 via-blue-700/30 to-indigo-700/40',
          cardBorder: 'border-blue-500/30',
          hoverBorder: 'hover:border-blue-500/50',
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
          cardBg: 'bg-gradient-to-r from-zinc-700/40 via-zinc-700/30 to-gray-700/40',
          cardBorder: 'border-gray-500/30',
          hoverBorder: 'hover:border-gray-500/50',
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
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group backdrop-blur-sm',
        // Apply tier styling to list view card
        tierStyle.cardBg,
        tierStyle.cardBorder,
        tierStyle.hoverBorder,
        className
      )}
    >
      {/* Product Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800/50 to-gray-700/30">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM3Mzc0MSIvPgo8cGF0aCBkPSJNMjAgMTBWMzBNMTAgMjBIMzAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-300 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-400 truncate mt-1">
              {product.description || 'No description available'}
            </p>
            
            {/* Tags Row */}
            <div className="flex items-center gap-2 mt-2">
              {/* Game Title Tag */}
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/10 text-white/90 border border-white/20 rounded-md backdrop-blur-sm">
                {gameTitle}
              </span>
              
              {/* Tier Tag */}
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md backdrop-blur-sm border',
                `bg-gradient-to-r ${tierStyle.bg} ${tierStyle.border} ${tierStyle.text}`
              )}>
                <TierIcon className="w-3 h-3" />
                {tierStyle.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Rp {(product.price || 0).toLocaleString()}
          </div>
          {product.category && (
            <div className="text-xs text-pink-300">{product.category}</div>
          )}
        </div>
        
        {onEdit && (
          <IOSButton
            size="sm"
            onClick={() => onEdit(product)}
            className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-200 hover:text-blue-100 transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </IOSButton>
        )}
        
        {/* Status Badge */}
        <span className={cn(
          "inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap",
          product.is_active
            ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border border-emerald-500/30"
            : "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-200 border border-gray-500/30"
        )}>
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};
