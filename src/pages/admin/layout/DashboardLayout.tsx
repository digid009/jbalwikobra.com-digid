import React from 'react';
import { cn } from '../../../utils/cn';
import FloatingNotifications from '../FloatingNotifications';
import ModernFooter from '../../../components/ModernFooter';

interface DashboardLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  /** Optional custom footer override. Jika tidak diberikan akan memakai ModernFooter */
  footer?: React.ReactNode;
  className?: string;
  /** if true, remove max-width constraint */
  fullWidth?: boolean;
  /** Sembunyikan footer (misal untuk halaman fullscreen seperti canvas, editor, dsb) */
  showFooter?: boolean;
}

/**
 * DashboardLayout
 * Central wrapper enforcing horizontal max width, vertical rhythm, and responsive gutters.
 * Provides CSS vars for spacing scale consumed by section primitives.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  children,
  footer,
  className,
  fullWidth,
  showFooter = true,
}) => {
  return (
    <div className={cn('w-full min-h-screen flex flex-col', className)}>
      {header}
      <main className="dashboard-shell pt-16 flex-1">
        <div className={cn('dashboard-container', fullWidth && 'max-w-none')}>
          {children}
        </div>
      </main>
      {showFooter && (footer ?? <ModernFooter />)}
      {/* FloatingNotifications - muncul di semua halaman admin */}
      <FloatingNotifications />
    </div>
  );
};

export default DashboardLayout;
