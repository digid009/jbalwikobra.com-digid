import type { VercelRequest, VercelResponse } from '@vercel/node';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';

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
      failure_redirect_url
    } = req.body;

    // Validate required fields
    if (!amount || !payment_method_id || !external_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, payment_method_id, external_id' 
      });
    }

    // Determine the appropriate Xendit endpoint based on payment method
    let endpoint = '';
    let payload: any = {};

    const paymentMethodLower = payment_method_id.toLowerCase();

    if (['ovo', 'dana', 'gopay', 'linkaja', 'shopeepay'].includes(paymentMethodLower)) {
      // E-Wallet payment
      endpoint = '/ewallets/charges';
      payload = {
        reference_id: external_id,
        currency,
        amount,
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: paymentMethodLower.toUpperCase(),
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
