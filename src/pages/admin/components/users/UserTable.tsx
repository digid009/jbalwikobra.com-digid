import React from 'react';
import { Shield, User, Check, X, Clock, Phone, Mail } from 'lucide-react';
import { AdminDSTable, DSTableColumn, DSTableAction } from '../ui/AdminDSTable';

interface UserTableProps {
  users: any[];
  loading?: boolean;
  currentUserId?: string | null;
  onUpdateRole: (userId: string, role: string) => void;
  onRefresh?: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  currentUserId,
  onUpdateRole,
  onRefresh
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClasses = (isAdmin: boolean) => {
    return isAdmin 
      ? 'text-surface-tint-pink surface-glass-sm border-surface-tint-pink/30'
      : 'text-surface-tint-gray surface-glass-sm border-surface-tint-gray/30';
  };

  const renderRoleBadge = (value: any, user: any) => {
    const isAdmin = user.is_admin;
    const roleText = isAdmin ? 'Admin' : 'User';
    
    return (
      <div className="flex items-center gap-cluster-xs">
        {isAdmin ? <Shield size={14} /> : <User size={14} />}
        <span className={`px-stack-xs py-1 rounded-md border fs-xs font-medium ${getRoleBadgeClasses(isAdmin)}`}>
          {roleText}
        </span>
      </div>
    );
  };

  const renderStatus = (value: any, user: any) => {
    const isActive = user.is_active !== false;
    const isVerified = user.phone_verified === true;
    
    return (
      <div className="flex flex-col gap-cluster-xs">
        <div className="flex items-center gap-cluster-xs">
          {isActive ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <X size={14} className="text-red-400" />
          )}
          <span className={`fs-xs ${isActive ? 'text-green-400' : 'text-red-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {user.phone && (
          <div className="flex items-center gap-cluster-xs">
            <Phone size={12} className={isVerified ? 'text-green-400' : 'text-surface-tint-gray'} />
            <span className={`fs-xs ${isVerified ? 'text-green-400' : 'text-surface-tint-gray'}`}>
              {isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderContact = (value: any, user: any) => (
    <div className="space-y-cluster-xs">
      {user.email && (
        <div className="flex items-center gap-cluster-xs">
          <Mail size={12} className="text-surface-tint-gray" />
          <span className="fs-sm text-surface-tint-gray truncate max-w-[200px]">
            {user.email}
          </span>
        </div>
      )}
      {user.phone && (
        <div className="flex items-center gap-cluster-xs">
          <Phone size={12} className="text-surface-tint-gray" />
          <span className="fs-sm text-surface-tint-gray">
            {user.phone}
          </span>
        </div>
      )}
    </div>
  );

  const renderLastLogin = (value: any, user: any) => {
    if (!user.last_login_at) {
      return (
        <span className="fs-sm text-surface-tint-gray">Never</span>
      );
    }
    
    return (
      <div className="flex items-center gap-cluster-xs">
        <Clock size={12} className="text-surface-tint-gray" />
        <span className="fs-sm text-surface-tint-gray">
          {formatDate(user.last_login_at)}
        </span>
      </div>
    );
  };

  const columns: DSTableColumn[] = [
    {
      key: 'name',
      header: 'User',
      width: 'min-w-[200px]',
      render: (value, user) => (
        <div className="space-y-cluster-xs">
          <div className="font-medium text-white">
            {user.name || 'Unnamed User'}
          </div>
          <div className="fs-xs text-surface-tint-gray">
            ID: {user.id.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact',
      width: 'min-w-[250px]',
      render: renderContact
    },
    {
      key: 'is_admin',
      header: 'Role',
      width: 'w-32',
      render: renderRoleBadge
    },
    {
      key: 'is_active',
      header: 'Status',
      width: 'w-32',
      render: renderStatus
    },
    {
      key: 'last_login_at',
      header: 'Last Login',
      width: 'w-36',
      render: renderLastLogin
    },
    {
      key: 'created_at',
      header: 'Joined',
      width: 'w-32',
      render: (value) => formatDate(value)
    }
  ];

  const actions: DSTableAction[] = [
    {
      key: 'make-admin',
      label: 'Make Admin',
      onClick: (user) => onUpdateRole(user.id, 'admin'),
      icon: Shield,
      variant: 'secondary',
      disabled: (user) => user.is_admin === true
    },
    {
      key: 'make-user',
      label: 'Make User',
      onClick: (user) => onUpdateRole(user.id, 'user'),
      icon: User,
      variant: 'secondary',
      disabled: (user) => {
        // Prevent demoting the last admin or current user if they're admin
        if (user.is_admin !== true) return true;
        const adminCount = users.filter(u => u.is_admin === true).length;
        return adminCount <= 1 && currentUserId === user.id;
      }
    }
  ];

  return (
    <AdminDSTable
      columns={columns}
      data={users}
      loading={loading}
      emptyMessage="No users found. Try adjusting your filters."
      actions={actions}
    />
  );
};
