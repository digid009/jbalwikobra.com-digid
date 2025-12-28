/**
 * Supabase Admin Client
 * 
 * IMPORTANT: This file should NOT contain service role keys in frontend code!
 * Service role keys must only be used on the server side.
 * 
 * For frontend admin operations, use the regular supabase client with proper RLS policies.
 * This file exists to prevent build errors but will not work in the browser context.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// DO NOT use service role key in frontend!
// This is just a placeholder to prevent build errors
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').replace(/[\r\n]/g, '');

// We explicitly do NOT use service role key in the frontend
// If you need admin operations, use proper RLS policies with the anon key
let supabaseAdmin: SupabaseClient | null = null;

// Log warning if accessed in browser
if (typeof window !== 'undefined') {
  console.warn(
    '⚠️ supabaseAdmin should not be used in browser context. ' +
    'Use regular supabase client with proper RLS policies instead.'
  );
}

// Export null for frontend - this should use API routes or RLS policies instead
export { supabaseAdmin };
