import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side admin client (service role)
// This should ONLY be used in server-side/API contexts, never in frontend code
const serviceUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

let supabaseAdmin: SupabaseClient | null = null;

function looksLikePlaceholder(v: string) {
	return /^(YOUR_|your_|https:\/\/your-project|\$\{|<)/i.test(v);
}

try {
	// Check if we're in a browser environment - service role keys should never be used in browsers
	const isBrowser = typeof window !== 'undefined';
	
	if (!serviceUrl || !serviceKey) {
		if (!isBrowser) {
			// Only warn in server contexts where this should be configured
			console.warn('[SupabaseAdmin] Missing service config. Required environment variables:');
			console.warn('  - SUPABASE_URL or REACT_APP_SUPABASE_URL');
			console.warn('  - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
			console.warn('  Admin functionality requiring service role will not work.');
		}
	} else if (looksLikePlaceholder(serviceUrl) || looksLikePlaceholder(serviceKey)) {
		console.warn('[SupabaseAdmin] Environment variables contain placeholder values.');
		console.warn('  Please set actual values for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
	} else {
		// Only warn about browser usage if we're actually in a browser with service role key
		if (isBrowser && serviceKey.includes('service_role')) {
			console.error('[SupabaseAdmin] SECURITY WARNING: Service role key detected in browser context!');
			console.error('  Service role keys should NEVER be exposed to the browser.');
			console.error('  Please remove SUPABASE_SERVICE_ROLE_KEY from frontend environment variables.');
		} else {
			supabaseAdmin = createClient(serviceUrl, serviceKey, {
				auth: { autoRefreshToken: false, persistSession: false }
			});
			
			if (!isBrowser) {
				const keyType = serviceKey.includes('service_role') ? 'service role' : 'anon';
				console.log(`[SupabaseAdmin] Initialized with ${keyType} key`);
			}
		}
	}
} catch (e) {
	console.error('[SupabaseAdmin] Failed to initialize:', e);
	supabaseAdmin = null;
}

export { supabaseAdmin };
