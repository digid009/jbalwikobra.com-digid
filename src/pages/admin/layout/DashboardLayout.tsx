import React from 'react';
import { cn } from '../../../styles/standardClasses';

interface DashboardLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * DashboardLayout
 * Central wrapper enforcing horizontal max width, vertical rhythm, and responsive gutters.
 * Provides CSS vars for spacing scale consumed by section primitives.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ header, children, footer, className }) => {
  return (
    <div className={cn('w-full min-h-screen', className)}>
      {header}
      <main className="dashboard-shell">
        <div className="dashboard-container">
          {children}
        </div>
      </main>
      {footer}
    </div>
  );
};

export default DashboardLayout;
