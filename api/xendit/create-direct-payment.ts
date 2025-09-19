import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getActivatedPaymentChannels, getXenditChannelCode } from '../_config/paymentChannels.js';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use shared server config (no imports from src/)

// Simple order creation function for direct payments
const SITE_URL = process.env.SITE_URL || process.env.REACT_APP_SITE_URL || 'https://www.jbalwikobra.com';

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
    console.error('[Xendit V3 Payment] Missing XENDIT_SECRET_KEY');
    return res.status(500).json({ error: 'Payment service configuration error' });
  }

  try {
    console.log('[Xendit V3 Payment] Starting payment request processing');
    
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
    } = req.body;

    // Validate required fields
    if (!amount || !payment_method_id || !external_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, payment_method_id, external_id' 
      });
    }

    // Get activated payment channels
  const activatedChannels = getActivatedPaymentChannels();
    const paymentChannel = activatedChannels.find(channel => channel.id === payment_method_id);
    
    if (!paymentChannel || !paymentChannel.available) {
      const availableMethods = activatedChannels
        .filter(channel => channel.available)
        .map(channel => channel.id);
      
      console.error(`[Xendit V3 Payment] Payment method '${payment_method_id}' is not activated`);
      return res.status(400).json({ 
        error: `Payment method '${payment_method_id}' is not available. Please select from activated payment methods.`,
        available_methods: availableMethods
      });
    }

    // Check amount limits
  if (amount < (paymentChannel as any).min_amount || amount > (paymentChannel as any).max_amount) {
      return res.status(400).json({
    error: `Amount ${amount} is outside valid range for ${paymentChannel.name}. Min: ${(paymentChannel as any).min_amount}, Max: ${(paymentChannel as any).max_amount}`
      });
    }

    // Create Xendit Payment Request payload - Use different APIs for different channel types
    const xenditChannelCode = getXenditChannelCode(payment_method_id);
    
    // Set expiry to 24 hours from now
    const requestExpiryDate = new Date();
    requestExpiryDate.setHours(requestExpiryDate.getHours() + 24);
    const expiryIsoString = requestExpiryDate.toISOString();
    
    let apiEndpoint: string;
    let requestPayload: any;
    let apiVersion = '2024-11-11';

    // Use different API endpoints based on payment method type
    if (paymentChannel.type === 'VIRTUAL_ACCOUNT') {
      // For Virtual Accounts, use the Invoice API which is more reliable and flexible
      apiEndpoint = `${XENDIT_BASE_URL}/v2/invoices`;
      apiVersion = '2018-05-15'; // Stable Invoice API version
      
      requestPayload = {
        external_id: external_id,
        amount: amount,
        description: description || `Payment for ${order?.product_name || 'product'}`,
        invoice_duration: 86400, // 24 hours
        customer: {
          given_names: order?.customer_name || customer?.given_names || 'Customer',
          mobile_number: customer?.mobile_number || '+62000000000',
          email: customer?.email || 'customer@example.com'
        },
        payment_methods: [xenditChannelCode], // Specify bank for VA
        currency: currency,
        should_send_email: false,
        success_redirect_url: success_redirect_url || `${SITE_URL}/payment-success?external_id=${external_id}`,
        failure_redirect_url: failure_redirect_url || `${SITE_URL}/payment-failed?external_id=${external_id}`
      };
      
      console.log('[Xendit Invoice Payment] Using V2 Invoice API for Virtual Account');
      console.log('[Xendit Invoice Payment] Bank Code being sent:', xenditChannelCode);
      console.log('[Xendit Invoice Payment] Payment Method ID:', payment_method_id);
      
    } else if (paymentChannel.type === 'QRIS' || paymentChannel.type === 'EWALLET') {
      // QRIS and E-Wallets use the V3 Payment Requests API
      apiEndpoint = `${XENDIT_BASE_URL}/v3/payment_requests`;
      
      requestPayload = {
        reference_id: external_id,
        type: "PAY",
        country: "ID", 
        currency: currency,
        request_amount: amount,
        capture_method: "AUTOMATIC",
        channel_code: xenditChannelCode,
        channel_properties: {
          success_return_url: success_redirect_url || `${SITE_URL}/payment-status?status=success`,
          failure_return_url: failure_redirect_url || `${SITE_URL}/payment-status?status=failed`
        },
        webhook: {
          url: `${SITE_URL}/api/xendit/webhook`
        },
        description: description || `Payment for ${order?.product_name || 'product'}`,
        expiry_date: expiryIsoString,
        expires_at: expiryIsoString,
        metadata: {
          client_external_id: external_id,
          product_id: order?.product_id || null,
          user_id: order?.user_id || null,
          order_type: order?.order_type || 'purchase',
          customer_name: order?.customer_name || customer?.given_names || null,
          customer_email: order?.customer_email || customer?.email || null,
          customer_phone: order?.customer_phone || customer?.mobile_number || null,
          rental_duration: order?.rental_duration || null,
          amount: amount.toString(),
          requested_expiry: expiryIsoString
        }
      };
      
      console.log('[Xendit V3 Payment] Using V3 Payment Requests API for QRIS/E-Wallet');
      
    } else if (paymentChannel.type === 'OVER_THE_COUNTER') {
      // Over-the-counter payments use V2 API
      apiEndpoint = `${XENDIT_BASE_URL}/v2/payment_requests`;
      apiVersion = '2022-07-31';
      
      requestPayload = {
        reference_id: external_id,
        amount: amount,
        currency: currency,
        channel_code: xenditChannelCode,
        channel_properties: {
          customer_name: order?.customer_name || customer?.given_names || 'Customer',
          success_return_url: success_redirect_url || `${SITE_URL}/payment-status?status=success`,
          failure_return_url: failure_redirect_url || `${SITE_URL}/payment-status?status=failed`
        },
        webhook: {
          url: `${SITE_URL}/api/xendit/webhook`
        },
        description: description || `Payment for ${order?.product_name || 'product'}`,
        expires_at: expiryIsoString,
        metadata: {
          client_external_id: external_id,
          product_id: order?.product_id || null,
          user_id: order?.user_id || null,
          order_type: order?.order_type || 'purchase',
          customer_name: order?.customer_name || customer?.given_names || null,
          customer_email: order?.customer_email || customer?.email || null,
          customer_phone: order?.customer_phone || customer?.mobile_number || null,
          rental_duration: order?.rental_duration || null,
          amount: amount.toString(),
          requested_expiry: expiryIsoString
        }
      };
      
      console.log('[Xendit OTC Payment] Using V2 Payment Requests API for Over-the-Counter');
      
    } else {
      // Fallback to V3 API for other payment types
      apiEndpoint = `${XENDIT_BASE_URL}/v3/payment_requests`;
      
      requestPayload = {
        reference_id: external_id,
        type: "PAY",
        country: "ID",
        currency: currency,
        request_amount: amount,
        capture_method: "AUTOMATIC",
        channel_code: xenditChannelCode,
        channel_properties: {
          success_return_url: success_redirect_url || `${SITE_URL}/payment-status?status=success`,
          failure_return_url: failure_redirect_url || `${SITE_URL}/payment-status?status=failed`
        },
        webhook: {
          url: `${SITE_URL}/api/xendit/webhook`
        },
        description: description || `Payment for ${order?.product_name || 'product'}`,
        expiry_date: expiryIsoString,
        metadata: {
          client_external_id: external_id,
          product_id: order?.product_id || null,
          user_id: order?.user_id || null,
          order_type: order?.order_type || 'purchase',
          customer_name: order?.customer_name || customer?.given_names || null,
          customer_email: order?.customer_email || customer?.email || null,
          customer_phone: order?.customer_phone || customer?.mobile_number || null,
          rental_duration: order?.rental_duration || null,
          amount: amount.toString(),
          requested_expiry: expiryIsoString
        }
      };
      
      console.log('[Xendit Payment] Using V3 Payment Requests API (fallback)');
    }

    // Create order record if order data provided
    const createdOrder = await createOrderRecord(order, external_id, payment_method_id);

    console.log('[Xendit Payment] Making request to:', apiEndpoint);
    console.log('[Xendit Payment] Channel type:', paymentChannel.type);
    console.log('[Xendit Payment] Channel code:', xenditChannelCode);
    console.log('[Xendit Payment] Payload:', JSON.stringify(requestPayload, null, 2));

    // Prepare headers with required API version and idempotency
    const headers: Record<string, string> = {
      'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
      'api-version': apiVersion,
    };
    if (external_id) headers['x-idempotency-key'] = String(external_id);

    // Log headers safely (exclude Authorization)
    const { Authorization: _hidden, ...safeHeaders } = headers as any;
    console.log('[Xendit Payment] Headers being sent:', JSON.stringify(safeHeaders, null, 2));
    console.log('[Xendit Payment] Full URL:', apiEndpoint);

    // Make request to Xendit API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload)
    });

    const responseData = await response.json();
    console.log('[Xendit Payment] Response status:', response.status);
    console.log('[Xendit Payment] Complete response data:', JSON.stringify(responseData, null, 2));
    console.log('[Xendit Payment] API endpoint used:', apiEndpoint);
    console.log('[Xendit Payment] Payment channel type:', paymentChannel.type);

    if (!response.ok) {
      console.error('[Xendit Payment] API Error:', responseData);
      
      // Handle specific Xendit error cases
      let userFriendlyMessage = responseData.message || 'Payment creation failed';
      let suggestions = [];
      
      if (responseData.error_code === 'NOT_FOUND' || responseData.message?.includes('not found')) {
        userFriendlyMessage = `Payment method ${paymentChannel.name} is currently not available`;
        suggestions.push('Please try a different payment method');
        
        // Suggest alternative payment methods
        const availableChannels = getActivatedPaymentChannels()
          .filter(c => c.id !== payment_method_id)
          .slice(0, 3)
          .map(c => c.name);
        
        if (availableChannels.length > 0) {
          suggestions.push(`Available alternatives: ${availableChannels.join(', ')}`);
        }
      }
      
      return res.status(400).json({ 
        error: userFriendlyMessage,
        suggestions: suggestions,
        details: responseData,
        available_methods: getActivatedPaymentChannels().map(c => ({
          id: c.id,
          name: c.name,
          type: c.type
        })),
        debug_info: {
          endpoint: apiEndpoint,
          payment_method: payment_method_id,
          channel_code: xenditChannelCode,
          channel_type: paymentChannel.type,
          api_version: apiVersion,
          original_error: responseData.error_code || responseData.message
        }
      });
    }

    // Format API response - handle Virtual Account API format
    let formattedResponse: any;
    
    if (paymentChannel.type === 'VIRTUAL_ACCOUNT') {
      // Virtual Account API has immediate VA number in response
      formattedResponse = {
        id: responseData.id,
        external_id: responseData.external_id,
        amount: responseData.expected_amount || amount,
        currency: currency,
        status: responseData.status,
        payment_method: payment_method_id,
        virtual_account_number: responseData.account_number,
        bank_name: paymentChannel.name,
        bank_code: responseData.bank_code,
        account_holder_name: responseData.name,
        transfer_amount: responseData.expected_amount || amount,
        expiry_date: responseData.expiration_date,
        actions: []
      };
      
      console.log('[Xendit VA Payment] ✅ Virtual Account created successfully:');
      console.log('[Xendit VA Payment] - VA ID:', responseData.id);
      console.log('[Xendit VA Payment] - Status:', responseData.status);
      console.log('[Xendit VA Payment] - VA Number:', responseData.account_number);
      console.log('[Xendit VA Payment] - Bank Code:', responseData.bank_code);
      console.log('[Xendit VA Payment] - Expected Amount:', responseData.expected_amount);
    } else {
      // Payment Request API format for other payment types
      formattedResponse = {
        id: responseData.payment_request_id || responseData.id,
        external_id: responseData.reference_id || responseData.external_id,
        amount: responseData.request_amount || responseData.amount,
        currency: responseData.currency,
        status: responseData.status,
        payment_method: payment_method_id,
        payment_request_id: responseData.payment_request_id || responseData.id,
        actions: responseData.actions || []
      };
    }

    // Handle expiry date - different API versions use different field names
    let expiryDate = null;
    
    if (paymentChannel.type === 'VIRTUAL_ACCOUNT') {
      // Invoice API uses expiry_date field
      expiryDate = responseData.expiry_date;
      console.log('[Xendit VA Payment] Invoice API expiry date:', expiryDate);
    } else {
      // Payment Request API - try various field names
      const possibleExpiryFields = [
        'expiry_date', 'expires_at', 'expired_at', 'expires', 'expiration_date',
        'capture_expiry_date', 'payment_expiry_date', 'expiry', 'expire_at',
        'expire_date', 'valid_until', 'due_date', 'timeout', 'ttl'
      ];
      
      for (const field of possibleExpiryFields) {
        if (responseData[field]) {
          expiryDate = responseData[field];
          console.log(`[Xendit Payment] ✅ Found expiry in field '${field}':`, expiryDate);
          break;
        }
      }
      
      // Check nested objects for expiry fields (V3 API)
      if (!expiryDate && responseData.actions) {
        responseData.actions.forEach((action: any, index: number) => {
          for (const field of possibleExpiryFields) {
            if (action[field]) {
              expiryDate = action[field];
              console.log(`[Xendit Payment] ✅ Found expiry in action[${index}].${field}:`, expiryDate);
              break;
            }
          }
        });
      }
    }
    
    // Check metadata for backup expiry
    if (!expiryDate && responseData.metadata?.requested_expiry) {
      expiryDate = responseData.metadata.requested_expiry;
      console.log('[Xendit Payment] ✅ Using metadata.requested_expiry as fallback:', expiryDate);
    }
    
    if (!expiryDate) {
      // Default to 24 hours from now if Xendit doesn't provide expiry
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + 24);
      expiryDate = defaultExpiry.toISOString();
      console.log('[Xendit Payment] ⚠️ No expiry from API, using default 24h expiry:', expiryDate);
      console.log('[Xendit Payment] 📋 Available response fields for debugging:', Object.keys(responseData));
    }
    
    formattedResponse.expiry_date = expiryDate;

    // Handle Virtual Account specific processing
    if (paymentChannel.type === 'VIRTUAL_ACCOUNT') {
      // Update response with Invoice API format for Virtual Accounts
      formattedResponse.invoice_url = responseData.invoice_url;
      formattedResponse.expiry_date = responseData.expiry_date;
      formattedResponse.bank_name = paymentChannel.name;
      formattedResponse.bank_code = xenditChannelCode;
      formattedResponse.available_banks = responseData.available_banks || [];
      formattedResponse.available_virtual_account_banks = responseData.available_virtual_account_banks || [];
      
      console.log('[Xendit Invoice Payment] ✅ Invoice created successfully for Virtual Account:');
      console.log('[Xendit Invoice Payment] - Invoice ID:', responseData.id);
      console.log('[Xendit Invoice Payment] - Status:', responseData.status);
      console.log('[Xendit Invoice Payment] - Invoice URL:', responseData.invoice_url);
      console.log('[Xendit Invoice Payment] - Available Banks:', responseData.available_banks?.length || 0);
      console.log('[Xendit Invoice Payment] - Available VA Banks:', responseData.available_virtual_account_banks?.length || 0);
      
      // Try to extract Virtual Account details from available banks
      if (responseData.available_banks && responseData.available_banks.length > 0) {
        const targetBank = responseData.available_banks.find((bank: any) => 
          bank.bank_code === xenditChannelCode || bank.bank_code === xenditChannelCode.toUpperCase()
        ) || responseData.available_banks[0];
        
        if (targetBank) {
          formattedResponse.virtual_account_number = targetBank.virtual_account_number || targetBank.account_number;
          formattedResponse.bank_code = targetBank.bank_code;
          formattedResponse.bank_name = targetBank.bank_name || paymentChannel.name;
          formattedResponse.account_holder_name = targetBank.account_holder_name;
          formattedResponse.transfer_amount = targetBank.transfer_amount || amount;
          
          console.log('[Xendit Invoice Payment] ✅ Bank details found:');
          console.log('[Xendit Invoice Payment] - VA Number:', targetBank.virtual_account_number || targetBank.account_number);
          console.log('[Xendit Invoice Payment] - Bank Code:', targetBank.bank_code);
          console.log('[Xendit Invoice Payment] - Account Holder:', targetBank.account_holder_name);
        }
      }
      
      // Try alternative VA bank extraction if available
      if (!formattedResponse.virtual_account_number && responseData.available_virtual_account_banks && responseData.available_virtual_account_banks.length > 0) {
        const targetBank = responseData.available_virtual_account_banks.find((bank: any) => 
          bank.bank_code === xenditChannelCode || bank.bank_code === xenditChannelCode.toUpperCase()
        ) || responseData.available_virtual_account_banks[0];
        
        if (targetBank && targetBank.virtual_account_number) {
          formattedResponse.virtual_account_number = targetBank.virtual_account_number;
          formattedResponse.bank_code = targetBank.bank_code;
          formattedResponse.bank_name = targetBank.bank_name || paymentChannel.name;
          
          console.log('[Xendit Invoice Payment] ✅ VA Bank details extracted:');
          console.log('[Xendit Invoice Payment] - VA Number:', targetBank.virtual_account_number);
          console.log('[Xendit Invoice Payment] - Bank Code:', targetBank.bank_code);
        }
      }
      
      // Always include invoice URL as fallback payment method
      formattedResponse.payment_url = responseData.invoice_url;
      
      console.log('[Xendit Invoice Payment] ✅ Invoice processing complete');
      
    } else if (responseData.actions && responseData.actions.length > 0) {
      // V3 API action-based response format (QRIS, E-Wallets)
      const primaryAction = responseData.actions[0];
      
      if (primaryAction.type === 'REDIRECT_CUSTOMER') {
        formattedResponse.payment_url = primaryAction.value;
        formattedResponse.action_type = 'REDIRECT_CUSTOMER';
        formattedResponse.redirect_url = primaryAction.value;
      } else if (primaryAction.type === 'PRESENT_TO_CUSTOMER') {
        formattedResponse.payment_url = primaryAction.value;
        formattedResponse.action_type = 'PRESENT_TO_CUSTOMER';
        formattedResponse.qr_string = primaryAction.value; // PaymentInterface expects qr_string
        formattedResponse.qr_code = primaryAction.value;   // Keep for backward compatibility
      }
      console.log('[Xendit V3 Payment] Action-based payment details extracted');
      
    } else if (responseData.payment_url) {
      // Direct payment URL (fallback)
      formattedResponse.payment_url = responseData.payment_url;
      console.log('[Xendit Payment] Direct payment URL extracted');
    }

    // Store payment data in database for later retrieval
    await storePaymentData(formattedResponse, payment_method_id, order);

    // Send payment link WhatsApp notification
    await sendPaymentLinkNotification(formattedResponse, order);

    console.log('[Xendit Payment] Success:', {
      payment_method_id,
      channel_type: paymentChannel.type,
      external_id,
      amount,
      status: formattedResponse.status,
      payment_request_id: formattedResponse.payment_request_id,
      api_endpoint: apiEndpoint,
      api_version: apiVersion
    });

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('[Xendit Payment] Error:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[Xendit Payment] Error name:', error.name);
      console.error('[Xendit Payment] Error message:', error.message);
      console.error('[Xendit Payment] Error stack:', error.stack);
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      type: 'processing_error'
    });
  }
}

