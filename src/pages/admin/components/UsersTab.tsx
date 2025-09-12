import React from 'react';
import { Users, Shield, CheckCircle, XCircle, Phone, Mail, Calendar } from 'lucide-react';
import { IOSCard, IOSBadge } from '../../../components/ios/IOSDesignSystem';
import { useUsers } from '../hooks/useAdminData';
import { User } from '../types';

const UsersTab: React.FC = () => {
  const { users, loading, error } = useUsers();

  const getUserBadges = (user: User) => {
    const badges = [];
    
    if (user.is_admin) {
      badges.push(
        <IOSBadge key="admin" variant="primary" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin
        </IOSBadge>
      );
    }
    
    if (user.phone_verified) {
      badges.push(
        <IOSBadge key="verified" variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Verified
        </IOSBadge>
      );
    } else {
      badges.push(
        <IOSBadge key="unverified" variant="warning" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Unverified
        </IOSBadge>
      );
    }
    
    if (!user.is_active) {
      badges.push(
        <IOSBadge key="inactive" variant="destructive" className="flex items-center gap-1">
          Inactive
        </IOSBadge>
      );
    }
    
    return badges;
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <IOSCard key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black-secondary rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-black-secondary rounded mb-2"></div>
                <div className="h-3 bg-black-secondary rounded w-2/3"></div>
              </div>
            </div>
          </IOSCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <IOSCard className="p-6 text-center">
        <div className="text-ios-destructive mb-4">
          <Users className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load users</p>
          <p className="text-sm text-gray-200">{error}</p>
        </div>
      </IOSCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Users Management</h2>
        <div className="text-sm text-gray-200">
          {users.length} users found
        </div>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <IOSCard className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
          <p className="text-gray-200">Registered users will appear here</p>
        </IOSCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <IOSCard key={user.id} className="p-6 hover:shadow-lg transition-all duration-200">
              {/* User Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ios-primary text-white rounded-full flex items-center justify-center font-medium">
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {user.name || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-200">
                      ID: {user.id.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getUserBadges(user)}
              </div>

              {/* User Info */}
              <div className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* User Stats */}
              <div className="mt-4 pt-4 border-t border-ios-separator">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-white">0</p>
                    <p className="text-xs text-gray-200">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">₹0</p>
                    <p className="text-xs text-gray-200">Spent</p>
                  </div>
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersTab;
