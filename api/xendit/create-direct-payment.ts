import type { VercelRequest, VercelResponse } from '@vercel/node';

// Activated payment channels - only include channels activated on your Xendit account
const ACTIVATED_EWALLET_CHANNELS = {
  'astrapay': 'ID_ASTRAPAY'
  // Add more as they get activated on your Xendit account
  // 'ovo': 'ID_OVO',
  // 'dana': 'ID_DANA', 
  // 'shopeepay': 'ID_SHOPEEPAY'
};

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simple order creation function for direct payments
async function createOrderRecord(order: any, externalId: string) {
  if (!order || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Direct Payment] Skipping order creation - missing order data or Supabase config');
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const orderPayload = {
      client_external_id: externalId,
      product_id: order.product_id || null,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_type: order.order_type || 'purchase',
      amount: order.amount,
      rental_duration: order.rental_duration || null,
      user_id: order.user_id || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .single();

    if (error) {
      console.error('[Direct Payment] Order creation error:', error);
      return null;
    }

    console.log('[Direct Payment] Order created successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('[Direct Payment] Order creation failed:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!XENDIT_SECRET_KEY) {
    console.error('[Xendit Direct Payment] Missing XENDIT_SECRET_KEY');
    return res.status(500).json({ error: 'Payment service configuration error' });
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
      order // Add order parameter for database tracking
    } = req.body;

    // Validate required fields
    if (!amount || !payment_method_id || !external_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, payment_method_id, external_id' 
      });
    }

    // Validate that the payment method is activated on the account
    const paymentMethodLower = payment_method_id.toLowerCase();
    
    // Check if it's an activated e-wallet
    const isActivatedEwallet = Object.keys(ACTIVATED_EWALLET_CHANNELS).includes(paymentMethodLower);
    
    if (!isActivatedEwallet) {
      console.error(`[Xendit Direct Payment] Payment method '${payment_method_id}' is not activated on this account`);
      return res.status(400).json({ 
        error: `Payment method '${payment_method_id}' is not available. Please select from activated payment methods.`,
        available_methods: Object.keys(ACTIVATED_EWALLET_CHANNELS)
      });
    }

    // Determine the appropriate Xendit endpoint based on payment method
    let endpoint = '';
    let payload: any = {};

    if (isActivatedEwallet) {
      // E-Wallet payment - use activated channel mapping
      endpoint = '/ewallets/charges';
      const xenditChannelCode = ACTIVATED_EWALLET_CHANNELS[paymentMethodLower as keyof typeof ACTIVATED_EWALLET_CHANNELS];
      
      payload = {
        reference_id: external_id,
        currency,
        amount,
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: xenditChannelCode,
        channel_properties: {
          mobile_number: customer?.mobile_number,
          success_redirect_url,
          failure_redirect_url
        },
        customer_id: customer?.email,
        basket: [
          {
            reference_id: external_id,
            name: description || 'Payment',
            category: 'digital_goods',
            currency,
            price: amount,
            quantity: 1
          }
        ]
      };
    } else if (['bca', 'bni', 'mandiri', 'bri', 'cimb', 'permata'].includes(paymentMethodLower)) {
      // Virtual Account payment
      endpoint = '/virtual_accounts';
      payload = {
        external_id,
        bank_code: paymentMethodLower.toUpperCase(),
        name: customer?.given_names || 'Customer',
        amount,
        description: description || 'Payment',
        is_closed: true,
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
    } else if (paymentMethodLower === 'qris') {
      // QRIS payment
      endpoint = '/qr_codes';
      payload = {
        external_id,
        type: 'DYNAMIC',
        callback_url: `${process.env.VERCEL_URL || 'https://jbalwikobra.com'}/api/xendit/webhook`,
        amount,
        description: description || 'Payment'
      };
    } else if (paymentMethodLower === 'credit_card') {
      // Credit Card - redirect to Xendit hosted payment page
      endpoint = '/invoices';
      payload = {
        external_id,
        amount,
        description: description || 'Payment',
        invoice_duration: 86400, // 24 hours
        customer: {
          given_names: customer?.given_names,
          email: customer?.email,
          mobile_number: customer?.mobile_number
        },
        customer_notification_preference: {
          invoice_created: ['email'],
          invoice_reminder: ['email'],
          invoice_paid: ['email']
        },
        success_redirect_url,
        failure_redirect_url,
        payment_methods: ['CREDIT_CARD', 'DEBIT_CARD']
      };
    } else {
      return res.status(400).json({ 
        error: `Unsupported payment method: ${payment_method_id}` 
      });
    }

    // Create order record if order data provided
    const createdOrder = await createOrderRecord(order, external_id);

    // Make request to Xendit
    const response = await fetch(`${XENDIT_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Xendit Direct Payment] API Error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Payment creation failed',
        details: responseData
      });
    }

    // Format response based on payment method type
    let formattedResponse: any = {
      id: responseData.id,
      status: responseData.status,
      external_id: responseData.external_id || external_id,
      payment_method: {
        id: payment_method_id,
        type: getPaymentMethodType(payment_method_id)
      },
      amount,
      currency,
      created: responseData.created || new Date().toISOString(),
      expiry_date: responseData.expiration_date || responseData.expires_at
    };

    // Add method-specific fields
    if (responseData.actions && responseData.actions.length > 0) {
      // E-Wallet response
      formattedResponse.payment_url = responseData.actions[0].url;
      formattedResponse.action_type = responseData.actions[0].action;
    } else if (responseData.account_number) {
      // Virtual Account response
      formattedResponse.account_number = responseData.account_number;
      formattedResponse.bank_code = responseData.bank_code;
    } else if (responseData.qr_string) {
      // QRIS response
      formattedResponse.qr_string = responseData.qr_string;
      formattedResponse.qr_url = responseData.qr_string;
    } else if (responseData.invoice_url) {
      // Invoice response (credit card)
      formattedResponse.payment_url = responseData.invoice_url;
    }

    console.log('[Xendit Direct Payment] Success:', {
      payment_method_id,
      external_id,
      amount,
      status: formattedResponse.status
    });

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('[Xendit Direct Payment] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getPaymentMethodType(paymentMethodId: string): string {
  const paymentMethodLower = paymentMethodId.toLowerCase();
  
  if (['ovo', 'dana', 'gopay', 'linkaja', 'shopeepay'].includes(paymentMethodLower)) {
    return 'EWALLET';
  } else if (['bca', 'bni', 'mandiri', 'bri', 'cimb', 'permata'].includes(paymentMethodLower)) {
    return 'VIRTUAL_ACCOUNT';
  } else if (paymentMethodLower === 'qris') {
    return 'QRIS';
  } else if (paymentMethodLower === 'credit_card') {
    return 'CREDIT_CARD';
  } else {
    return 'OTHER';
  }
}
