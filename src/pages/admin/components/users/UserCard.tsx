import React from 'react';
import { User } from '../../../../services/adminService';
import { IOSAvatar } from '../../../../components/ios/IOSAvatar';
import { formatShortDate } from '../../../../utils/format';
import { Shield, Mail, Phone, Calendar } from 'lucide-react';
const cn = (...c: any[]) => c.filter(Boolean).join(' ');

interface UserCardProps {
  user: User;
  onUserClick?: (user: User) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUserClick, className }) => {
  const handleClick = () => {
    onUserClick?.(user);
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-6 border border-pink-500/20 bg-gradient-to-br from-black/50 via-gray-950/50 to-black/50',
        'backdrop-blur-sm shadow-lg shadow-pink-500/10 transition-all duration-300 cursor-pointer',
        'hover:shadow-xl hover:shadow-pink-500/20 hover:border-pink-500/40 hover:scale-[1.02]',
        className
      )}
      onClick={handleClick}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(236,72,153,0.15),transparent_70%)] rounded-2xl" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* User Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <IOSAvatar
              user={user}
              size="medium"
              className="ring-2 ring-pink-500/30 group-hover:ring-pink-500/50 transition-all duration-300"
            />
            <div>
              <h3 className="font-bold text-white group-hover:text-pink-100 transition-colors">
                {user.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-sm text-pink-200/80 truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
          
          {user.is_admin && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/30 to-fuchsia-600/30 rounded-full border border-pink-500/40">
              <Shield className="w-4 h-4 text-pink-300" />
              <span className="text-xs font-semibold text-pink-200">Admin</span>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            {user.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-200/80">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-200/80">
                Joined {formatShortDate(user.created_at)}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            {user.last_login && (
              <div className="text-sm">
                <span className="text-pink-200/60">Last seen:</span>
                <br />
                <span className="text-pink-200/80 font-medium">
                  {formatShortDate(user.last_login)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-pink-500/10 group-hover:ring-pink-500/30 pointer-events-none transition-all duration-300" />
    </div>
  );
};

export default UserCard;
