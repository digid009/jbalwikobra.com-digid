// Centralized reusable class strings for admin inputs & interactive controls (tokenized)
// Uses CSS variables from global/admin design system via Tailwind token aliases (see tailwind.config.js)

// Inputs and selects default sizing (consistent across admin)
export const adminInputBase = "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-token rounded-xl text-ds-text placeholder-ds-text-tertiary focus:outline-none focus:ring-2 focus:ring-ds-pink/20 focus:border-ds-pink transition-all duration-300";

export const adminSelectBase = "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-token rounded-xl text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-pink/20 focus:border-ds-pink transition-all duration-300 appearance-none";

// Useful variants
export const adminInputWithLeftIcon = `${adminInputBase} pl-12`;
export const adminInputNarrow = "w-full px-3 py-2 bg-[var(--bg-secondary)] border border-token rounded-lg text-ds-text placeholder-ds-text-tertiary focus:outline-none focus:ring-2 focus:ring-ds-pink/20 focus:border-ds-pink transition-all duration-300";

export const adminCheckboxBase = "rounded border-token text-ds-pink focus:ring-2 focus:ring-ds-pink bg-[var(--bg-secondary)]";

// Utility function for conditional classes
export function cx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
