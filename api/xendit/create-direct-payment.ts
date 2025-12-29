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

        // Upsert to avoid duplicates
        const { data, error } = await sb
          .from('orders')
          .upsert(orderPayload, { onConflict: 'client_external_id' })
          .select('id, customer_name, product_name, amount, status')
          .single();

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

    // Call Xendit Payment Request API (V3)
    // Using Payment Request API for direct payment methods
    const xenditPayload = {
      amount,
      currency,
      payment_method: {
        type: payment_method_id,
        reusability: 'ONE_TIME_USE'
      },
      customer,
      description: description || `Payment for ${external_id}`,
      reference_id: external_id,
      success_return_url: success_redirect_url,
      failure_return_url: failure_redirect_url,
      metadata: {
        order_id: createdOrder?.id || external_id
      }
    };

    console.log('[Direct Payment] Calling Xendit API...');

    const response = await fetch('https://api.xendit.co/payment_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
        'api-version': '2022-07-31'
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