import React from 'react';
import { IOSCard, IOSButton } from '../ios/IOSDesignSystemV2';
import { Star, Edit2, Save, X } from 'lucide-react';

export interface ReviewData {
  id: string;
  user_id?: string;
  user_name?: string | null;
  user_avatar?: string | null;
  rating: number;
  created_at: string;
  product_name?: string | null;
  product_image?: string | null;
  comment: string;
  canEdit?: boolean;
}

interface ReviewCardProps {
  review: ReviewData;
  currentUserId?: string;
  isEditing: boolean;
  editValue: string;
  onStartEdit: (review: ReviewData) => void;
  onChangeEdit: (val: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onImageClick?: (src: string) => void;
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const timeAgo = (date: string) => {
  const now = new Date();
  const created = new Date(date);
  const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  if (diff < 1) return 'Baru saja';
  if (diff < 60) return `${diff} menit lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
  return `${Math.floor(diff / 1440)} hari lalu`;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  isEditing,
  editValue,
  onStartEdit,
  onChangeEdit,
  onSaveEdit,
  onCancelEdit,
  onImageClick
}) => {
  return (
    <IOSCard padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {review.user_avatar ? (
            <img src={review.user_avatar} alt={review.user_name || 'User'} className="w-9 h-9 rounded-full object-cover border border-gray-700" loading="lazy" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center text-xs font-bold text-white">
              {(review.user_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{review.user_name || 'Anonymous'}</div>
            <div className="flex items-center gap-2">
              <Stars rating={review.rating} />
              <span className="text-xs text-white/70">{timeAgo(review.created_at)}</span>
            </div>
            {review.product_name && (
              <div className="text-xs text-white/70 mt-1">Review untuk: {review.product_name}</div>
            )}
          </div>
        </div>
        {review.user_id === currentUserId && review.canEdit && (
          <IOSButton variant="ghost" size="sm" onClick={() => onStartEdit(review)} className="gap-1">
            <Edit2 className="h-3 w-3" />
            Edit
          </IOSButton>
        )}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-4 items-start mb-2">
        <div className="w-fit">
          {review.product_image ? (
            <button onClick={() => onImageClick?.(review.product_image!)} className="block" aria-label="Lihat gambar produk">
              <img src={review.product_image} alt={review.product_name || 'Product'} className="w-full max-w-[120px] h-auto rounded-xl object-cover border border-gray-700" loading="lazy" />
            </button>
          ) : (
            <div className="w-[120px] h-[90px] rounded-xl bg-black/60 border border-gray-700" />
          )}
        </div>
        <div>
          {isEditing ? (
            <div className="space-y-3">
              <textarea value={editValue} onChange={(e) => onChangeEdit(e.target.value)} placeholder="Tulis review Anda..." className="w-full min-h-[100px] p-3 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <div className="flex gap-2">
                <IOSButton size="sm" onClick={() => onSaveEdit(review.id)} className="gap-1">
                  <Save className="h-3 w-3" />
                  Simpan
                </IOSButton>
                <IOSButton variant="secondary" size="sm" onClick={onCancelEdit} className="gap-1">
                  <X className="h-3 w-3" />
                  Batal
                </IOSButton>
              </div>
            </div>
          ) : (
            <p className="text-base leading-relaxed">{review.comment}</p>
          )}
          {review.canEdit && !isEditing && (
            <p className="text-xs text-white/70 mt-2">Review dapat diedit dalam 5 menit</p>
          )}
        </div>
      </div>
    </IOSCard>
  );
};

export default ReviewCard;
