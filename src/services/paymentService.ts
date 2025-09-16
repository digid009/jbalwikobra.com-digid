import { getActivatedPaymentChannels, getXenditChannelCode, isChannelActivated } from '../config/paymentChannels';

export type CreateInvoiceInput = {
  externalId: string;
  // Optional alias for clarity; we still send externalId to server
  clientExternalId?: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  paymentMethod?: string; // Add payment method selection
  customer?: {
    given_names?: string;
    email?: string;
    mobile_number?: string;
  };
  order?: {
    product_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_type?: 'purchase' | 'rental';
    amount: number;
    rental_duration?: string | null;
  user_id?: string | null;
  };
};

export async function createXenditInvoice(input: CreateInvoiceInput) {
  console.log('[paymentService] Creating invoice with input:', {
    externalId: input.externalId,
    amount: input.amount,
    hasOrder: !!input.order,
    orderProductId: input.order?.product_id,
    orderCustomer: input.order?.customer_name,
    paymentMethod: input.paymentMethod
  });
  
  // Performance optimization: Shorter timeout for better UX
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000); // 8 seconds instead of default browser timeout
  
  try {
    // If a specific payment method is selected, use direct payment API
    if (input.paymentMethod && input.paymentMethod.trim() !== '') {
      console.log('[paymentService] Using direct payment API for method:', input.paymentMethod);
      
      const res = await fetch('/api/xendit/create-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: input.amount,
          currency: 'IDR',
          payment_method_id: input.paymentMethod,
          customer: input.customer,
          description: input.description,
          external_id: input.clientExternalId || input.externalId,
          success_redirect_url: input.successRedirectUrl,
          failure_redirect_url: input.failureRedirectUrl,
          order: input.order // Include order data for database tracking
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      console.log('[paymentService] Direct payment response status:', res.status);
      
      const data = await res.json();
      console.log('[paymentService] Direct payment response data:', data);
      
      if (!res.ok) throw new Error(data?.error || 'Failed to create direct payment');
      
      // Convert direct payment response to invoice format
      return {
        id: data.id,
        invoice_url: data.payment_url || data.invoice_url,
        status: data.status
      };
    } else {
      // Fallback to generic invoice for payment method selection
      console.log('[paymentService] Using generic invoice API (no specific payment method)');
      
      const res = await fetch('/api/xendit/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: input.clientExternalId || input.externalId,
          amount: input.amount,
          payer_email: input.payerEmail,
          description: input.description,
          success_redirect_url: input.successRedirectUrl,
          failure_redirect_url: input.failureRedirectUrl,
          customer: input.customer,
          order: input.order
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      console.log('[paymentService] Invoice response status:', res.status);
      
      const data = await res.json();
      console.log('[paymentService] Invoice response data:', data);
      
      if (!res.ok) throw new Error(data?.error || 'Failed to create invoice');
      return data as { id: string; invoice_url: string; status: string };
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Koneksi terlalu lambat. Silakan coba lagi.');
    }
    throw error;
  }
}