// Store payment data for later retrieval (Multi-API compatible)
async function storePaymentData(paymentData: any, paymentMethodId: string, order: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Store Payment] Skipping payment storage - missing Supabase config');
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store payment data as JSON - compatible with both V2 and V3 APIs
    const paymentSpecificData: any = {};
    
    // Universal fields (both V2 and V3)
    if (paymentData.payment_request_id) paymentSpecificData.payment_request_id = paymentData.payment_request_id;
    if (paymentData.payment_url) paymentSpecificData.payment_url = paymentData.payment_url;
    
    // V3 API specific fields
    if (paymentData.actions) paymentSpecificData.actions = paymentData.actions;
    if (paymentData.action_type) paymentSpecificData.action_type = paymentData.action_type;
    if (paymentData.redirect_url) paymentSpecificData.redirect_url = paymentData.redirect_url;
    if (paymentData.qr_code) paymentSpecificData.qr_code = paymentData.qr_code;
    if (paymentData.qr_string) paymentSpecificData.qr_string = paymentData.qr_string;
    
    // V2 API specific fields (Virtual Accounts)
    if (paymentData.account_number) paymentSpecificData.account_number = paymentData.account_number;
    if (paymentData.virtual_account_number) paymentSpecificData.virtual_account_number = paymentData.virtual_account_number;
    if (paymentData.bank_code) paymentSpecificData.bank_code = paymentData.bank_code;
    if (paymentData.bank_name) paymentSpecificData.bank_name = paymentData.bank_name;
    if (paymentData.invoice_url) paymentSpecificData.invoice_url = paymentData.invoice_url;
    if (paymentData.account_holder_name) paymentSpecificData.account_holder_name = paymentData.account_holder_name;
    if (paymentData.transfer_amount) paymentSpecificData.transfer_amount = paymentData.transfer_amount;

    // Ensure we always have an expiry date with comprehensive field checking
    let expiryDate = null;
    
    console.log('[Store Payment V3] Checking paymentData for expiry fields...');
    console.log('[Store Payment V3] PaymentData fields:', Object.keys(paymentData));
    
    // Try various field names that Xendit might use in the payment data
    const possibleExpiryFields = [
      'expiry_date', 'expires_at', 'expired_at', 'expires', 'expiration_date',
      'capture_expiry_date', 'payment_expiry_date', 'expiry', 'expire_at',
      'expire_date', 'valid_until', 'due_date', 'timeout', 'ttl'
    ];
    
    for (const field of possibleExpiryFields) {
      if (paymentData[field]) {
        expiryDate = paymentData[field];
        console.log(`[Store Payment V3] ✅ Found expiry in field '${field}':`, expiryDate);
        break;
      }
    }
    
    // Check nested actions for expiry fields
    if (!expiryDate && paymentData.actions) {
      console.log('[Store Payment V3] Checking actions for expiry fields...');
      paymentData.actions.forEach((action: any, index: number) => {
        for (const field of possibleExpiryFields) {
          if (action[field]) {
            expiryDate = action[field];
            console.log(`[Store Payment V3] ✅ Found expiry in action[${index}].${field}:`, expiryDate);
            break;
          }
        }
      });
    }
    
    if (!expiryDate) {
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + 24); // 24 hours from now
      expiryDate = defaultExpiry.toISOString();
      console.log('[Store Payment V3] ⚠️ No expiry provided, using default 24h expiry:', expiryDate);
      console.log('[Store Payment V3] 📋 Available paymentData fields for debugging:', Object.keys(paymentData));
    }

    const paymentRecord = {
      xendit_id: paymentData.id || paymentData.payment_request_id,
      external_id: paymentData.external_id,
      payment_method: paymentMethodId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'IDR',
      status: paymentData.status,
      description: paymentData.description,
      payment_data: paymentSpecificData,
      expiry_date: expiryDate,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('payments')
      .insert(paymentRecord);

    if (error) {
      console.error('[Store Payment V3] Database error:', error);
    } else {
      console.log('[Store Payment V3] Successfully stored payment data for:', paymentRecord.xendit_id);
    }

  } catch (error) {
    console.error('[Store Payment V3] Error:', error);
  }
}

