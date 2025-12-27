import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IOSButton } from '../ios/IOSDesignSystemV2';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  const buildPages = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <nav className={`flex items-center justify-center gap-2 py-8 ${className}`} aria-label="Paginasi katalog">
      <IOSButton
        variant="tertiary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => go(currentPage - 1)}
        className="w-10 h-10 p-0"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={16} />
      </IOSButton>
      <div className="flex items-center gap-1">
        {buildPages().map((p, i) => p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-zinc-500">...</span>
        ) : (
          <IOSButton
            key={p}
            variant={p === currentPage ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => go(p as number)}
            className="w-9 h-9 p-0"
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={p === currentPage ? `Halaman ${p}, saat ini` : `Ke halaman ${p}`}
          >
            {p}
          </IOSButton>
        ))}
      </div>
      <IOSButton
        variant="tertiary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => go(currentPage + 1)}
        className="w-10 h-10 p-0"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight size={16} />
      </IOSButton>
    </nav>
  );
};

export default PaginationBar;
