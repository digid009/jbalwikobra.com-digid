/**
 * Shared utilities for Supabase configuration and validation
 * Used by both frontend and backend code to ensure consistent validation
 */

/**
 * Check if a string looks like a placeholder value
 * Returns true if the value is:
 * - Empty or whitespace only
 * - Starts with common placeholder prefixes: YOUR_, your_, REPLACE_, replace_
 * - Contains template variable patterns: ${ or <
 * - Is a generic placeholder URL: https://your-project...
 */
export function looksLikePlaceholder(value: string): boolean {
  if (!value || value.trim() === '') {
    return true;
  }
  
  // Check for common placeholder patterns:
  // - YOUR_*, your_* : Common in .env.example files
  // - REPLACE_*, replace_* : Common replacement instructions
  // - https://your-project : Supabase placeholder URLs
  // - ${, < : Template variable patterns
  return /^(YOUR_|your_|https:\/\/your-project|\$\{|<|REPLACE_|replace_)/i.test(value);
}

/**
 * Get Supabase URL from environment with fallbacks
 * Checks both backend (SUPABASE_URL) and frontend (REACT_APP_SUPABASE_URL) variables
 */
export function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
}

/**
 * Get Supabase service role key from environment
 * Only checks backend variables - service keys should NEVER be in REACT_APP_ variables
 */
export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}

/**
 * Get Supabase anon key from environment
 * This is the public key safe to use in frontend code
 */
export function getSupabaseAnonKey(): string {
  return process.env.REACT_APP_SUPABASE_ANON_KEY || '';
}

/**
 * Minimum character length for service role keys
 * Service role keys are typically much longer than anon keys (>500 chars)
 */
const SERVICE_ROLE_KEY_MIN_LENGTH = 500;

/**
 * Check if a key is a service role key
 * Service role keys typically:
 * - Contain 'service_role' in metadata when decoded
 * - Are much longer than anon keys (see SERVICE_ROLE_KEY_MIN_LENGTH)
 * - Start with 'eyJ' (JWT format)
 */
export function isServiceRoleKey(key: string): boolean {
  if (!key) return false;
  
  // Primary check: contains service_role in the key
  if (key.includes('service_role')) {
    return true;
  }
  
  // Secondary check: JWT pattern and length
  if (key.startsWith('eyJ') && key.length > SERVICE_ROLE_KEY_MIN_LENGTH) {
    return true;
  }
  
  return false;
}

/**
 * Detect if code is running in browser context
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Validate Supabase configuration
 * Returns an object with validation results
 */
export interface ConfigValidation {
  isValid: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  urlIsPlaceholder: boolean;
  keyIsPlaceholder: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSupabaseConfig(url: string, key: string, context: 'frontend' | 'backend'): ConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const hasUrl = !!url && !looksLikePlaceholder(url);
  const hasKey = !!key && !looksLikePlaceholder(key);
  const urlIsPlaceholder = !!url && looksLikePlaceholder(url);
  const keyIsPlaceholder = !!key && looksLikePlaceholder(key);
  
  if (!url) {
    errors.push('SUPABASE_URL is not set');
  } else if (urlIsPlaceholder) {
    errors.push('SUPABASE_URL contains a placeholder value');
  }
  
  if (!key) {
    errors.push(`${context === 'backend' ? 'SUPABASE_SERVICE_ROLE_KEY' : 'REACT_APP_SUPABASE_ANON_KEY'} is not set`);
  } else if (keyIsPlaceholder) {
    errors.push('Supabase key contains a placeholder value');
  }
  
  // Security check for frontend
  if (context === 'frontend' && key && isServiceRoleKey(key)) {
    errors.push('SECURITY: Service role key detected in frontend context!');
    warnings.push('Service role keys should never be exposed to the browser');
    warnings.push('Remove REACT_APP_SUPABASE_SERVICE_KEY from your environment');
  }
  
  return {
    isValid: hasUrl && hasKey && errors.length === 0,
    hasUrl,
    hasKey,
    urlIsPlaceholder,
    keyIsPlaceholder,
    errors,
    warnings
  };
}

/**
 * Helper to ensure admin client is initialized
 * Throws a descriptive error if not
 */
export function ensureInitialized<T>(client: T | null, clientName: string): T {
  if (!client) {
    throw new Error(
      `${clientName} is not initialized. This usually means:\n` +
      '1. Required environment variables are missing\n' +
      '2. Environment variables contain placeholder values\n' +
      '3. Configuration validation failed\n\n' +
      'See SUPABASE_ADMIN_CONFIG.md for setup instructions.'
    );
  }
  return client;
}
