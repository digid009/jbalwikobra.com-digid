import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const diagnostic: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasReactAppSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
      method: req.method,
      query: req.query,
      body: req.body,
      userAgent: req.headers['user-agent']
    };

    // Test Supabase connection
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        diagnostic.supabaseTest = 'Failed - Missing environment variables';
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('users').select('count').limit(1);
        diagnostic.supabaseTest = error ? `Failed - ${error.message}` : 'Success';
      }
    } catch (error) {
      diagnostic.supabaseTest = `Failed - ${error.message}`;
    }

    // Test bcrypt import
    try {
      await import('bcryptjs');
      diagnostic.bcryptTest = 'Success';
    } catch (error) {
      diagnostic.bcryptTest = `Failed - ${error.message}`;
    }

    return res.status(200).json(diagnostic);
  } catch (error) {
    console.error('Auth test error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}
