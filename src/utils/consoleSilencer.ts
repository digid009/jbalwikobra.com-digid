/**
 * Silence noisy console logs in production, keep errors.
 */
export function silenceConsoleInProduction() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;

  const noop = () => {};
  // Keep console.error for visibility; silence others
  console.log = noop as any;
  console.info = noop as any;
  console.debug = noop as any;
  console.warn = noop as any;
}
