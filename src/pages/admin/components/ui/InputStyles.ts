// Centralized reusable class strings for admin inputs & interactive controls (tokenized)
// Uses CSS variables from global/admin design system via Tailwind token aliases (see tailwind.config.js)

// Inputs and selects default sizing (consistent across admin) - Enhanced for better readability
export const adminInputBase = "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ds-pink/40 focus:border-ds-pink focus:bg-white/8 transition-all duration-300 font-medium";

export const adminSelectBase = "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-ds-pink/40 focus:border-ds-pink focus:bg-white/8 transition-all duration-300 appearance-none font-medium";

// Useful variants - Enhanced for better readability
export const adminInputWithLeftIcon = `${adminInputBase} pl-12`;
export const adminInputNarrow = "w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ds-pink/40 focus:border-ds-pink focus:bg-white/8 transition-all duration-300 font-medium";

export const adminCheckboxBase = "rounded border-white/20 text-ds-pink focus:ring-2 focus:ring-ds-pink/40 bg-white/5 font-medium";

// Utility function for conditional classes
export function cx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