// Send payment link WhatsApp notification to customer
async function sendPaymentLinkNotification(paymentData: any, order: any) {
  try {
    // Skip if no customer phone number
    if (!order?.customer_phone) {
      console.log('[Payment Link Notification] No customer phone provided, skipping notification');
      return;
    }

    const { DynamicWhatsAppService } = await import('../_utils/dynamicWhatsAppService.js');
    const wa = new DynamicWhatsAppService();

    // Get site URL for payment link
    const SITE_URL = process.env.SITE_URL || process.env.REACT_APP_SITE_URL || 'https://www.jbalwikobra.com';
    
    // Create payment interface URL
    const paymentParams = new URLSearchParams({
      id: paymentData.id,
      method: paymentData.payment_method || 'unknown',
      amount: paymentData.amount?.toString() || '0',
      external_id: paymentData.external_id || '',
      description: paymentData.description || 'Payment'
    });
    
    const paymentLink = `${SITE_URL}/payment?${paymentParams.toString()}`;
    
    // Format expiry date
    const expiryText = paymentData.expiry_date 
      ? new Date(paymentData.expiry_date).toLocaleString('id-ID', {
          dateStyle: 'full',
          timeStyle: 'short'
        })
      : '24 jam dari sekarang';

    // Get product name - fetch from database if not provided
    let productName = order.product_name || 'Product';
    if (!order.product_name && order.product_id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: productData } = await supabase
          .from('products')
          .select('name')
          .eq('id', order.product_id)
          .single();
        
        if (productData?.name) {
          productName = productData.name;
          console.log('[Payment Link Notification] Fetched product name:', productName);
        }
      } catch (error) {
        console.error('[Payment Link Notification] Error fetching product name:', error);
      }
    }

    // Different messages for purchase vs rental
    const isRental = order.order_type === 'rental';
    const customerName = order.customer_name || 'Customer';
    const amount = paymentData.amount || 0;
    
    const message = isRental 
      ? `🎮 *RENTAL PAYMENT LINK*

Halo ${customerName}! 👋

Segera selesaikan pembayaran untuk rental akun *${productName}* senilai *Rp ${Number(amount).toLocaleString('id-ID')}* dengan durasi *${order.rental_duration || 'sesuai pilihan'}*.

🔗 **Klik link berikut untuk melanjutkan pembayaran:**
${paymentLink}

⏰ **Link pembayaran berlaku sampai:**
${expiryText}

📋 **Detail Rental:**
• Product: ${productName}
• Durasi: ${order.rental_duration || 'Sesuai pilihan'}
• Total: Rp ${Number(amount).toLocaleString('id-ID')}

⚠️ **PENTING:**
• Gunakan link di atas jika Anda keluar dari halaman pembayaran
• Pembayaran akan dikonfirmasi otomatis
• Akses rental dimulai setelah pembayaran berhasil

💬 **Support:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih! 🙏`
      : `🎮 *PAYMENT LINK - PURCHASE*

Halo ${customerName}! 👋

Segera selesaikan pembayaran untuk pembelian akun *${productName}* senilai *Rp ${Number(amount).toLocaleString('id-ID')}*.

🔗 **Klik link berikut untuk melanjutkan pembayaran:**
${paymentLink}

⏰ **Link pembayaran berlaku sampai:**
${expiryText}

📋 **Detail Order:**
• Product: ${productName}
• Total: Rp ${Number(amount).toLocaleString('id-ID')}
• Type: Full Purchase

✅ **Yang Anda dapatkan:**
• Akun permanen milik Anda
• Full access selamanya
• Support after sales
• Garansi 7 hari

💬 **Support:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih! 🙏`;

    // Send notification with idempotency
    const contextId = `payment-link:${paymentData.id}`;
    const alreadySent = await wa.hasMessageLog('payment-link', contextId);
    
    if (alreadySent) {
      console.log('[Payment Link Notification] Already sent for payment:', paymentData.id);
      return;
    }

    const result = await wa.sendMessage({
      phone: order.customer_phone,
      message: message,
      contextType: 'payment-link',
      contextId: contextId
    });

    if (result.success) {
      console.log(`[Payment Link Notification] Sent successfully to ${order.customer_phone} for payment ${paymentData.id}`);
    } else {
      console.error('[Payment Link Notification] Failed to send:', result.error);
    }

  } catch (error) {
    console.error('[Payment Link Notification] Error:', error);
  }
}


