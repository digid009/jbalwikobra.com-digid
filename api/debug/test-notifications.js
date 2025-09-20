// Test endpoint for debugging notifications
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Debug] Test notification endpoint called');

  // Check environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('[Debug] Environment check:');
  console.log('- SUPABASE_URL:', SUPABASE_URL ? 'Set ✓' : 'Missing ❌');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Set ✓' : 'Missing ❌');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      hasUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    });
  }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const testNotification = {
      type: 'new_order',
      title: 'Debug Test Notification',
      message: 'Testing notification creation from API endpoint',
      order_id: null, // Use null instead of invalid UUID
      customer_name: 'Debug Customer',
      product_name: 'Debug Product',
      amount: 50000,
      is_read: false,
      metadata: {
        priority: 'normal',
        category: 'order',
        debug: true,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    console.log('[Debug] Attempting to insert notification:', testNotification);

    const { data, error } = await sb
      .from('admin_notifications')
      .insert(testNotification)
      .select('*')
      .single();

    if (error) {
      console.error('[Debug] Insert failed:', error);
      return res.status(500).json({ 
        error: 'Failed to create notification',
        details: error,
        payload: testNotification
      });
    }

    console.log('[Debug] Insert successful:', data);

    // Test querying to make sure RLS allows reading
    const { data: queryData, error: queryError } = await sb
      .from('admin_notifications')
      .select('*')
      .eq('id', data.id);

    if (queryError) {
      console.error('[Debug] Query failed:', queryError);
      return res.status(200).json({
        success: true,
        created: data,
        queryError: queryError,
        message: 'Notification created but query failed (possible RLS issue)'
      });
    }

    return res.status(200).json({
      success: true,
      created: data,
      queried: queryData,
      message: 'Notification created and queried successfully'
    });

  } catch (err) {
    console.error('[Debug] Unexpected error:', err);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: err.message,
      stack: err.stack
    });
  }
};
