import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import { IOSButton, IOSBadge } from '../components/ios/IOSDesignSystem';
import { cn } from '../utils/cn';
import LinkifyText from '../components/LinkifyText';

interface ModernFeedCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author?: string;
    created_at: string;
    type?: string;
    image?: string;
    media?: string[];
    counts: {
      likes: number;
      comments: number;
      shares?: number;
    };
    isLiked?: boolean;
  };
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onImageClick?: (image: string) => void;
  canInteract?: boolean;
}

export const ModernFeedCard: React.FC<ModernFeedCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onImageClick,
  canInteract = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = post.content.length > 200;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, 200) + '...' 
    : post.content;

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'announcement':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPostTypeBadge = () => {
    switch (post.type) {
      case 'announcement':
        return (
          <IOSBadge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-100">
            Pengumuman
          </IOSBadge>
        );
      case 'review':
        return (
          <IOSBadge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-100">
            Review
          </IOSBadge>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}h`;
    return postDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 hover:border-white/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Post Type Icon */}
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center border border-pink-500/30">
            {getPostTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-lg truncate">
                {post.title}
              </h3>
              {getPostTypeBadge()}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{formatTimeAgo(post.created_at)}</span>
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Options */}
        <IOSButton
          size="small"
          className="bg-white/5 hover:bg-white/10 border-white/10 p-2"
        >
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </IOSButton>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="text-white/90 leading-relaxed">
          <LinkifyText text={displayContent} />
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-pink-400 hover:text-pink-300 text-sm font-medium mt-2 transition-colors"
          >
            {isExpanded ? 'Tampilkan lebih sedikit' : 'Selengkapnya'}
          </button>
        )}
      </div>

      {/* Media Grid */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          <div className={cn(
            "grid gap-2 rounded-xl overflow-hidden",
            post.media.length === 1 ? "grid-cols-1" :
            post.media.length === 2 ? "grid-cols-2" :
            post.media.length === 3 ? "grid-cols-2" : "grid-cols-2"
          )}>
            {post.media.slice(0, 4).map((mediaUrl, index) => (
              <div
                key={index}
                className={cn(
                  "relative group cursor-pointer rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50",
                  post.media!.length === 3 && index === 0 ? "row-span-2" : "",
                  post.media!.length === 1 ? "aspect-video" : "aspect-square"
                )}
                onClick={() => onImageClick?.(mediaUrl)}
              >
                <img
                  src={mediaUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay for additional images */}
                {index === 3 && post.media!.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{post.media!.length - 4}
                    </span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <IOSButton
            size="small"
            onClick={() => canInteract && onLike?.(post.id)}
            disabled={!canInteract}
            className={cn(
              "flex items-center gap-2 px-3 py-2 transition-all duration-200",
              post.isLiked
                ? "bg-gradient-to-r from-pink-500/30 to-red-500/30 border-pink-500/50 text-pink-200"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
            )}
          >
            <Heart className={cn(
              "w-4 h-4 transition-colors",
              post.isLiked ? "fill-current text-pink-400" : ""
            )} />
            <span className="text-sm font-medium">{post.counts.likes}</span>
          </IOSButton>

          {/* Comment Button */}
          <IOSButton
            size="small"
            onClick={() => canInteract && onComment?.(post.id)}
            disabled={!canInteract}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{post.counts.comments}</span>
          </IOSButton>

          {/* Share Button */}
          <IOSButton
            size="small"
            onClick={() => canInteract && onShare?.(post.id)}
            disabled={!canInteract}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">{post.counts.shares || 0}</span>
          </IOSButton>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(post.created_at).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>
    </div>
  );
};
