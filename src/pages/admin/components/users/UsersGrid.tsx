import React from 'react';
import { User } from '../../../../services/adminService';
import { UserCard } from './UserCard';
import { cn } from '../../../../styles/standardClasses';

interface UsersGridProps {
  users: User[];
  loading?: boolean;
  onUserClick?: (user: User) => void;
  className?: string;
}

export const UsersGrid: React.FC<UsersGridProps> = ({
  users,
  loading,
  onUserClick,
  className
}) => {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 border border-pink-500/20 bg-gradient-to-br from-black/50 to-gray-950/50 animate-pulse"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-pink-500/30 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-pink-500/20 rounded mb-2"></div>
                <div className="h-3 bg-pink-500/20 rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-pink-500/20 rounded"></div>
              <div className="h-3 bg-pink-500/20 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={cn(
        'rounded-2xl border border-pink-500/20 bg-gradient-to-br from-black/50 to-gray-950/50 p-16 text-center',
        className
      )}>
        <div className="text-6xl mb-6">👥</div>
        <h3 className="text-2xl font-bold text-white mb-4">No Users Found</h3>
        <p className="text-pink-200/70 max-w-md mx-auto">
          No users match your current search criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
};

export default UsersGrid;
