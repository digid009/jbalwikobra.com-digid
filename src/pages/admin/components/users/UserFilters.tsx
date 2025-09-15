import React from 'react';
import { Search, User, Shield } from 'lucide-react';
import { AdminFilterPanel, FilterField } from '../ui';

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  totalUsers?: number;
  filteredUsers?: number;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  totalUsers,
  filteredUsers
}) => {
  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    switch (fieldId) {
      case 'search':
        onSearchChange(value as string);
        break;
      case 'role':
        onRoleFilterChange(value as string);
        break;
    }
  };

  const handleReset = () => {
    onSearchChange('');
    onRoleFilterChange('all');
  };

  const filterFields: FilterField[] = [
    {
      id: 'search',
      label: 'Search Users',
      type: 'text',
      placeholder: 'Search by name, email, phone, or ID...',
      value: searchTerm,
      onChange: (value) => handleFieldChange('search', value)
    },
    {
      id: 'role',
      label: 'Role Filter',
      type: 'select',
      value: roleFilter,
      options: [
        { value: 'all', label: 'All Users' },
        { value: 'admin', label: 'Admins Only' },
        { value: 'user', label: 'Regular Users' },
        { value: 'owner', label: 'Owners' },
        { value: 'superadmin', label: 'Super Admins' }
      ],
      onChange: (value) => handleFieldChange('role', value)
    }
  ];

  return (
    <AdminFilterPanel
      fields={filterFields}
      onReset={handleReset}
      collapsible={true}
      defaultCollapsed={false}
      resultCount={filteredUsers}
      totalCount={totalUsers}
    />
  );
};
