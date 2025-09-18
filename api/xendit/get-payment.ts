import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try to fetch from payments table first
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('xendit_id', id)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') {
      console.error('[Get Payment] Database error:', paymentError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (paymentData) {
      console.log('[Get Payment] Found payment data with status:', paymentData.status);
      
      // Return the stored payment data
      return res.status(200).json({
        id: paymentData.xendit_id,
        payment_method: paymentData.payment_method || 'unknown',
        amount: paymentData.amount,
        currency: paymentData.currency || 'IDR',
        status: paymentData.status,
        external_id: paymentData.external_id,
        created: paymentData.created_at,
        description: paymentData.description,
        expiry_date: paymentData.expiry_date,
        
        // Payment method specific data (stored as JSON)
        qr_string: paymentData.payment_data?.qr_string,
        qr_url: paymentData.payment_data?.qr_url,
        account_number: paymentData.payment_data?.account_number,
        bank_code: paymentData.payment_data?.bank_code,
        payment_url: paymentData.payment_data?.payment_url,
        action_type: paymentData.payment_data?.action_type,
        payment_code: paymentData.payment_data?.payment_code,
        retail_outlet: paymentData.payment_data?.retail_outlet
      });
    }

    // If not in payments table, check orders table by xendit_invoice_id
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('xendit_invoice_id', id)
      .single();

    if (orderData && !orderError) {
      console.log('[Get Payment] Found order data with status:', orderData.status);
      
      // Convert order data to payment format for consistency
      const convertedStatus = orderData.status?.toUpperCase(); // Convert to uppercase for consistency
      console.log('[Get Payment] Converted status to:', convertedStatus);
      
      return res.status(200).json({
        id: orderData.xendit_invoice_id || id,
        payment_method: orderData.payment_channel || orderData.payment_method || 'unknown',
        amount: orderData.amount,
        currency: orderData.currency || 'IDR',
        status: convertedStatus,
        external_id: orderData.client_external_id || orderData.id,
        created: orderData.created_at,
        description: `Order ${orderData.id}`,
        expiry_date: orderData.expires_at,
        
        // Additional order data
        order_id: orderData.id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        paid_at: orderData.paid_at
      });
    }

    // If not found in database, try to fetch from Xendit directly
    const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
    if (!XENDIT_SECRET_KEY) {
      return res.status(500).json({ error: 'Payment service configuration error' });
    }

    // Try Payment Request API first
    try {
      const response = await fetch(`https://api.xendit.co/payment_requests/${id}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Format the response similar to our stored format
        const formattedData: any = {
          id: data.id,
          payment_method: data.payment_method?.type || 'unknown',
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          external_id: data.reference_id,
          created: data.created,
          description: data.description,
          expiry_date: data.expires_at
        };

        // Add method-specific data
        if (data.payment_method?.qr) {
          formattedData.qr_string = data.payment_method.qr.qr_string;
        }
        if (data.payment_method?.virtual_account) {
          formattedData.account_number = data.payment_method.virtual_account.channel_properties?.account_number;
          formattedData.bank_code = data.payment_method.virtual_account.channel_code;
        }
        if (data.actions?.length > 0) {
          const authAction = data.actions.find(action => action.action === 'AUTH');
          if (authAction) {
            formattedData.payment_url = authAction.url;
            formattedData.action_type = authAction.action;
          }
        }

        return res.status(200).json(formattedData);
      }
    } catch (err) {
      console.error('[Get Payment] Xendit API error:', err);
    }

    // Try legacy invoice API as fallback
    try {
      const response = await fetch(`https://api.xendit.co/v2/invoices/${id}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        return res.status(200).json({
          id: data.id,
          payment_method: 'invoice',
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          external_id: data.external_id,
          created: data.created,
          description: data.description,
          expiry_date: data.expiry_date,
          payment_url: data.invoice_url
        });
      }
    } catch (err) {
      console.error('[Get Payment] Invoice API error:', err);
    }

    return res.status(404).json({ error: 'Payment not found' });

  } catch (error) {
    console.error('[Get Payment] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
