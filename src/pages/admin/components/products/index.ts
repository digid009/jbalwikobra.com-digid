// Legacy form components
export * from './BasicInfoSection';
export * from './TierGameSection';
export * from './ImagesSection';
export * from './SettingsRentalSection';

// Modern modular components
// Removed legacy ProductCard / ProductsGrid exports after migration to ProductsTable
export { ProductsFilters } from './ProductsFilters';
export { ProductsManager } from './ProductsManager';
export { default } from './ProductsManager';
