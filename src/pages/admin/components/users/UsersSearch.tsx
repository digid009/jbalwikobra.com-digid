import React from 'react';
import { Search, Filter, X, UserCheck, UserX } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface UsersSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  userTypeFilter: string;
  onUserTypeFilterChange: (type: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const userTypeOptions = [
  { value: 'all', label: 'All Users', icon: null },
  { value: 'admin', label: 'Admins Only', icon: UserCheck },
  { value: 'regular', label: 'Regular Users', icon: UserX }
];

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export const UsersSearch: React.FC<UsersSearchProps> = ({
  searchTerm,
  onSearchChange,
  userTypeFilter,
  onUserTypeFilterChange,
  dateFilter,
  onDateFilterChange,
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
          placeholder="Search users by name, email, or phone..."
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

        {/* User Type Filter */}
        <div className="flex items-center gap-2">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => onUserTypeFilterChange(option.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  userTypeFilter === option.value
                    ? 'bg-gradient-to-r from-pink-500/30 to-fuchsia-600/30 text-white border border-pink-500/50'
                    : 'bg-gradient-to-r from-black/70 to-gray-950/70 text-pink-200 border border-pink-500/30 hover:bg-pink-500/20'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {option.label}
              </button>
            );
          })}
        </div>

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

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-ghost btn-sm flex items-center gap-2 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default UsersSearch;
