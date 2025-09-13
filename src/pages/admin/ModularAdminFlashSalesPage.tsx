import React from 'react';
import { IOSContainer } from '../../components/ios/IOSDesignSystemV2';
import { RefactoredAdminFlashSalesManagement } from '../../components/admin/flash-sales';

/**
 * Modern Flash Sales Admin Page
 * 
 * Uses the refactored flash sales management system with:
 * - Unified component architecture
 * - Proper TypeScript interfaces
 * - Mobile-first responsive design
 * - iOS Design System V2 patterns
 */
const ModularAdminFlashSalesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative py-8">
        <IOSContainer>
          <RefactoredAdminFlashSalesManagement />
        </IOSContainer>
      </div>
    </div>
  );
};

export default ModularAdminFlashSalesPage;
