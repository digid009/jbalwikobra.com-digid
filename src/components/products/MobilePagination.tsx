/**
 * MobilePagination - Mobile-optimized pagination component
 * Features touch-friendly controls and smart page visibility
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IOSButton } from '../ios/IOSDesignSystemV2';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const MobilePagination = React.memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: MobilePaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

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
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index);
  };

  return (
    <div className="flex items-center justify-center space-x-2 px-4 py-6">
      <IOSButton
        variant="tertiary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-12 h-12 p-0"
      >
        <ChevronLeft size={18} />
      </IOSButton>
      
      <div className="flex items-center space-x-2 mx-4">
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-zinc-500">...</span>
            ) : (
              <IOSButton
                variant={currentPage === page ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="w-10 h-10 p-0"
              >
                {page}
              </IOSButton>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <IOSButton
        variant="tertiary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-12 h-12 p-0"
      >
        <ChevronRight size={18} />
      </IOSButton>
    </div>
  );
});

MobilePagination.displayName = 'MobilePagination';
