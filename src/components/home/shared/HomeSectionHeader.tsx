import React from 'react';
import { Link } from 'react-router-dom';

interface ActionLink {
  to: string;
  label: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  action?: ActionLink;
  align?: 'left' | 'center';
  className?: string;
  padX?: boolean;
  size?: 'sm' | 'md' | 'lg'; // affects title font & spacing
  variant?: 'default' | 'subtle' | 'accent'; // potential style theme hook
  eyebrow?: string; // optional small label above title
}

/**
 * HomeSectionHeader
 * Reusable header block for home page sections to reduce duplication.
 * - Consistent spacing, typography, and action link styling.
 */
const HomeSectionHeader: React.FC<Props> = ({
  title,
  subtitle,
  action,
  align = 'left',
  className = '',
  padX = true,
  size = 'md',
  variant = 'default',
  eyebrow,
}) => {
  const alignment = align === 'center' ? 'text-center justify-center' : 'justify-between';

  const sizeMap = {
    sm: 'text-lg mb-1',
    md: 'text-xl mb-1',
    lg: 'text-2xl mb-2',
  } as const;

  const variantClasses = {
    default: 'text-white',
    subtle: 'text-white/90',
    accent: 'bg-gradient-to-r from-pink-400 to-fuchsia-300 bg-clip-text text-transparent',
  } as const;

  const titleClasses = `${sizeMap[size]} font-bold tracking-wide ${variantClasses[variant]}`;

  return (
    <div className={(padX ? 'px-4 ' : '') + `mb-6 flex ${alignment} items-end gap-4 flex-wrap ${className}`}>
      <div className={align === 'center' ? 'w-full' : ''}>
        {eyebrow && <div className="text-[11px] uppercase tracking-wider text-tertiary mb-1 font-medium">{eyebrow}</div>}
        <h2 className={titleClasses}>{title}</h2>
        {subtitle && <p className="text-tertiary text-sm max-w-prose">{subtitle}</p>}
      </div>
      {action && align !== 'center' && (
        <Link
          to={action.to}
          aria-label={action.ariaLabel || action.label}
          className="flex items-center space-x-1 text-secondary hover:text-pink-300 transition-colors text-sm font-medium rounded-full px-4 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60"
        >
          <span>{action.label}</span>
          {action.icon}
        </Link>
      )}
    </div>
  );
};

export default React.memo(HomeSectionHeader);
