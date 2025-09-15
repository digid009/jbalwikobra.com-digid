// Admin UI Components - Reusable components following AdminProducts pattern

// Original admin components
export { AdminPageHeader } from './AdminPageHeader';
export { AdminFilterPanel } from './AdminFilterPanel';
export { AdminDataTable } from './AdminDataTable';
export { AdminStats } from './AdminStats';
export { AdminModal, ModalActions } from './AdminModal';

// New reusable admin components
export { AdminStatCard } from './AdminStatCard';
export { AdminFilters } from './AdminFilters';
export { AdminTable } from './AdminTable';
export { AdminPageHeader as AdminPageHeaderV2 } from './AdminPageHeaderComponent';
export { AdminBadge, StatusBadge, PaymentBadge } from './AdminBadge';

// Input styles for consistency
export * from './InputStyles';

// Types for common use cases
export type { TableColumn, TableAction } from './AdminDataTable';
export type { FilterField } from './AdminFilterPanel';
export type { StatItem } from './AdminStats';

// New component types
export type { FilterOption, SortOption, AdminFiltersConfig } from './AdminFilters';
export type { TableColumn as TableColumnV2, TableAction as TableActionV2 } from './AdminTable';
export type { PageHeaderAction } from './AdminPageHeaderComponent';
export type { BadgeProps } from './AdminBadge';
