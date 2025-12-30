// Test WhatsApp service endpoint
// Usage: /api/test-whatsapp?phone=6281234567890&message=test

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow in development or with admin token
  const authHeader = req.headers.authorization;
  
  if (process.env.NODE_ENV === 'production' && !authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { DynamicWhatsAppService } = await import('./_utils/dynamicWhatsAppService.js');
    const wa = new DynamicWhatsAppService();
    
    // Get test parameters
    const phone = req.query.phone as string || '6285157768097';
    const message = req.query.message as string || `🧪 *TEST WHATSAPP SERVICE*

Halo! Ini adalah test message dari JB Alwikobra.

Jika Anda menerima pesan ini, berarti WhatsApp service berjalan dengan baik ✅

Timestamp: ${new Date().toISOString()}

Terima kasih! 🎮`;

    console.log('[Test WhatsApp] Sending test message to:', phone);
    
    // Get provider settings first
    const settings = await wa.getActiveProviderSettings();
    
    const result = {
      timestamp: new Date().toISOString(),
      settings_check: {
        has_settings: !!settings,
        provider: settings?.provider || 'none',
        base_url: settings?.base_url ? 'configured' : 'missing',
        api_key: settings?.api_key ? 'configured' : 'missing',
        session: settings?.session || 'none',
        is_active: settings?.is_active || false
      },
      test_params: {
        phone,
        message_length: message.length
      },
      send_result: null as any,
      error: null as any
    };

    if (!settings || !settings.is_active) {
      result.error = 'WhatsApp provider not configured or not active';
      return res.status(200).json(result);
    }

    // Try to send message
    const contextId = `test:${Date.now()}`;
    const sendResult = await wa.sendMessage({
      phone,
      message,
      contextType: 'test',
      contextId
    });

    result.send_result = sendResult;

    if (sendResult.success) {
      console.log('[Test WhatsApp] ✅ Message sent successfully');
      return res.status(200).json({
        ...result,
        status: 'success',
        message: 'WhatsApp message sent successfully!'
      });
    } else {
      console.error('[Test WhatsApp] ❌ Failed to send:', sendResult.error);
      return res.status(200).json({
        ...result,
        status: 'failed',
        message: 'Failed to send WhatsApp message'
      });
    }

  } catch (error: any) {
    console.error('[Test WhatsApp] Exception:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
