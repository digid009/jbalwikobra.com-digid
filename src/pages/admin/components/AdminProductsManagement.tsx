import React from 'react';
import { DashboardSection } from '../layout/DashboardPrimitives';
import ProductsManager from './products/ProductsManager';

export const AdminProductsManagement: React.FC = () => {
  return (
    <DashboardSection>
      <ProductsManager />
    </DashboardSection>
  );
};
