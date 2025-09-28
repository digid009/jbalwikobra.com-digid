import type { VercelRequest, VercelResponse } from '@vercel/node';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!XENDIT_SECRET_KEY) {
    console.error('[Create Fixed VA] Missing XENDIT_SECRET_KEY');
    return res.status(500).json({ error: 'Payment service configuration error' });
  }

  try {
    const {
      external_id,
      bank_code,
      name,
      expected_amount,
      is_closed = true,
      expiration_date,
      description
    } = req.body;

    // Validate required fields
    if (!external_id || !bank_code || !name || !expected_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: external_id, bank_code, name, expected_amount' 
      });
    }

    console.log('[Create Fixed VA] Creating Fixed Virtual Account:', {
      external_id,
      bank_code,
      name,
      expected_amount,
      is_closed
    });

    // Create Fixed Virtual Account
    const vaPayload = {
      external_id,
      bank_code,
      name,
      is_closed,
      expected_amount,
      description: description || `Payment for ${external_id}`,
      ...(expiration_date && { expiration_date })
    };

    console.log('[Create Fixed VA] Request payload:', JSON.stringify(vaPayload, null, 2));

    const response = await fetch(`${XENDIT_BASE_URL}/virtual_accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vaPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Create Fixed VA] Xendit API error:', response.status, error);
      return res.status(response.status).json({ 
        error: 'Failed to create Fixed Virtual Account',
        details: error
      });
    }

    const vaData = await response.json();
    console.log('[Create Fixed VA] ✅ Fixed VA created successfully:', vaData.id);
    console.log('[Create Fixed VA] 🔍 FULL VA DATA:', JSON.stringify(vaData, null, 2));

    // Store Fixed VA in database for future use
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        const { error: dbError } = await supabase
          .from('fixed_virtual_accounts')
          .upsert({
            xendit_va_id: vaData.id,
            external_id: vaData.external_id,
            bank_code: vaData.bank_code,
            account_number: vaData.account_number,
            name: vaData.name,
            expected_amount: vaData.expected_amount,
            status: vaData.status,
            expiration_date: vaData.expiration_date,
            is_closed: vaData.is_closed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'external_id' });

        if (dbError) {
          console.error('[Create Fixed VA] Database storage error:', dbError);
        } else {
          console.log('[Create Fixed VA] ✅ Stored in database');
        }
      } catch (dbError) {
        console.error('[Create Fixed VA] Database connection error:', dbError);
      }
    }

    return res.status(200).json({
      id: vaData.id,
      external_id: vaData.external_id,
      bank_code: vaData.bank_code,
      account_number: vaData.account_number,
      name: vaData.name,
      expected_amount: vaData.expected_amount,
      status: vaData.status,
      expiration_date: vaData.expiration_date,
      is_closed: vaData.is_closed,
      merchant_code: vaData.merchant_code,
      currency: vaData.currency || 'IDR'
    });

  } catch (error) {
    console.error('[Create Fixed VA] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}