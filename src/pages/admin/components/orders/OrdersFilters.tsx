import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { IOSButton } from '../../../../components/ios/IOSDesignSystem';
import { cn } from '../../../../styles/standardClasses';

interface OrdersFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  amountFilter: string;
  onAmountFilterChange: (amount: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' }
];

const amountOptions = [
  { value: 'all', label: 'All Amounts' },
  { value: 'under-50k', label: 'Under 50K' },
  { value: '50k-200k', label: '50K - 200K' },
  { value: '200k-500k', label: '200K - 500K' },
  { value: 'over-500k', label: 'Over 500K' }
];

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  amountFilter,
  onAmountFilterChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search orders by ID, customer name, or phone..."
          className={cn(
            'w-full pl-12 pr-4 py-3 bg-gradient-to-r from-black/50 to-gray-950/50 border border-pink-500/30',
            'rounded-2xl text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-pink-500/50',
            'focus:border-pink-500/50 transition-all duration-300 backdrop-blur-sm'
          )}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-pink-400" />
          <span className="text-sm font-medium text-pink-200">Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={cn(
            'px-4 py-2 bg-gradient-to-r from-black/70 to-gray-950/70 border border-pink-500/30',
            'rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50',
            'focus:border-pink-500/50 transition-all duration-200 backdrop-blur-sm'
          )}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className={cn(
            'px-4 py-2 bg-gradient-to-r from-black/70 to-gray-950/70 border border-pink-500/30',
            'rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50',
            'focus:border-pink-500/50 transition-all duration-200 backdrop-blur-sm'
          )}
        >
          {dateOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>

        {/* Amount Filter */}
        <select
          value={amountFilter}
          onChange={(e) => onAmountFilterChange(e.target.value)}
          className={cn(
            'px-4 py-2 bg-gradient-to-r from-black/70 to-gray-950/70 border border-pink-500/30',
            'rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50',
            'focus:border-pink-500/50 transition-all duration-200 backdrop-blur-sm'
          )}
        >
          {amountOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <IOSButton
            variant="ghost"
            size="small"
            onClick={onClearFilters}
            className="flex items-center gap-2 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </IOSButton>
        )}
      </div>
    </div>
  );
};

export default OrdersFilters;
