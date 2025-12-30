// Xendit Direct Payment API for specific payment methods (V3 API)
// This endpoint creates a payment link for a specific payment method (e-wallet, VA, QRIS, etc.)

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY as string | undefined;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

interface DirectPaymentRequest {
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
  order?: any;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!XENDIT_SECRET_KEY) {
    console.error('[Direct Payment] Missing XENDIT_SECRET_KEY');
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
    }: DirectPaymentRequest = req.body;

    console.log('[Direct Payment] Creating payment with method:', payment_method_id);

    // Create order in database if order data is provided
    let createdOrder: { id: string; customer_name: string; product_name: string; amount: number; status: string } | null = null;
    if (order && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const orderPayload: any = {
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
          client_external_id: external_id || null,
        };

        // Check if order already exists with this external_id
        const { data: existingOrder } = await sb
          .from('orders')
          .select('id, customer_name, product_name, amount, status')
          .eq('client_external_id', external_id)
          .maybeSingle();

        let data, error;
        
        if (existingOrder) {
          // Update existing order
          console.log('[Direct Payment] Updating existing order:', existingOrder.id);
          const updateResult = await sb
            .from('orders')
            .update(orderPayload)
            .eq('id', existingOrder.id)
            .select('id, customer_name, product_name, amount, status')
            .single();
          data = updateResult.data;
          error = updateResult.error;
        } else {
          // Create new order
          const insertResult = await sb
            .from('orders')
            .insert(orderPayload)
            .select('id, customer_name, product_name, amount, status')
            .single();
          data = insertResult.data;
          error = insertResult.error;
        }

        if (error) {
          console.error('[Direct Payment] Order creation error:', error);
        } else {
          createdOrder = data;
          console.log('[Direct Payment] Order created:', data.id);
        }
      } catch (dbError) {
        console.error('[Direct Payment] Database error:', dbError);
      }
    }

    // Map payment method ID to Xendit Payment Request API v3 format
    // Reference: https://docs.xendit.co/apidocs/create-payment-request
    const methodLower = payment_method_id.toLowerCase();

    // Inline payment method config (avoid cross-boundary imports in serverless)
    const PAYMENT_CONFIG: Record<string, { type: 'QR_CODE' | 'VIRTUAL_ACCOUNT' | 'EWALLET' | 'RETAIL_OUTLET'; code: string }> = {
      // QRIS
      qris: { type: 'QR_CODE', code: 'QRIS' },
      // Virtual accounts
      bjb: { type: 'VIRTUAL_ACCOUNT', code: 'BJB' },
      bni: { type: 'VIRTUAL_ACCOUNT', code: 'BNI' },
      bri: { type: 'VIRTUAL_ACCOUNT', code: 'BRI' },
      bsi: { type: 'VIRTUAL_ACCOUNT', code: 'BSI' },
      cimb: { type: 'VIRTUAL_ACCOUNT', code: 'CIMB' },
      mandiri: { type: 'VIRTUAL_ACCOUNT', code: 'MANDIRI' },
      permata: { type: 'VIRTUAL_ACCOUNT', code: 'PERMATA' },
      // E-wallets (Xendit expects ID_ prefix)
      shopeepay: { type: 'EWALLET', code: 'ID_SHOPEEPAY' },
      gopay: { type: 'EWALLET', code: 'ID_GOPAY' },
      dana: { type: 'EWALLET', code: 'ID_DANA' },
      linkaja: { type: 'EWALLET', code: 'ID_LINKAJA' },
      ovo: { type: 'EWALLET', code: 'ID_OVO' },
      astrapay: { type: 'EWALLET', code: 'ID_ASTRAPAY' },
      jeniuspay: { type: 'EWALLET', code: 'ID_JENIUSPAY' },
      // Retail outlets
      indomaret: { type: 'RETAIL_OUTLET', code: 'INDOMARET' }
    };

    const config = PAYMENT_CONFIG[methodLower];
    if (!config) {
      console.error('[Direct Payment] Unsupported payment method:', payment_method_id);
      return res.status(400).json({
        error: 'Unsupported payment method',
        message: 'Please choose a supported payment method',
        details: { payment_method_id }
      });
    }

    const channelCode = config.code;

    // Some bank codes are already in correct format; keep as-is for VA/OTC/QRIS
    // Build channel properties per type
    const channel_properties: Record<string, any> = {};

    if (config.type === 'VIRTUAL_ACCOUNT') {
      channel_properties.customer_name = customer?.given_names || 'Customer';
    }

    if (config.type === 'EWALLET') {
      if (success_redirect_url) channel_properties.success_return_url = success_redirect_url;
      if (failure_redirect_url) channel_properties.failure_return_url = failure_redirect_url;
      if (customer?.mobile_number) channel_properties.mobile_number = customer.mobile_number;
      if (['ovo'].includes(methodLower) && !customer?.mobile_number) {
        return res.status(400).json({
          error: 'Mobile number required for this e-wallet',
          message: 'Please provide mobile_number for the selected e-wallet',
          details: { payment_method_id }
        });
      }
    }

    if (config.type === 'RETAIL_OUTLET') {
      channel_properties.customer_name = customer?.given_names || 'Customer';
    }

    // Xendit Payment Request v3 API structure:
    // The payment_method object needs BOTH:
    // 1. type-specific nested object (qr_code, virtual_account, etc.) with channel_code
    // 2. Top-level channel_code (this is what the error is complaining about!)
    
    // Map type to the correct property name for the payload
    const typeToProperty: Record<string, string> = {
      'QR_CODE': 'qr_code',
      'VIRTUAL_ACCOUNT': 'virtual_account',
      'EWALLET': 'ewallet',
      'RETAIL_OUTLET': 'over_the_counter'
    };
    
    const propertyName = typeToProperty[config.type];
    const payloadType = config.type === 'RETAIL_OUTLET' ? 'OVER_THE_COUNTER' : config.type;
    
    // Build the nested payment method object
    const nestedPayload: any = {
      channel_code: channelCode
    };
    
    // Only include channel_properties if it has values
    if (Object.keys(channel_properties).length > 0) {
      nestedPayload.channel_properties = channel_properties;
    }
    
    // Build the payment method payload with BOTH channel_code locations
    const paymentMethodPayload: any = {
      type: payloadType,
      channel_code: channelCode,  // ← ADD THIS! Xendit needs it at top level too
      reusability: 'ONE_TIME_USE',
      [propertyName]: nestedPayload
    };

    // Validate the payload structure
    if (!paymentMethodPayload.channel_code) {
      console.error('[Direct Payment] ERROR: channel_code is missing from top-level payload!');
      console.error('[Direct Payment] channelCode:', channelCode);
      console.error('[Direct Payment] config:', config);
      return res.status(500).json({
        error: 'Payment configuration error',
        message: 'Failed to construct payment request',
        details: { type: config.type, channel_code: channelCode }
      });
    }
    
    if (!paymentMethodPayload[propertyName]?.channel_code) {
      console.error('[Direct Payment] ERROR: channel_code is missing from nested payload!');
      console.error('[Direct Payment] propertyName:', propertyName);
      console.error('[Direct Payment] nestedPayload:', nestedPayload);
      return res.status(500).json({
        error: 'Payment configuration error',
        message: 'Failed to construct nested payment request',
        details: { type: config.type, property: propertyName }
      });
    }

    console.log('[Direct Payment] Payment method payload:', JSON.stringify(paymentMethodPayload, null, 2));

    // Call Xendit Payment Request API v3
    const xenditPayload: any = {
      amount,
      currency,
      payment_method: paymentMethodPayload,
      description: description || `Payment for ${external_id}`,
      reference_id: external_id,
      metadata: {
        order_id: createdOrder?.id || external_id
      }
    };

    // Add customer if provided
    if (customer) {
      xenditPayload.customer = customer;
    }

    // Add return URLs for payment methods that support them
    if (success_redirect_url) {
      xenditPayload.success_return_url = success_redirect_url;
    }
    if (failure_redirect_url) {
      xenditPayload.failure_return_url = failure_redirect_url;
    }

    console.log('[Direct Payment] Final Xendit payload:', JSON.stringify(xenditPayload, null, 2));
    console.log('[Direct Payment] Payment method property check:', {
      propertyName,
      hasProperty: !!xenditPayload.payment_method[propertyName],
      hasChannelCode: !!xenditPayload.payment_method[propertyName]?.channel_code,
      channelCodeValue: xenditPayload.payment_method[propertyName]?.channel_code
    });
    console.log('[Direct Payment] Calling Xendit API...');

    const bodyString = JSON.stringify(xenditPayload);
    console.log('[Direct Payment] Request body length:', bodyString.length);
    console.log('[Direct Payment] Request body (raw):', bodyString);

    const response = await fetch('https://api.xendit.co/v3/payment_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
        'api-version': '2024-11-11'
      },
      body: bodyString
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Direct Payment] Xendit API error:', {
        status: response.status,
        data: responseData
      });
      return res.status(response.status).json({
        error: responseData.message || 'Payment creation failed',
        details: responseData,
        available_methods: responseData.errors
      });
    }

    console.log('[Direct Payment] Payment created successfully:', responseData.id);

    // Update order with Xendit payment ID if order was created
    if (createdOrder && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await sb
          .from('orders')
          .update({ xendit_invoice_id: responseData.id })
          .eq('id', createdOrder.id);
        
        console.log('[Direct Payment] Order updated with payment ID');
      } catch (updateError) {
        console.error('[Direct Payment] Failed to update order:', updateError);
      }
    }

    // Return payment details
    return res.status(200).json({
      id: responseData.id,
      status: responseData.status,
      payment_url: responseData.actions?.desktop_web_checkout_url || responseData.actions?.mobile_web_checkout_url,
      invoice_url: responseData.actions?.desktop_web_checkout_url || responseData.actions?.mobile_web_checkout_url,
      payment_method: payment_method_id,
      amount: responseData.amount,
      currency: responseData.currency,
      reference_id: responseData.reference_id
    });

  } catch (error: any) {
    console.error('[Direct Payment] Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error occurred'
    });
  }
}