import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-none m-4';
      default:
        return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`w-full ${getSizeClasses()} max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200`}
      >
  <div className="dashboard-data-panel padded rounded-xl p-stack-lg surface-glass-lg flex flex-col max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-stack-lg border-b border-surface-tint-gray/30 flex-shrink-0">
            <h2 className="heading-lg text-white">{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm text-surface-tint-gray hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-stack-lg">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center justify-end gap-cluster-sm p-stack-lg border-t border-surface-tint-gray/30 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Preset action configurations for common use cases
export const ModalActions = {
  Save: ({ onSave, onCancel, loading = false }: {
    onSave: () => void;
    onCancel: () => void;
    loading?: boolean;
  }) => (
    <>
  <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
  <button className="btn btn-primary" onClick={onSave} disabled={loading}>Save</button>
    </>
  ),

  Delete: ({ onDelete, onCancel, loading = false }: {
    onDelete: () => void;
    onCancel: () => void;
    loading?: boolean;
  }) => (
    <>
  <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
  <button className="btn btn-primary bg-red-500 hover:bg-red-600" onClick={onDelete} disabled={loading}>Delete</button>
    </>
  ),

  Confirm: ({ onConfirm, onCancel, loading = false, confirmText = "Confirm" }: {
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmText?: string;
  }) => (
    <>
  <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
  <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>{confirmText}</button>
    </>
  )
};
