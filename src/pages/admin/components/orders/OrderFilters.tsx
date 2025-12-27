import React from 'react';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { AdminFilterPanel, FilterField } from '../ui';

interface OrderFiltersProps {
  searchTerm: string;
  statusFilter: string;
  orderTypeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onOrderTypeFilterChange: (value: string) => void;
  totalOrders?: number;
  filteredOrders?: number;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  statusFilter,
  orderTypeFilter,
  onSearchChange,
  onStatusFilterChange,
  onOrderTypeFilterChange,
  totalOrders,
  filteredOrders
}) => {
  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    switch (fieldId) {
      case 'search':
        onSearchChange(value as string);
        break;
      case 'status':
        onStatusFilterChange(value as string);
        break;
      case 'orderType':
        onOrderTypeFilterChange(value as string);
        break;
    }
  };

  const handleReset = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onOrderTypeFilterChange('all');
  };

  const filterFields: FilterField[] = [
    {
      id: 'search',
      label: 'Search Orders',
      type: 'text',
      placeholder: 'Search by ID, customer name, email, or phone...',
      value: searchTerm,
      onChange: (value) => handleFieldChange('search', value)
    },
    {
      id: 'status',
      label: 'Order Status',
      type: 'select',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      onChange: (value) => handleFieldChange('status', value)
    },
    {
      id: 'orderType',
      label: 'Order Type',
      type: 'select',
      value: orderTypeFilter,
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'rental', label: 'Rental' }
      ],
      onChange: (value) => handleFieldChange('orderType', value)
    }
  ];

  return (
    <AdminFilterPanel
      fields={filterFields}
      onReset={handleReset}
      collapsible={true}
      defaultCollapsed={false}
      resultCount={filteredOrders}
      totalCount={totalOrders}
    />
  );
};
