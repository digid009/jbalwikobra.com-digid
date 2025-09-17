import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const MIN_TOUCH = 44;

export const FeedPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={`flex items-center justify-center rounded-lg transition-all duration-200 ${currentPage === 1 || loading ? 'bg-black/50 text-white/50 cursor-not-allowed' : 'bg-black text-white hover:bg-black/80'}`}
        style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH }}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex flex-row gap-1 mx-2">
        {getPageNumbers().map((pageNum, idx) => (
          <button
            key={`${pageNum}-${idx}`}
            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
            disabled={pageNum === '...' || loading}
            className={`rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${pageNum === currentPage
                ? 'bg-pink-500 text-white shadow-lg'
                : pageNum === '...'
                ? 'text-white/70 cursor-default bg-transparent'
                : 'bg-black text-white hover:bg-black/80 disabled:opacity-50'
              }`}
            style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH }}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className={`rounded-lg flex items-center justify-center transition-all duration-200 ${currentPage === totalPages || loading ? 'bg-black/50 text-white/50 cursor-not-allowed' : 'bg-black text-white hover:bg-black/80'}`}
        style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH }}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default FeedPagination;
