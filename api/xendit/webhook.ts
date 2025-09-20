// Xendit webhook to update order status in Supabase (robust)
// Configure Xendit to call /api/xendit/webhook with a shared XENDIT_CALLBACK_TOKEN

function mapStatus(x: string | undefined): 'pending'|'paid'|'completed'|'cancelled' {
  const s = (x || '').toUpperCase();
  if (s === 'PAID' || s === 'SUCCEEDED' || s === 'SUCCESS') return 'paid';
  if (s === 'SETTLED') return 'completed';
  if (s === 'EXPIRED' || s === 'CANCELLED') return 'cancelled';
  return 'pending';
}

// Admin notification function for database notifications
async function createOrderNotification(sb: any, orderId: string, customerName: string, productName: string, amount: number, type: string = 'paid_order', customerPhone?: string, orderType?: string) {
  try {
    const isRental = orderType === 'rental';
    const typeLabel = isRental ? 'RENTAL' : 'PURCHASE';
    
    const titles = {
      new_order: `Bang! ada yang ORDER ${typeLabel} nih!`,
      paid_order: `Bang! ALHAMDULILLAH ${typeLabel} udah di bayar nih`,
      order_cancelled: `Bang! ada yang CANCEL ${typeLabel} order nih!`
    };

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const messages = {
      new_order: `namanya ${customerName}, produknya ${productName} harganya ${formatAmount(amount)}, ${isRental ? 'order RENTAL' : 'order PURCHASE'}, belum di bayar sih, tapi moga aja di bayar amin.`,
      paid_order: `namanya ${customerName}, produknya ${productName} harganya ${formatAmount(amount)}, ${isRental ? 'RENTAL udah di bayar' : 'PURCHASE udah di bayar'} Alhamdulillah.`,
      order_cancelled: `namanya ${customerName}, ${isRental ? 'RENTAL' : 'PURCHASE'} produktnya ${productName} di cancel nih.`
    };

    // Ensure orderId is a valid UUID or null
    let validOrderId = null;
    if (orderId && typeof orderId === 'string') {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
      if (isValidUUID) {
        validOrderId = orderId;
      } else {
        console.warn('[Admin] Invalid UUID format for orderId:', orderId, 'Using null instead');
      }
    }

    const notification = {
      type,
      title: titles[type] || 'Payment Received',
      message: messages[type] || `${customerName} paid for ${productName}`,
      order_id: validOrderId,
      customer_name: customerName,
      product_name: productName,
      amount: Math.round(Number(amount)),
      is_read: false,
      metadata: {
        priority: type === 'paid_order' ? 'high' : 'normal',
        category: 'payment',
        order_type: orderType || 'purchase',
        customer_phone: customerPhone,
        original_order_id: orderId
      },
      created_at: new Date().toISOString()
    };

    console.log('[Admin] Creating paid order notification:', notification);

    const { data, error } = await sb
      .from('admin_notifications')
      .insert(notification)
      .select('*')
      .single();

    if (error) {
      console.error('[Admin] Paid notification insert error:', error);
      throw error;
    } else {
      console.log('[Admin] Paid order notification created successfully with ID:', data?.id);
      return data;
    }
  } catch (error) {
    console.error('[Admin] Failed to create paid order notification:', error);
    throw error;
  }
}

