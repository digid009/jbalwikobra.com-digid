// Unified utility for conditional classNames after design system consolidation
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
