import React from 'react';
import { Search } from 'lucide-react';
import { IOSCard, IOSButton } from '../ios/IOSDesignSystemV2';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak ada produk ditemukan',
  message = 'Coba ubah kata kunci pencarian atau filter Anda',
  onReset
}) => {
  return (
    <div role="status" aria-live="polite">
      <IOSCard padding="lg" className="text-center">
      <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <Search className="text-zinc-500" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 mb-6 text-sm">{message}</p>
      {onReset && (
        <IOSButton variant="primary" size="md" onClick={onReset}>
          Reset Filter
        </IOSButton>
      )}
      </IOSCard>
    </div>
  );
};

export default EmptyState;
