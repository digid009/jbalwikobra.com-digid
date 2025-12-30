// Xendit Payment Links v2 API
// Documentation: https://developers.xendit.co/api-reference/#create-payment-link
// This is the primary payment endpoint - handles all payment methods

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY as string | undefined;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method_id: string;
  customer?: {
    given_names?: string;
    email?: string;
    mobile_number?: string;
  };
  description?: string;
  external_id: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  order?: {
    product_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_type?: 'purchase' | 'rental';
    amount: number;
    rental_duration?: string | null;
    user_id?: string | null;
  };
}

// Payment method mapping for Xendit Payment Links v2
const PAYMENT_METHODS: Record<string, string> = {
  // QRIS
  'qris': 'QRIS',
  // Virtual Accounts
  'bjb': 'BJB',
  'bni': 'BNI',
  'bri': 'BRI',
  'bsi': 'BSI',
  'cimb': 'CIMB',
  'mandiri': 'MANDIRI',
  'permata': 'PERMATA',
  // E-Wallets (without ID_ prefix for Payment Links v2)
  'shopeepay': 'SHOPEEPAY',
  'gopay': 'GOPAY',
  'dana': 'DANA',
  'linkaja': 'LINKAJA',
  'ovo': 'OVO',
  'astrapay': 'ASTRAPAY',
  'jeniuspay': 'JENIUSPAY',
  // Retail
  'indomaret': 'INDOMARET'
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!XENDIT_SECRET_KEY) {
    console.error('[Payment] Missing XENDIT_SECRET_KEY');
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  try {
    const {
      amount,
      currency = 'IDR',
      payment_method_id,
      customer,
      description,
      external_id,
      success_redirect_url,
      failure_redirect_url,
      order
    }: PaymentRequest = req.body;

    // Validate required fields
    if (!external_id || !amount || !payment_method_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'external_id, amount, and payment_method_id are required'
      });
    }

    console.log('[Payment] Creating payment link:', { 
      external_id, 
      amount, 
      payment_method: payment_method_id 
    });

    // Get Xendit channel code
    const methodKey = payment_method_id.toLowerCase();
    const channelCode = PAYMENT_METHODS[methodKey];
    
    if (!channelCode) {
      return res.status(400).json({
        error: 'Unsupported payment method',
        message: `Payment method '${payment_method_id}' is not supported`,
        supported_methods: Object.keys(PAYMENT_METHODS)
      });
    }

    // Create order in database if provided
    let createdOrder: any = null;
    if (order && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const orderData = {
          product_id: order.product_id || null,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          order_type: order.order_type || 'purchase',
          amount: order.amount,
          status: 'pending',
          payment_method: 'xendit',
          rental_duration: order.rental_duration || null,
          user_id: order.user_id || null,
          client_external_id: external_id,
        };

        // Check for existing order
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('client_external_id', external_id)
          .maybeSingle();

        if (existing) {
          const { data } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', existing.id)
            .select()
            .single();
          createdOrder = data;
          console.log('[Payment] Order updated:', existing.id);
        } else {
          const { data } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();
          createdOrder = data;
          console.log('[Payment] Order created:', data?.id);
        }
      } catch (err) {
        console.error('[Payment] Database error:', err);
      }
    }

    // Build Xendit Payment Links v2 payload
    const payload: any = {
      external_id,
      amount,
      description: description || 'Payment',
      currency,
      payment_methods: [channelCode]
    };

    // Add customer info
    if (customer) {
      payload.customer = {};
      if (customer.given_names) payload.customer.given_names = customer.given_names;
      if (customer.email) payload.customer.email = customer.email;
      if (customer.mobile_number) payload.customer.mobile_number = customer.mobile_number;
    }

    // Add redirect URLs
    if (success_redirect_url) payload.success_redirect_url = success_redirect_url;
    if (failure_redirect_url) payload.failure_redirect_url = failure_redirect_url;

    console.log('[Payment] Xendit payload:', JSON.stringify(payload, null, 2));

    // Call Xendit API
    const xenditResponse = await fetch('https://api.xendit.co/v2/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const xenditData = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error('[Payment] Xendit error:', xenditData);
      return res.status(xenditResponse.status).json({
        error: xenditData.message || 'Payment creation failed',
        details: xenditData
      });
    }

    console.log('[Payment] Payment link created:', xenditData.id);

    // Update order with Xendit payment ID
    if (createdOrder && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabase
          .from('orders')
          .update({ xendit_invoice_id: xenditData.id })
          .eq('id', createdOrder.id);
      } catch (err) {
        console.error('[Payment] Failed to update order with payment ID:', err);
      }
    }

    // Return standardized response
    return res.status(200).json({
      id: xenditData.id,
      status: xenditData.status,
      payment_url: xenditData.invoice_url || xenditData.url,
      invoice_url: xenditData.invoice_url || xenditData.url,
      payment_method: payment_method_id,
      amount: xenditData.amount,
      currency: xenditData.currency,
      external_id: xenditData.external_id
    });

  } catch (error: any) {
    console.error('[Payment] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    });
  }
}