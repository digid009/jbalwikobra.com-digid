// Standardized CSS classes to reduce duplication and ensure consistency
export const standardClasses = {
  // Layout & Container
  container: {
    boxed: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full',
    withPadding: 'px-4 sm:px-6 lg:px-8',
  },

  // Flexbox layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
    row: 'flex items-center',
    rowGap2: 'flex items-center gap-2',
    rowGap3: 'flex items-center gap-3',
    rowGap4: 'flex items-center gap-4',
    colGap4: 'flex flex-col gap-4',
    colGap6: 'flex flex-col gap-6',
  },

  // Grid layouts
  grid: {
    cols2: 'grid grid-cols-2 gap-4',
    cols3: 'grid grid-cols-3 gap-4',
    cols4: 'grid grid-cols-4 gap-4',
    responsive2: 'grid grid-cols-2 gap-4 sm:gap-4',
    responsive3: 'grid grid-cols-2 gap-4 sm:gap-4 lg:grid-cols-3',
    responsive4: 'grid grid-cols-2 gap-4 sm:gap-4 lg:grid-cols-4',
    responsive6: 'grid grid-cols-2 gap-4 sm:gap-4 md:grid-cols-3 lg:grid-cols-6',
    responsiveAdmin: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  },

  // Spacing
  spacing: {
    section: 'space-y-6',
    sectionLarge: 'space-y-8',
    padding: {
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
      xl: 'p-8',
    },
    margin: {
      small: 'm-3',
      medium: 'm-4',
      large: 'm-6',
    },
  },

  // Buttons & Interactions
  button: {
    primary: 'px-4 py-2 rounded-lg bg-ios-accent text-white hover:bg-ios-accent/80 transition-colors',
    secondary: 'px-4 py-2 rounded-lg border border-ios-border text-ios-text hover:bg-ios-surface transition-colors',
    ghost: 'px-4 py-2 rounded-lg text-ios-text hover:bg-ios-surface-secondary transition-colors',
    destructive: 'px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors',
    large: 'px-6 py-3 rounded-xl font-semibold transition-all duration-200',
    touch: 'min-h-[44px] min-w-[44px]',
  },

  // Form inputs
  input: {
    base: 'w-full px-3 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent focus:border-transparent',
    search: 'w-full pl-12 pr-4 py-3 bg-ios-surface-secondary border border-ios-border rounded-2xl text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-ios-accent transition-all duration-300',
    textarea: 'w-full p-3 border border-ios-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ios-accent',
  },

  // Cards & Surfaces
  card: {
    base: 'bg-ios-surface border border-ios-border rounded-xl',
    elevated: 'bg-ios-surface border border-ios-border rounded-xl shadow-sm',
    interactive: 'bg-ios-surface border border-ios-border rounded-xl hover:bg-ios-surface/80 transition-colors',
    admin: 'bg-ios-surface border border-ios-border rounded-xl p-6 space-y-4',
  },

  // Navigation
  nav: {
    item: 'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
    itemActive: 'flex items-center space-x-2 px-3 py-2 rounded-lg bg-ios-accent text-white shadow-sm',
    itemHover: 'text-ios-text hover:bg-ios-surface-secondary',
  },

  // Status & States
  state: {
    loading: 'opacity-50 pointer-events-none',
    disabled: 'opacity-60 cursor-not-allowed',
    hidden: 'hidden',
    visible: 'block',
  },

  // Avatars & Icons
  avatar: {
    small: 'w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm',
    medium: 'w-10 h-10 rounded-full object-cover border border-ios-border',
    large: 'w-16 h-16 rounded-full object-cover border border-ios-border',
    gradient: 'rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center text-white font-semibold',
  },

  // Badges & Indicators
  badge: {
    notification: 'absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-5 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow ring-2 ring-white',
    status: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  },

  // Typography
  text: {
    heading: 'text-2xl font-bold text-ios-text',
    subheading: 'text-lg font-semibold text-ios-text',
    body: 'text-ios-text',
    caption: 'text-sm text-ios-text-secondary',
    muted: 'text-xs text-ios-text-secondary',
  },

  // Animation & Transitions
  animation: {
    fadeIn: 'transition-opacity duration-300',
    slideIn: 'transition-transform duration-300',
    scale: 'transition-transform duration-200 hover:scale-105',
    bounce: 'transition-transform duration-200 active:scale-95',
  },

  // Layout utilities
  layout: {
    fullHeight: 'min-h-screen',
    centerScreen: 'min-h-screen flex items-center justify-center',
    stickyTop: 'sticky top-0 z-50',
    absoluteFull: 'absolute inset-0',
    overlay: 'fixed inset-0 bg-black/50 z-50',
  },

  // Responsive utilities
  responsive: {
    hideOnMobile: 'hidden md:block',
    showOnMobile: 'block md:hidden',
    stackOnMobile: 'flex flex-col md:flex-row',
    centerOnMobile: 'text-center md:text-left',
  },
} as const;

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common component class builders
export const buildButtonClass = (
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' = 'primary',
  size: 'small' | 'medium' | 'large' = 'medium',
  disabled = false
) => {
  const baseClasses = standardClasses.button[variant];
  const sizeClasses = size === 'large' ? standardClasses.button.large : '';
  const touchClasses = standardClasses.button.touch;
  const stateClasses = disabled ? standardClasses.state.disabled : '';
  
  return cn(baseClasses, sizeClasses, touchClasses, stateClasses);
};

export const buildCardClass = (
  variant: 'base' | 'elevated' | 'interactive' | 'admin' = 'base',
  padding = true
) => {
  const baseClasses = standardClasses.card[variant];
  const paddingClasses = padding && variant !== 'admin' ? standardClasses.spacing.padding.medium : '';
  
  return cn(baseClasses, paddingClasses);
};

export const buildInputClass = (
  type: 'base' | 'search' | 'textarea' = 'base',
  responsive = true
) => {
  const baseClasses = standardClasses.input[type];
  const responsiveClasses = responsive ? 'text-sm lg:text-base' : '';
  
  return cn(baseClasses, responsiveClasses);
};
