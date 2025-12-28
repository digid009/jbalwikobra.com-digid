import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  getSupabaseUrl, 
  getSupabaseServiceRoleKey, 
  validateSupabaseConfig,
  isBrowser 
} from '../utils/supabaseConfig';

// Server-side admin client (service role)
// This should ONLY be used in server-side/API contexts, never in frontend code
const serviceUrl = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();

let supabaseAdmin: SupabaseClient | null = null;

try {
  const validation = validateSupabaseConfig(serviceUrl, serviceKey, 'backend');
  
  if (!validation.isValid) {
    if (!isBrowser()) {
      // Only warn in server contexts where this should be configured
      console.warn('[SupabaseAdmin] Missing or invalid service configuration:');
      validation.errors.forEach(error => console.warn(`  - ${error}`));
      
      if (validation.errors.length > 0) {
        console.warn('[SupabaseAdmin] Required environment variables:');
        console.warn('  - SUPABASE_URL or REACT_APP_SUPABASE_URL');
        console.warn('  - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
        console.warn('[SupabaseAdmin] Admin functionality requiring service role will not work.');
      }
    }
  } else {
    // Show warnings if any (e.g., security warnings)
    validation.warnings.forEach(warning => {
      console.error(`[SupabaseAdmin] ⚠️ ${warning}`);
    });
    
    // Initialize the client
    supabaseAdmin = createClient(serviceUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    if (!isBrowser()) {
      console.log('[SupabaseAdmin] Initialized with service role key');
    }
  }
} catch (e) {
  console.error('[SupabaseAdmin] Failed to initialize:', e);
  supabaseAdmin = null;
}

export { supabaseAdmin };
