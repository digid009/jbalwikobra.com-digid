import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update the list_groups_method from GET to POST for Woo-WA
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        UPDATE whatsapp_providers 
        SET settings = jsonb_set(
            settings,
            '{list_groups_method}',
            '"GET"'
        )
        WHERE name = 'woo-wa'
        RETURNING name, settings->'list_groups_method' as method;
      `
    });

    if (error) {
      // Try direct SQL execution if RPC doesn't work
      const directResult = await supabase
        .from('whatsapp_providers')
        .update({
          settings: {
            supports_async: true,
            supports_media: true,
            supports_groups: true,
            webhook_support: true,
            default_group_id: null,
            group_name_field: "name",
            groups_array_field: "results",
            list_groups_method: "GET", // Changed back to GET with body
            max_message_length: 4096,
            group_id_field_name: "group_id", 
            group_send_endpoint: "/send_message_group_id",
            list_groups_endpoint: "/get_group_id",
            list_groups_auth_mode: "body"
          }
        })
        .eq('name', 'woo-wa')
        .select();

      if (directResult.error) {
        return res.status(500).json({ 
          error: 'Failed to update provider settings',
          details: directResult.error.message
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Updated list_groups_method to GET',
        data: directResult.data
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Updated list_groups_method to POST',
      data
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
