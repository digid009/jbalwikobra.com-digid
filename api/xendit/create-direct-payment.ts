import type { VercelRequest, VercelResponse } from '@vercel/node';

// Activated payment channels - based on your Xendit dashboard
const ACTIVATED_EWALLET_CHANNELS = {
  'shopeepay': 'SHOPEEPAY',
  'gopay': 'GOPAY',
  'dana': 'DANA',
  'linkaja': 'LINKAJA'
};

const ACTIVATED_VIRTUAL_ACCOUNT_CHANNELS = {
  'bjb': 'BJB',
  'bni': 'BNI', 
  'bri': 'BRI',
  'bsi': 'BSI',
  'cimb': 'CIMB',
  'mandiri': 'MANDIRI',
  'permata': 'PERMATA'
};

const ACTIVATED_RETAIL_CHANNELS = {
  'indomaret': 'INDOMARET'
};

const ACTIVATED_QR_CHANNELS = {
  'qris': 'QRIS'
};

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simple order creation function for direct payments
async function createOrderRecord(order: any, externalId: string, paymentMethodId: string) {
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
      // Store provider (not channel) in orders.payment_method to comply with schema ('xendit' | 'whatsapp')
      payment_method: 'xendit',
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
    
    // Check all activated channel types
    const isActivatedEwallet = Object.keys(ACTIVATED_EWALLET_CHANNELS).includes(paymentMethodLower);
    const isActivatedVA = Object.keys(ACTIVATED_VIRTUAL_ACCOUNT_CHANNELS).includes(paymentMethodLower);
    const isActivatedRetail = Object.keys(ACTIVATED_RETAIL_CHANNELS).includes(paymentMethodLower);
    const isActivatedQR = Object.keys(ACTIVATED_QR_CHANNELS).includes(paymentMethodLower);
    
    const isValidPaymentMethod = isActivatedEwallet || isActivatedVA || isActivatedRetail || isActivatedQR;
    
    if (!isValidPaymentMethod) {
      const allAvailableMethods = [
        ...Object.keys(ACTIVATED_EWALLET_CHANNELS),
        ...Object.keys(ACTIVATED_VIRTUAL_ACCOUNT_CHANNELS),
        ...Object.keys(ACTIVATED_RETAIL_CHANNELS),
        ...Object.keys(ACTIVATED_QR_CHANNELS)
      ];
      
      console.error(`[Xendit Direct Payment] Payment method '${payment_method_id}' is not activated on this account`);
      return res.status(400).json({ 
        error: `Payment method '${payment_method_id}' is not available. Please select from activated payment methods.`,
        available_methods: allAvailableMethods
      });
    }

    // Determine the appropriate Xendit endpoint based on payment method
    let endpoint = '';
    let payload: any = {};
    // Common metadata for webhook reconciliation (works for payment_requests and qr_codes)
    const meta = {
      client_external_id: external_id,
      product_id: order?.product_id || null,
      user_id: order?.user_id || null,
      order_type: order?.order_type || 'purchase',
      amount,
      customer_name: order?.customer_name || customer?.given_names || null,
      customer_email: order?.customer_email || customer?.email || null,
      customer_phone: order?.customer_phone || customer?.mobile_number || null,
      rental_duration: order?.rental_duration || null
    };

    if (isActivatedEwallet) {
      // E-Wallet payment using Payment Request API (Latest)
      endpoint = '/payment_requests';
      const xenditChannelCode = ACTIVATED_EWALLET_CHANNELS[paymentMethodLower as keyof typeof ACTIVATED_EWALLET_CHANNELS];
      
      // Different E-wallets require different channel properties
      let channelProperties: any = {};
      
      if (paymentMethodLower === 'shopeepay') {
        channelProperties = {
          success_redirect_url: success_redirect_url || 'https://jbalwikobra.com/success',
          failure_redirect_url: failure_redirect_url || 'https://jbalwikobra.com/failed'
        };
      } else if (paymentMethodLower === 'gopay') {
        channelProperties = {
          success_redirect_url: success_redirect_url || 'https://jbalwikobra.com/success',
          failure_redirect_url: failure_redirect_url || 'https://jbalwikobra.com/failed'
        };
      } else if (paymentMethodLower === 'dana') {
        channelProperties = {
          success_redirect_url: success_redirect_url || 'https://jbalwikobra.com/success',
          failure_redirect_url: failure_redirect_url || 'https://jbalwikobra.com/failed'
        };
      } else if (paymentMethodLower === 'linkaja') {
        channelProperties = {
          success_redirect_url: success_redirect_url || 'https://jbalwikobra.com/success',
          failure_redirect_url: failure_redirect_url || 'https://jbalwikobra.com/failed'
        };
      }
      
      payload = {
        reference_id: external_id,
        amount,
        currency,
        country: 'ID',
        payment_method: {
          type: 'EWALLET',
          ewallet: {
            channel_code: xenditChannelCode,
            channel_properties: channelProperties
          },
          reusability: 'ONE_TIME_USE'
        },
        description: description || 'Payment',
        metadata: meta
      };
    } else if (isActivatedVA) {
      // Virtual Account payment using Payment Request API (Latest)
      endpoint = '/payment_requests';
      const bankCode = ACTIVATED_VIRTUAL_ACCOUNT_CHANNELS[paymentMethodLower as keyof typeof ACTIVATED_VIRTUAL_ACCOUNT_CHANNELS];
      
      payload = {
        reference_id: external_id,
        amount,
        currency,
        country: 'ID',
        payment_method: {
          type: 'VIRTUAL_ACCOUNT',
          virtual_account: {
            channel_code: bankCode,
            channel_properties: {
              customer_name: (customer?.given_names || 'Customer').replace(/bank|bni|bri|mandiri|bca|bsi|cimb|permata|institution/gi, '').trim() || 'Customer',
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          },
          reusability: 'ONE_TIME_USE'
        },
        description: description || 'Payment',
        metadata: meta
      };
    } else if (isActivatedQR) {
      // QRIS payment - keep existing working endpoint
      endpoint = '/qr_codes';
      payload = {
        external_id,
        type: 'DYNAMIC',
        callback_url: 'https://jbalwikobra.com/api/xendit/webhook',
        amount,
        description: description || 'Payment',
        metadata: meta
      };
    } else if (isActivatedRetail) {
      // Retail outlet payment using Payment Request API (Latest)
      endpoint = '/payment_requests';
      const retailCode = ACTIVATED_RETAIL_CHANNELS[paymentMethodLower as keyof typeof ACTIVATED_RETAIL_CHANNELS];
      
      payload = {
        reference_id: external_id,
        amount,
        currency,
        country: 'ID',
        payment_method: {
          type: 'OVER_THE_COUNTER',
          over_the_counter: {
            channel_code: retailCode,
            channel_properties: {
              customer_name: (customer?.given_names || 'Customer').replace(/bank|bni|bri|mandiri|bca|bsi|cimb|permata|institution/gi, '').trim() || 'Customer',
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          },
          reusability: 'ONE_TIME_USE'
        },
        description: description || 'Payment',
        metadata: meta
      };
    }

    if (!endpoint) {
      return res.status(400).json({ 
        error: `Unsupported payment method: ${payment_method_id}` 
      });
    }

  // Create order record if order data provided
  const createdOrder = await createOrderRecord(order, external_id, payment_method_id);

    console.log('[Xendit Direct Payment] Making request to:', `${XENDIT_BASE_URL}${endpoint}`);
    console.log('[Xendit Direct Payment] Payload:', JSON.stringify(payload, null, 2));

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
    console.log('[Xendit Direct Payment] Response status:', response.status);
    console.log('[Xendit Direct Payment] Response data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('[Xendit Direct Payment] API Error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Payment creation failed',
        details: responseData,
        debug_info: {
          endpoint: `${XENDIT_BASE_URL}${endpoint}`,
          payment_method: payment_method_id,
          payload: payload
        }
      });
    }

    // Format response based on payment method type
    let formattedResponse: any = {
      id: responseData.id,
      status: responseData.status,
      external_id: responseData.reference_id || responseData.external_id || external_id,
      payment_method: {
        id: payment_method_id,
        type: getPaymentMethodType(payment_method_id)
      },
      amount,
      currency,
      created: responseData.created || new Date().toISOString(),
      expiry_date: responseData.expires_at || responseData.expiration_date
    };

    // Add method-specific fields for Payment Request API
    if (responseData.actions && responseData.actions.length > 0) {
      // Payment Request API - E-Wallet response
      const redirectAction = responseData.actions.find((action: any) => action.action === 'AUTH');
      if (redirectAction) {
        formattedResponse.payment_url = redirectAction.url;
        formattedResponse.action_type = redirectAction.action;
      }
    } else if (responseData.payment_method?.virtual_account) {
      // Payment Request API - Virtual Account response
      const va = responseData.payment_method.virtual_account;
      formattedResponse.account_number = va.channel_properties?.account_number;
      formattedResponse.bank_code = va.channel_code;
    } else if (responseData.payment_method?.over_the_counter) {
      // Payment Request API - Retail outlet response
      const otc = responseData.payment_method.over_the_counter;
      formattedResponse.payment_code = otc.channel_properties?.payment_code;
      formattedResponse.retail_outlet = otc.channel_code;
    } else if (responseData.qr_string) {
      // QRIS response (unchanged)
      formattedResponse.qr_string = responseData.qr_string;
      formattedResponse.qr_url = responseData.qr_string;
    } else if (responseData.account_number) {
      // Legacy Virtual Account response
      formattedResponse.account_number = responseData.account_number;
      formattedResponse.bank_code = responseData.bank_code;
    } else if (responseData.invoice_url) {
      // Invoice response (credit card)
      formattedResponse.payment_url = responseData.invoice_url;
    }

    // Store payment data in database for later retrieval
    await storePaymentData(formattedResponse, payment_method_id, order);

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

// Store payment data for later retrieval
async function storePaymentData(paymentData: any, paymentMethodId: string, order: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Store Payment] Skipping payment storage - missing Supabase config');
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store payment-specific data as JSON
    const paymentSpecificData: any = {};
    
    if (paymentData.qr_string) paymentSpecificData.qr_string = paymentData.qr_string;
    if (paymentData.qr_url) paymentSpecificData.qr_url = paymentData.qr_url;
    if (paymentData.account_number) paymentSpecificData.account_number = paymentData.account_number;
    if (paymentData.bank_code) paymentSpecificData.bank_code = paymentData.bank_code;
    if (paymentData.payment_url) paymentSpecificData.payment_url = paymentData.payment_url;
    if (paymentData.action_type) paymentSpecificData.action_type = paymentData.action_type;
    if (paymentData.payment_code) paymentSpecificData.payment_code = paymentData.payment_code;
    if (paymentData.retail_outlet) paymentSpecificData.retail_outlet = paymentData.retail_outlet;

    const paymentRecord = {
      xendit_id: paymentData.id,
      external_id: paymentData.external_id,
      payment_method: paymentMethodId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'IDR',
      status: paymentData.status,
      description: paymentData.description,
      payment_data: paymentSpecificData,
      expiry_date: paymentData.expiry_date,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('payments')
      .insert(paymentRecord);

    if (error) {
      console.error('[Store Payment] Database error:', error);
    } else {
      console.log('[Store Payment] Successfully stored payment data for:', paymentData.id);
    }

  } catch (error) {
    console.error('[Store Payment] Error:', error);
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
