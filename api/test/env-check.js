// Simple environment test for Vercel deployment
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown'
      },
      supabase: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlPreview: process.env.SUPABASE_URL ? 
          process.env.SUPABASE_URL.substring(0, 30) + '...' : 'missing'
      },
      xendit: {
        hasSecretKey: !!process.env.XENDIT_SECRET_KEY,
        hasCallbackToken: !!process.env.XENDIT_CALLBACK_TOKEN,
        keyPreview: process.env.XENDIT_SECRET_KEY ? 
          process.env.XENDIT_SECRET_KEY.substring(0, 20) + '...' : 'missing'
      },
      whatsapp: {
        hasApiKey: !!process.env.WHATSAPP_API_KEY,
        hasGroupId: !!process.env.WHATSAPP_GROUP_ID
      }
    };

    // Test Supabase connection
    if (envCheck.supabase.hasUrl && envCheck.supabase.hasServiceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Simple query test
        const { data, error } = await sb.from('products').select('count').limit(1);
        envCheck.supabase.connectionTest = error ? 
          { success: false, error: error.message } : 
          { success: true, hasData: !!data };
      } catch (e) {
        envCheck.supabase.connectionTest = { 
          success: false, 
          error: e.message 
        };
      }
    }

    // Test Xendit API key format
    if (envCheck.xendit.hasSecretKey) {
      const key = process.env.XENDIT_SECRET_KEY;
      envCheck.xendit.keyFormat = {
        startsWithXnd: key.startsWith('xnd_'),
        hasColon: key.includes(':'),
        length: key.length,
        isProduction: key.includes('production'),
        isDevelopment: key.includes('development')
      };
    }

    return res.status(200).json({
      status: 'Environment check completed',
      checks: envCheck,
      recommendations: {
        critical: [
          ...(envCheck.supabase.hasUrl ? [] : ['Add SUPABASE_URL']),
          ...(envCheck.supabase.hasServiceKey ? [] : ['Add SUPABASE_SERVICE_ROLE_KEY']),
          ...(envCheck.xendit.hasSecretKey ? [] : ['Add XENDIT_SECRET_KEY'])
        ],
        optional: [
          ...(envCheck.xendit.hasCallbackToken ? [] : ['Add XENDIT_CALLBACK_TOKEN']),
          ...(envCheck.whatsapp.hasApiKey ? [] : ['Add WHATSAPP_API_KEY'])
        ]
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Environment check failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
