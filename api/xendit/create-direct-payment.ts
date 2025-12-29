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

    // Canonical channel codes per Payment Request v3 (root-level channel_code)
    const channelMap: Record<string, { type: 'QR_CODE' | 'VIRTUAL_ACCOUNT' | 'EWALLET' | 'OVER_THE_COUNTER'; code: string; requiresPhone?: boolean }> = {
      // QRIS
      qris: { type: 'QR_CODE', code: 'QRIS' },
      // Virtual accounts
      bca: { type: 'VIRTUAL_ACCOUNT', code: 'BCA' },
      bni: { type: 'VIRTUAL_ACCOUNT', code: 'BNI' },
      bri: { type: 'VIRTUAL_ACCOUNT', code: 'BRI' },
      mandiri: { type: 'VIRTUAL_ACCOUNT', code: 'MANDIRI' },
      permata: { type: 'VIRTUAL_ACCOUNT', code: 'PERMATA' },
      cimb: { type: 'VIRTUAL_ACCOUNT', code: 'CIMB' },
      bsi: { type: 'VIRTUAL_ACCOUNT', code: 'BSI' },
      bjb: { type: 'VIRTUAL_ACCOUNT', code: 'BJB' },
      // E-wallets
      gopay: { type: 'EWALLET', code: 'ID_GOPAY' },
      ovo: { type: 'EWALLET', code: 'ID_OVO', requiresPhone: true },
      dana: { type: 'EWALLET', code: 'ID_DANA' },
      linkaja: { type: 'EWALLET', code: 'ID_LINKAJA' },
      shopeepay: { type: 'EWALLET', code: 'ID_SHOPEEPAY' },
      jeniuspay: { type: 'EWALLET', code: 'ID_JENIUSPAY' },
      astrapay: { type: 'EWALLET', code: 'ID_ASTRAPAY' },
      // Over the counter
      alfamart: { type: 'OVER_THE_COUNTER', code: 'ALFAMART' },
      indomaret: { type: 'OVER_THE_COUNTER', code: 'INDOMARET' },
    };

    const channel = channelMap[methodLower];
    if (!channel) {
      console.error('[Direct Payment] Unsupported payment method:', payment_method_id);
      return res.status(400).json({
        error: 'Unsupported payment method',
        message: 'Please choose a supported payment method',
        details: { payment_method_id }
      });
    }

    // Build channel properties per type
    const channel_properties: Record<string, any> = {};

    if (channel.type === 'VIRTUAL_ACCOUNT') {
      channel_properties.customer_name = customer?.given_names || 'Customer';
    }

    if (channel.type === 'EWALLET') {
      if (success_redirect_url) channel_properties.success_return_url = success_redirect_url;
      if (failure_redirect_url) channel_properties.failure_return_url = failure_redirect_url;
      if (customer?.mobile_number) channel_properties.mobile_number = customer.mobile_number;
      if (channel.requiresPhone && !customer?.mobile_number) {
        return res.status(400).json({
          error: 'Mobile number required for this e-wallet',
          message: 'Please provide mobile_number for the selected e-wallet',
          details: { payment_method_id }
        });
      }
    }

    if (channel.type === 'OVER_THE_COUNTER') {
      channel_properties.customer_name = customer?.given_names || 'Customer';
    }

    // According to Payment Request v3, channel_code and channel_properties are at the payment_method root
    const paymentMethodPayload: any = {
      type: channel.type,
      reusability: 'ONE_TIME_USE',
      channel_code: channel.code,
      channel_properties
    };

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

    console.log('[Direct Payment] Xendit payload:', JSON.stringify(xenditPayload, null, 2));
    console.log('[Direct Payment] Calling Xendit API...');

    const response = await fetch('https://api.xendit.co/v3/payment_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
        'api-version': '2024-11-11'
      },
      body: JSON.stringify(xenditPayload)
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