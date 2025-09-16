/**
 * ProductsSearchBar - Search and filter bar component
 * Features optimized search input with clear functionality
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { IOSContainer, IOSInputField, IOSButton } from '../ios/IOSDesignSystemV2';

interface ProductsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterOpen: () => void;
}

export const ProductsSearchBar = React.memo(({
  searchTerm,
  onSearchChange,
  onFilterOpen
}: ProductsSearchBarProps) => {
  return (
    <section className="mb-6 pt-6">
      <IOSContainer size="xl">
        <div className="flex space-x-3">
          <div className="flex-1">
            <IOSInputField
              leadingIcon={<Search size={16} />}
              placeholder="Cari akun game..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              inputSize="md"
              variant="filled"
              trailingIcon={searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
      <X size={16} />
                </button>
              ) : undefined}
            />
          </div>
          <IOSButton
            variant="tertiary"
    size="sm"
            onClick={onFilterOpen}
    className="w-12 h-12 p-0 flex items-center justify-center shrink-0 rounded-2xl"
            aria-label="Buka Filter"
          >
    <Filter size={16} className="text-zinc-300" />
            <span className="sr-only">Filter</span>
          </IOSButton>
        </div>
      </IOSContainer>
    </section>
  );
});

ProductsSearchBar.displayName = 'ProductsSearchBar';
