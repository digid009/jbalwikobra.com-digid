# Admin Components Architecture Guide

## Overview

This document describes the modern reusable admin UI component architecture implemented across all admin pages. All admin pages have been refactored to use consistent, typed components for better maintainability and user experience.

## Core Components

### AdminPageHeaderV2
**Purpose**: Standardized page headers with actions and breadcrumbs
**Required Props**:
- `title: string` - Page title
- `actions?: AdminHeaderAction[]` - Array of action buttons

**AdminHeaderAction Interface**:
```typescript
interface AdminHeaderAction {
  key: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon: LucideIcon; // Must be a Lucide React icon component
  loading?: boolean;
}
```

### AdminStatCard
**Purpose**: Display key metrics with icons and optional trends
**Required Props**:
- `title: string` - Stat title
- `value: string | number` - Main value to display
- `icon: LucideIcon` - Icon component (required)
- `iconColor: string` - Icon color (e.g., "text-blue-600")
- `iconBgColor: string` - Icon background color (e.g., "bg-blue-100")
- `trend?: { value: number; isPositive: boolean }` - Optional trend indicator

### AdminDataTable
**Purpose**: Standardized data tables with pagination and actions
**Required Props**:
- `columns: TableColumn<T>[]` - Column definitions
- `data: T[]` - Table data
- `currentPage: number` - Current page number
- `totalItems: number` - Total number of items
- `pageSize: number` - Items per page
- `onPageChange: (page: number) => void` - Page change handler
- `actions?: TableAction<T>[]` - Row actions

**TableColumn Interface**:
```typescript
interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}
```

**TableAction Interface**:
```typescript
interface TableAction<T> {
  key: string;
  label: string;
  icon: React.ReactNode; // Can be JSX icon element
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}
```

### AdminFilters
**Purpose**: Consistent filtering UI with search, dropdowns, and sorting
**Required Props**:
- `config: AdminFiltersConfig` - Filter configuration
- `onSearchChange: (search: string) => void`
- `onFilterChange: (filters: Record<string, any>) => void`
- `onSortChange: (sort: string, order: 'asc' | 'desc') => void`

**AdminFiltersConfig Interface**:
```typescript
interface AdminFiltersConfig {
  searchPlaceholder: string;
  filters: FilterOption[];
  sortOptions: SortOption[];
  showSortOrder?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

interface SortOption {
  value: string;
  label: string;
}
```

### StatusBadge
**Purpose**: Consistent status indicators
**Props**:
- `status: string` - Status value
- `variant?: 'success' | 'warning' | 'error' | 'info'` - Visual variant

## Implementation Pattern

### 1. State Management
Each admin page follows this state structure:
```typescript
// Filter state
const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState<Record<string, any>>({});
const [sortBy, setSortBy] = useState('created_at');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

// Pagination state
const [currentPage, setCurrentPage] = useState(1);
const [pageSize] = useState(10);

// Data state
const [items, setItems] = useState<ItemType[]>([]);
const [totalItems, setTotalItems] = useState(0);
const [loading, setLoading] = useState(false);

// Statistics state
const [stats, setStats] = useState({
  total: 0,
  // ... other relevant stats
});
```

### 2. Header Actions Pattern
```typescript
const headerActions: AdminHeaderAction[] = [
  {
    key: 'refresh',
    label: 'Refresh',
    onClick: loadData,
    icon: RefreshCw,
    loading: loading
  },
  {
    key: 'add',
    label: 'Add New',
    onClick: () => setShowDialog(true),
    variant: 'primary',
    icon: Plus
  }
];
```

### 3. Statistics Pattern
```typescript
const statisticsCards = [
  {
    title: 'Total Items',
    value: stats.total.toLocaleString(),
    icon: Package,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-100'
  },
  // ... more stats
];
```

### 4. Table Configuration
```typescript
const columns: TableColumn<ItemType>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    render: (status) => <StatusBadge status={status} />
  },
  {
    key: 'created_at',
    label: 'Created',
    render: (date) => new Date(date).toLocaleDateString()
  }
];

const actions: TableAction<ItemType>[] = [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="h-4 w-4" />,
    onClick: (item) => handleView(item)
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: (item) => handleEdit(item)
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (item) => handleDelete(item),
    variant: 'danger'
  }
];
```

### 5. Filter Configuration
```typescript
const filterConfig: AdminFiltersConfig = {
  searchPlaceholder: 'Search items...',
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'date',
      label: 'Date Range',
      type: 'date'
    }
  ],
  sortOptions: [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' }
  ],
  showSortOrder: true
};
```

## Refactored Pages

The following admin pages have been completely refactored to use this architecture:

### Core Management Pages
- ✅ **AdminProducts** - Product management with database-level filtering
- ✅ **AdminOrders** - Order management and tracking
- ✅ **AdminUsers** - User account management
- ✅ **AdminSettings** - System configuration (header only, keeps tabbed UI)

### Content Management Pages
- ✅ **AdminGameTitles** - Game title management
- ✅ **AdminFlashSales** - Flash sale configuration
- ✅ **AdminBanners** - Banner management
- ✅ **AdminPosts** - Content posting system
- ✅ **AdminReviewsManagement** - Review moderation and insights

### Dashboard
- ✅ **DashboardContent** - Main dashboard overview

## Key Benefits

1. **Consistency**: All pages use the same UI patterns and components
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Maintainability**: Reusable components reduce code duplication
4. **Performance**: Optimized components with proper state management
5. **Accessibility**: Built-in accessibility features in all components
6. **Responsive**: Mobile-first design system throughout

## Migration Notes

### From Legacy iOS Components
- `IOSButton` → `AdminPageHeaderV2` actions
- `IOSCard` → `AdminStatCard`
- Custom tables → `AdminDataTable`
- Manual filters → `AdminFilters`

### Database Integration
- All pages implement proper database-level filtering and pagination
- Search functionality hits the database rather than client-side filtering
- Proper error handling and loading states throughout

## Development Guidelines

1. Always use the typed interfaces for component props
2. Implement proper error boundaries and loading states
3. Follow the established state management patterns
4. Use database-level filtering for performance
5. Ensure all actions have appropriate icons from Lucide React
6. Test responsive behavior on mobile devices
7. Validate TypeScript compilation before deployment

## Support Components

- **RLSDiagnosticsBanner** - Security policy diagnostics
- **scrollToPaginationContent** - Smooth scroll utilities
- **cn** - Tailwind class name utility
- Various service layers for data fetching and mutations

## Build Requirements

- All components must pass TypeScript compilation
- No unused imports or legacy component references
- Proper module exports in index files
- CSS dependencies must be properly resolved
