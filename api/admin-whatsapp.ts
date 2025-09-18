import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Shared helpers
function respond(res: VercelResponse, status: number, body: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(body));
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false }});
}

async function getActiveProvider(supabase: any) {
  const { data, error } = await supabase
    .from('whatsapp_providers')
    .select('*')
    .eq('is_active', true)
    .order('name')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sb = getSupabase();
    // Development fallback: allow local UI testing without real Supabase credentials
    if (!sb && process.env.NODE_ENV !== 'production') {
      const devProvider = {
        id: 'dev-mock',
        name: 'dev-mock',
        display_name: 'Dev Mock Provider',
        settings: { default_group_id: 'DEV-GROUP-ID' }
      } as const;

      if (req.method === 'GET') {
        return respond(res, 200, devProvider);
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { default_group_id, group_configurations, settings: newSettings } = body;
        const merged = {
          ...devProvider,
          settings: {
            ...devProvider.settings,
            ...(default_group_id !== undefined ? { default_group_id: default_group_id || null } : {}),
            ...(group_configurations !== undefined ? { group_configurations: group_configurations || {} } : {}),
            ...(newSettings && typeof newSettings === 'object' ? newSettings : {})
          }
        };
        return respond(res, 200, { success: true, provider: merged, dev: true });
      }
      return respond(res, 405, { error: 'method_not_allowed' });
    }
    if (!sb) return respond(res, 500, { error: 'supabase_not_configured' });

    if (req.method === 'GET') {
      // Return active provider and settings
      const provider = await getActiveProvider(sb);
      if (!provider) return respond(res, 404, { error: 'no_active_provider' });
      return respond(res, 200, {
        id: provider.id,
        name: provider.name,
        display_name: provider.display_name,
        settings: provider.settings || {}
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { default_group_id, group_configurations, settings: newSettings } = body;
      const provider = await getActiveProvider(sb);
      if (!provider) return respond(res, 404, { error: 'no_active_provider' });

      const settings = { ...(provider.settings || {}) };
      if (default_group_id !== undefined) settings.default_group_id = default_group_id || null;
      if (group_configurations !== undefined) settings.group_configurations = group_configurations || {};
      if (newSettings && typeof newSettings === 'object') Object.assign(settings, newSettings);

      const { data, error } = await sb
        .from('whatsapp_providers')
        .update({ settings })
        .eq('id', provider.id)
        .select('id,name,display_name,settings')
        .maybeSingle();
      if (error) return respond(res, 400, { error: error.message || 'update_failed' });
      return respond(res, 200, { success: true, provider: data });
    }

    return respond(res, 405, { error: 'method_not_allowed' });
  } catch (e: any) {
    console.error('[admin-whatsapp] error', e);
    return respond(res, 500, { error: 'internal_error', message: e.message });
  }
}
