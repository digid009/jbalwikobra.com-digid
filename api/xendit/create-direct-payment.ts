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

    // Create Xendit V3 Payment Request payload
  const xenditChannelCode = getXenditChannelCode(payment_method_id);
    const paymentRequestPayload = {
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
      description: description || `Payment for ${order?.product_name || 'product'}`,
      metadata: {
        client_external_id: external_id,
        product_id: order?.product_id || null,
        user_id: order?.user_id || null,
        order_type: order?.order_type || 'purchase',
        customer_name: order?.customer_name || customer?.given_names || null,
        customer_email: order?.customer_email || customer?.email || null,
        customer_phone: order?.customer_phone || customer?.mobile_number || null,
        rental_duration: order?.rental_duration || null,
        amount: amount.toString()
      }
    };

    // Create order record if order data provided
    const createdOrder = await createOrderRecord(order, external_id, payment_method_id);

    console.log('[Xendit V3 Payment] Making request to:', `${XENDIT_BASE_URL}/v3/payment_requests`);
    console.log('[Xendit V3 Payment] Payload:', JSON.stringify(paymentRequestPayload, null, 2));

    // Prepare headers with required API version and idempotency
    const headers: Record<string, string> = {
      'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
      // Use the latest supported API version for Xendit Payment Requests V3
      'api-version': '2024-11-11',
    };
    if (external_id) headers['x-idempotency-key'] = String(external_id);

    // Log headers safely (exclude Authorization)
    const { Authorization: _hidden, ...safeHeaders } = headers as any;
    console.log('[Xendit V3 Payment] Headers being sent:', JSON.stringify(safeHeaders, null, 2));
    console.log('[Xendit V3 Payment] Full URL:', `${XENDIT_BASE_URL}/v3/payment_requests`);

    // Make request to Xendit V3 API
    const response = await fetch(`${XENDIT_BASE_URL}/v3/payment_requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentRequestPayload)
    });

    const responseData = await response.json();
    console.log('[Xendit V3 Payment] Response status:', response.status);
    console.log('[Xendit V3 Payment] Response data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('[Xendit V3 Payment] API Error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Payment creation failed',
        details: responseData,
        debug_info: {
          endpoint: `${XENDIT_BASE_URL}/v3/payment_requests`,
          payment_method: payment_method_id,
          channel_code: xenditChannelCode,
          payload: paymentRequestPayload
        }
      });
    }

    // Format V3 API response
    let formattedResponse: any = {
      id: responseData.payment_request_id,
      external_id: responseData.reference_id,
      amount: responseData.request_amount,
      currency: responseData.currency,
      status: responseData.status,
      payment_method: payment_method_id,
      payment_request_id: responseData.payment_request_id,
      actions: responseData.actions || [],
      // Add expiry date from V3 API response
      expiry_date: responseData.expiry_date || responseData.expires_at || responseData.expired_at
    };

    // Handle different action types from V3 API
    if (responseData.actions && responseData.actions.length > 0) {
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
    }

    // Store payment data in database for later retrieval
    await storePaymentData(formattedResponse, payment_method_id, order);

    // Send payment link WhatsApp notification
    await sendPaymentLinkNotification(formattedResponse, order);

    console.log('[Xendit V3 Payment] Success:', {
      payment_method_id,
      external_id,
      amount,
      status: formattedResponse.status,
      payment_request_id: formattedResponse.payment_request_id
    });

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('[Xendit V3 Payment] Error:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[Xendit V3 Payment] Error name:', error.name);
      console.error('[Xendit V3 Payment] Error message:', error.message);
      console.error('[Xendit V3 Payment] Error stack:', error.stack);
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      type: 'processing_error'
    });
  }
}

// Store payment data for later retrieval (V3 API compatible)
async function storePaymentData(paymentData: any, paymentMethodId: string, order: any) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Store Payment V3] Skipping payment storage - missing Supabase config');
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store V3 API specific data as JSON
    const paymentSpecificData: any = {};
    
    // V3 API response fields
    if (paymentData.payment_request_id) paymentSpecificData.payment_request_id = paymentData.payment_request_id;
    if (paymentData.actions) paymentSpecificData.actions = paymentData.actions;
    if (paymentData.action_type) paymentSpecificData.action_type = paymentData.action_type;
    if (paymentData.payment_url) paymentSpecificData.payment_url = paymentData.payment_url;
    if (paymentData.redirect_url) paymentSpecificData.redirect_url = paymentData.redirect_url;
    if (paymentData.qr_code) paymentSpecificData.qr_code = paymentData.qr_code;
    
    // Legacy fields for backward compatibility
    if (paymentData.qr_string) paymentSpecificData.qr_string = paymentData.qr_string;
    if (paymentData.account_number) paymentSpecificData.account_number = paymentData.account_number;
    if (paymentData.bank_code) paymentSpecificData.bank_code = paymentData.bank_code;

    const paymentRecord = {
      xendit_id: paymentData.id || paymentData.payment_request_id,
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

    // Different messages for purchase vs rental
    const isRental = order.order_type === 'rental';
    const productName = order.product_name || 'Product';
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


