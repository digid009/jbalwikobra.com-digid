import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PaymentMethodUtils, PAYMENT_METHOD_CONFIGS } from '../../src/config/paymentMethodConfig';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simple order creation function for direct payments
// Prefer explicit SITE_URL; fall back to client var; default to www domain (apex may not resolve)
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

    // Validate that the payment method is activated using centralized config
    const paymentMethodConfig = PaymentMethodUtils.getConfig(payment_method_id);
    
    if (!paymentMethodConfig) {
      const allAvailableMethods = PaymentMethodUtils.getAllActivatedIds();
      
      console.error(`[Xendit Direct Payment] Payment method '${payment_method_id}' is not activated on this account`);
      return res.status(400).json({ 
        error: `Payment method '${payment_method_id}' is not available. Please select from activated payment methods.`,
        available_methods: allAvailableMethods
      });
    }

    // Common metadata for webhook reconciliation
    const metadata = {
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

    // Create payment payload using centralized configuration
    const endpoint = paymentMethodConfig.apiEndpoint;
    const payload = PaymentMethodUtils.createPaymentPayload(
      paymentMethodConfig,
      external_id,
      amount,
      currency,
      description || 'Payment',
      metadata,
      customer?.given_names || 'Customer',
      success_redirect_url || `${SITE_URL}/success`,
      failure_redirect_url || `${SITE_URL}/failed`,
      `${SITE_URL}/api/xendit/webhook`
    );

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

    // Format response using centralized configuration
    const formattedResponse = PaymentMethodUtils.formatResponse(
      responseData,
      paymentMethodConfig,
      external_id,
      amount,
      currency
    );

    // Store payment data in database for later retrieval
    await storePaymentData(formattedResponse, payment_method_id, order);

    // Send payment link WhatsApp notification
    await sendPaymentLinkNotification(formattedResponse, order);

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


