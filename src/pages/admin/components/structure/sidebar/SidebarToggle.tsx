import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ 
  collapsed, 
  onToggle 
}) => {
  if (!collapsed) return null;

  return (
    <div className="flex justify-center mb-stack-lg">
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-sm hover:bg-neutral-700/40"
        >
        <ChevronRight className="w-5 h-5 text-ds-text-secondary" />
              </button>
    </div>
  );
};