async function sendOrderPaidNotification(sb: any, invoiceId?: string, externalId?: string) {
  try {
    // Get order details with product information and rental details
    // Include both 'paid' and 'completed' statuses to handle providers that emit SETTLED/COMPLETED
    let q = sb.from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        status,
        order_type,
        rental_duration,
        created_at,
        paid_at,
        products (
          id,
          name,
          price,
          description
        )
      `)
      .in('status', ['paid', 'completed'])
      .limit(1);
    
    if (invoiceId) q = q.eq('xendit_invoice_id', invoiceId);
    else if (externalId) q = q.eq('client_external_id', externalId);
    
    const { data: orders } = await q;
    const order = orders?.[0];
    
    if (!order) {
      console.log('[WhatsApp] No paid order found for notification');
      return;
    }

    const product = order.products;
    const productName = product?.name || 'Unknown Product';
    const isRental = order.order_type === 'rental';
    
    // Generate notification message (different for rental vs purchase)
    const message = isRental 
      ? `🔥 *NEW RENTAL ORDER PAID!* 💰

📊 **RENTAL PESANAN BARU**
━━━━━━━━━━━━━━━━━━━━━━━

👤 **Customer:** *${order.customer_name || 'Guest'}*
📧 **Email:** ${order.customer_email || 'Not provided'}
📱 **WhatsApp:** *${order.customer_phone || 'Not provided'}*

🆔 **Order ID:** \`${order.id}\`
🎯 **Product:** *${productName}*
⏰ **Duration:** *${order.rental_duration || 'Not specified'}*
💰 **Amount:** *Rp ${Number(order.amount || 0).toLocaleString('id-ID')}*

✅ **Status:** *PAID* ✅
📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

🚨 **ACTION REQUIRED:**
• Setup rental access dalam 5-15 menit
• Contact customer untuk video call verification
• Prepare login credentials
• Send rental guidelines dan aturan
• Pastikan dokumen verifikasi valid

⏱️ **DEADLINE:** 15 menit dari sekarang

📋 **CHECKLIST:**
□ Siapkan akun rental
□ Hubungi customer untuk jadwal video call
□ Kirim panduan rental
□ Dokumentasikan proses handover

#RentalPaid #ActionRequired #VideoCallRequired`
      : `🔥 *NEW PURCHASE ORDER PAID!* 💰

📊 **PURCHASE PESANAN BARU**
━━━━━━━━━━━━━━━━━━━━━━━

👤 **Customer:** *${order.customer_name || 'Guest'}*
📧 **Email:** ${order.customer_email || 'Not provided'}
📱 **WhatsApp:** *${order.customer_phone || 'Not provided'}*

🆔 **Order ID:** \`${order.id}\`
🎯 **Product:** *${productName}*
💰 **Amount:** *Rp ${Number(order.amount || 0).toLocaleString('id-ID')}*

✅ **Status:** *PAID* ✅
📅 **Paid at:** ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Just now'}

🚨 **ACTION REQUIRED:**
• Prepare account delivery dalam 5-30 menit
• Send login credentials to customer
• Include setup guide dan warranty info
• Follow up untuk kepuasan customer
• Pastikan akun sudah ditest sebelum dikirim

⏱️ **DEADLINE:** 30 menit dari sekarang

📋 **CHECKLIST:**
□ Test akun berfungsi normal
□ Kirim detail login via WhatsApp
□ Sertakan panduan lengkap
□ Follow up dalam 24 jam

#PurchasePaid #ActionRequired #FullOwnership`;

    // Use dynamic WhatsApp service for unified logging and idempotency
    const { DynamicWhatsAppService } = await import('../_utils/dynamicWhatsAppService.js');
    const wa = new DynamicWhatsAppService();
    // Use a single success context across paid/completed to prevent duplicates on SETTLED after PAID
    const contextId = `order:${order.id}:success`;

    // Idempotency: if already sent for this order+status, skip
    const alreadySentGroup = await wa.hasMessageLog('order-paid-group', contextId);
    if (!alreadySentGroup) {
      const settings = await wa.getActiveProviderSettings();
      
      // Determine appropriate group based on order type and group configurations
      let groupId = settings?.default_group_id; // fallback
      
      if (settings?.group_configurations) {
        const groupConfigs = settings.group_configurations;
        
        if (isRental && groupConfigs.rental_orders) {
          groupId = groupConfigs.rental_orders;
        } else if (!isRental && groupConfigs.purchase_orders) {
          groupId = groupConfigs.purchase_orders;
        }
        // For other order types, we could add flash_sales check here
        // else if (order.order_type === 'flash_sale' && groupConfigs.flash_sales) {
        //   groupId = groupConfigs.flash_sales;
        // }
      }
      
      const start = Date.now();
      const resp = await wa.sendGroupMessage({
        message,
        groupId,
        contextType: 'order-paid-group',
        contextId
      });
      const duration = Date.now() - start;
      if (resp.success) {
        console.log('[WhatsApp] Admin group notified', { 
          groupId, 
          orderType: order.order_type,
          isRental,
          ms: duration 
        });
      } else {
        console.error('[WhatsApp] Admin group notification failed:', resp.error);
      }
    } else {
      console.log('[WhatsApp] Admin group already notified for', contextId);
    }



    // Send notification to customer if phone number is provided
    if (order.customer_phone) {
      try {
        // Normalize phone using service's formatter (same logic as dynamic service)
        const raw = String(order.customer_phone || '');
        let customerPhone = raw.replace(/\D/g, '');
        if (customerPhone.startsWith('8')) customerPhone = '62' + customerPhone;
        else if (customerPhone.startsWith('08')) customerPhone = '62' + customerPhone.substring(1);
        else if (customerPhone.startsWith('0')) customerPhone = '62' + customerPhone.substring(1);
        else if (!customerPhone.startsWith('62') && customerPhone.length >= 8) customerPhone = '62' + customerPhone;
        if (!/^62\d{8,15}$/.test(customerPhone)) {
          console.log(`[WhatsApp] Invalid phone number format: ${order.customer_phone}`);
          return;
        }

        // Generate customer notification message (different for rental vs purchase)
        const customerMessage = isRental 
          ? `🎉 *RENTAL PAYMENT CONFIRMED!*

Halo ${order.customer_name || 'Customer'} 👋

Terima kasih! Pembayaran rental Anda telah *BERHASIL DIPROSES* ✅

📋 **DETAIL RENTAL:**
• Order ID: *${order.id}*
• Product: *${productName}*
• Duration: *${order.rental_duration || 'Sesuai pesanan'}*
• Total Paid: *Rp ${Number(order.amount || 0).toLocaleString('id-ID')}*
• Status: *PAID* ✅
• Paid at: ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Baru saja'}

🚀 **LANGKAH SELANJUTNYA:**
• Tim kami akan mengatur akses rental dalam *5-15 menit*
• Informasi login akan dikirim via WhatsApp
• Anda akan diminta verifikasi data via *Video Call*
• Rental dimulai setelah verifikasi selesai

⚠️ **PERSIAPKAN DOKUMEN:**
• KTP/Passport/SIM yang masih aktif
• Foto selfie dengan dokumen
• Koneksi internet stabil untuk video call

📝 **PENTING:**
• Rental tidak bisa diperpanjang otomatis
• Backup data pribadi sebelum rental berakhir
• Gunakan akun sesuai aturan yang berlaku
• Jangan ubah password atau data akun

💬 **Support 24/7:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih telah mempercayai JB Alwikobra! 🎮✨`
          : `🎉 *PURCHASE PAYMENT CONFIRMED!*

Halo ${order.customer_name || 'Customer'} 👋

Terima kasih! Pembayaran Anda telah *BERHASIL DIPROSES* ✅

📋 **DETAIL PURCHASE:**
• Order ID: *${order.id}*
• Product: *${productName}*
• Total Paid: *Rp ${Number(order.amount || 0).toLocaleString('id-ID')}*
• Status: *PAID* ✅
• Paid at: ${order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : 'Baru saja'}

🚀 **LANGKAH SELANJUTNYA:**
• Tim kami akan memproses pesanan dalam *5-30 menit*
• Akun game akan dikirim melalui WhatsApp
• Detail login dan panduan akan disertakan
• Akun menjadi milik Anda *SEPENUHNYA*

✅ **YANG ANDA DAPATKAN:**
• *Full access permanent* - selamanya
• *Support after sales* berkelanjutan
• *Panduan lengkap* penggunaan akun
• *Free konsultasi* setup dan optimasi

🔒 **KEAMANAN TERJAMIN:**
• Akun original dan legal
• Data aman dan terlindungi
• Transaksi tercatat resmi

💬 **Support 24/7:** wa.me/6289653510125
🌐 **Website:** https://jbalwikobra.com

Terima kasih telah berbelanja di JB Alwikobra! 🎮✨`;

        // Idempotency per order+status for customer
  const alreadySentCustomer = await wa.hasMessageLog('order-paid-customer', contextId);
        if (alreadySentCustomer) {
          console.log('[WhatsApp] Customer already notified for', contextId);
          return;
        }

        // Use dynamic service for customer message
        const sendRes = await wa.sendMessage({
          phone: customerPhone,
          message: customerMessage,
          contextType: 'order-paid-customer',
          contextId
        });
        if (sendRes.success) {
          console.log(`[WhatsApp] Customer notification sent to ${customerPhone}`);
        } else {
          console.error('[WhatsApp] Customer notification failed:', sendRes.error);
        }
      } catch (customerError) {
        console.error('[WhatsApp] Error sending customer notification:', customerError);
      }
    } else {
      console.log('[WhatsApp] No customer phone number provided, skipping customer notification');
    }

    // Create admin database notification for paid order (CRITICAL ADDITION)
    try {
      console.log('[Admin] Creating database notification for paid order:', order.id);
      await createOrderNotification(
        sb,
        order.id,
        order.customer_name || 'Guest Customer',
        productName,
        Number(order.amount || 0),
        'paid_order',
        order.customer_phone,
        order.order_type
      );
      console.log('[Admin] Database notification created successfully for paid order:', order.id);
    } catch (notificationError) {
      console.error('[Admin] Failed to create database notification for paid order:', notificationError);
    }

  } catch (error) {
    console.error('[WhatsApp] Error sending order paid notification:', error);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Admin test hook: send a WhatsApp group message using DB-configured provider
  // Usage: POST /api/xendit/webhook?testGroupSend=1 { message, groupId? }
  if ((req.query && (req.query as any).testGroupSend) || (req.body && (req.body as any).testGroupSend)) {
    try {
      const { message, groupId } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { DynamicWhatsAppService } = await import('../_utils/dynamicWhatsAppService.js');
      const wa = new DynamicWhatsAppService();
      const resp = await wa.sendGroupMessage({ message: message || 'Admin test message', groupId, contextType: 'admin-test', contextId: String(Date.now()) });
      return res.status(resp.success ? 200 : 400).json(resp);
    } catch (e: any) {
      console.error('[Webhook testGroupSend] error', e);
      return res.status(500).json({ error: e?.message || 'failed' });
    }
  }

  const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN as string | undefined;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    // Header validation
    const headerToken = (req.headers['x-callback-token'] as string | undefined) || (req.headers['X-Callback-Token'] as string | undefined) || '';
    if (XENDIT_CALLBACK_TOKEN && String(headerToken || '').trim() !== String(XENDIT_CALLBACK_TOKEN).trim()) {
      console.error('[Webhook] Invalid callback token');
      return res.status(401).json({ error: 'Invalid callback token' });
    }

    const payload = req.body || {};
    const event = (payload.event || payload.type || '').toString();
    const data = payload.data || payload;

    // Extract identifiers from various possible shapes
    const invoiceId: string | undefined =
      data.id || data.invoice_id || data.payment_request_id || data.payment_method_id ||
      data.qr_code?.id || data.payment_method?.id;

    const externalId: string | undefined =
      data.external_id || data.reference_id || data.qr_code?.external_id || data.qr_code?.reference_id ||
      data.payment_method?.reference_id || data.payment_method?.external_id;

    // Determine status from field or event name
    const rawStatus: string | undefined = data.status || data.qr_code?.status || data.payment_method?.status ||
      (event.includes('succeeded') ? 'SUCCEEDED' : undefined) ||
      (event.includes('failed') ? 'FAILED' : undefined) ||
      (event.includes('expired') ? 'EXPIRED' : undefined);

    if (!externalId && !invoiceId) {
      console.error('[Webhook] Missing identifiers');
      return res.status(400).json({ error: 'Invalid payload: missing identifiers' });
    }

    const status = mapStatus(rawStatus);
    const paidAt: string | null = data.paid_at ? new Date(data.paid_at).toISOString() : (status === 'paid' || status === 'completed') ? new Date().toISOString() : null;
    const paymentChannel: string | null =
      data.payment_channel || data.payment_method || data.channel_code || data.payment_method?.type ||
      (data.qr_code ? 'QRIS' : null);
    const payerEmail: string | null = data.payer_email || data.payer?.email || null;
    const invoiceUrl: string | null = data.invoice_url || null;
    const currency: string | null = data.currency || 'IDR';
    const expiresAt: string | null = data.expiry_date ? new Date(data.expiry_date).toISOString() : null;

    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try update by invoice id first
    let updated = 0;
    if (invoiceId) {
      const { data: up, error } = await sb
        .from('orders')
        .update({
          status,
          paid_at: paidAt,
          payment_channel: paymentChannel,
          payer_email: payerEmail,
          xendit_invoice_url: invoiceUrl,
          xendit_invoice_id: invoiceId,
          currency,
          expires_at: expiresAt,
        })
        .eq('xendit_invoice_id', invoiceId)
        .select('id');
      if (!error) updated = (up || []).length;
    }

  // Fallback: update by client_external_id (we set external_id === client_external_id when creating invoice)
  if (updated === 0 && externalId) {
      const { data: up2, error: e2 } = await sb
        .from('orders')
        .update({
          status,
          paid_at: paidAt,
          payment_channel: paymentChannel,
          payer_email: payerEmail,
          xendit_invoice_url: invoiceUrl,
          xendit_invoice_id: invoiceId,
          currency,
          expires_at: expiresAt,
        })
    .eq('client_external_id', externalId)
        .select('id');
      if (!e2) updated = (up2 || []).length;
    }

    // If nothing updated yet, try to create/upsert order from metadata for resilience
    if (updated === 0) {
      const meta = (data.metadata || {}) as any;
      if (meta && (externalId || meta.client_external_id)) {
        const clientId = (externalId || meta.client_external_id) as string;
        const baseRow: any = {
          client_external_id: clientId,
          product_id: meta.product_id || null,
          user_id: meta.user_id || null,
          order_type: meta.order_type || 'purchase',
          amount: typeof meta.amount === 'number' ? meta.amount : (data.amount || null),
          customer_name: meta.customer_name || null,
          customer_email: meta.customer_email || payerEmail,
          customer_phone: meta.customer_phone || null,
          status: 'pending',
          payment_method: 'xendit',
        };
        const { error: upErr } = await sb
          .from('orders')
          .upsert(baseRow, { onConflict: 'client_external_id' });
        if (!upErr) {
          // Now update with invoice details
          const { data: up3, error: e3 } = await sb
            .from('orders')
            .update({
              status,
              paid_at: paidAt,
              payment_channel: paymentChannel,
              payer_email: payerEmail,
              xendit_invoice_url: invoiceUrl,
              xendit_invoice_id: invoiceId,
              currency,
              expires_at: expiresAt,
            })
            .eq('client_external_id', clientId)
            .select('id');
          if (!e3) updated = (up3 || []).length;
        }
      }
      // If still nothing updated and we have at least an externalId, insert a minimal placeholder order
      if (updated === 0 && externalId) {
        const baseRow: any = {
          client_external_id: externalId,
          order_type: 'purchase',
          amount: typeof (data.amount) === 'number' ? data.amount : null,
          customer_name: null,
          customer_email: payerEmail,
          customer_phone: null,
          status: 'pending',
          payment_method: 'xendit',
          created_at: new Date().toISOString()
        };
        const { error: insertErr } = await sb.from('orders').upsert(baseRow, { onConflict: 'client_external_id' });
        if (!insertErr) {
          const { data: up4 } = await sb
            .from('orders')
            .update({
              status,
              paid_at: paidAt,
              payment_channel: paymentChannel,
              payer_email: payerEmail,
              xendit_invoice_url: invoiceUrl,
              xendit_invoice_id: invoiceId,
              currency,
              expires_at: expiresAt,
            })
            .eq('client_external_id', externalId)
            .select('id');
          updated = (up4 || []).length;
        }
      }
    }

    // Archive product on successful payment
    try {
      if (updated > 0 && (status === 'paid' || status === 'completed')) {
        // Find related product id(s) for the updated orders and archive them
        let q = sb.from('orders').select('product_id').limit(50);
        if (invoiceId) q = q.eq('xendit_invoice_id', invoiceId);
        else if (externalId) q = q.eq('client_external_id', externalId);
        const { data: ordersToArchive } = await q;
        const productIds = (ordersToArchive || []).map((o: any) => o.product_id).filter(Boolean);
        if (productIds.length) {
          await sb.from('products').update({ is_active: false, archived_at: new Date().toISOString() }).in('id', productIds);
        }

        // Send WhatsApp notifications for successful payments
        // Some channels report final state as 'completed' (e.g., SETTLED), not 'paid'
        if (status === 'paid' || status === 'completed') {
          await sendOrderPaidNotification(sb, invoiceId, externalId);
        }
      }
    } catch (e) {
      console.error('Failed to archive product after payment:', e);
    }

    return res.status(200).json({ ok: true, updated, by: updated ? (invoiceId ? 'invoice_id' : 'external_id') : 'none' });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Internal server error', message: e?.message || String(e) });
  }
}
