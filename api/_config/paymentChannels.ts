/**
 * Server-only Payment Channel Configuration for Xendit V3 (ESM-safe)
 * Do NOT import from src/ in serverless functions to avoid ESM/CJS issues on Vercel.
 */

export type ChannelType = 'EWALLET' | 'VIRTUAL_ACCOUNT' | 'QRIS' | 'CREDIT_CARD' | 'OVER_THE_COUNTER'

export interface ActivatedPaymentChannel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  channel_code?: string;
  available: boolean;
  processing_time?: string;
  popular?: boolean;
  min_amount: number;
  max_amount: number;
}

// Keep this list minimal and aligned with actual activated channels on Xendit
export const ACTIVATED_PAYMENT_CHANNELS: ActivatedPaymentChannel[] = [
  // QRIS - typically active
  {
    id: 'qris',
    name: 'QRIS',
    type: 'QRIS',
    channel_code: 'QRIS',
    available: true,
    processing_time: 'Instant',
    min_amount: 1000,
    max_amount: 10_000_000,
    popular: true,
  },
  // E-Wallets (only those you actually activated)
  {
    id: 'astrapay',
    name: 'AstraPay',
    type: 'EWALLET',
    channel_code: 'ASTRAPAY',
    available: true,
    processing_time: 'Instant',
    min_amount: 10_000,
    max_amount: 2_000_000,
    popular: true,
  },
  // Virtual Accounts
  { id: 'bni', name: 'BNI VA', type: 'VIRTUAL_ACCOUNT', channel_code: 'BNI', available: true, processing_time: '1-15 menit', min_amount: 1000, max_amount: 50_000_000, popular: true },
  { id: 'bri', name: 'BRI VA', type: 'VIRTUAL_ACCOUNT', channel_code: 'BRI', available: true, processing_time: '1-15 menit', min_amount: 1000, max_amount: 50_000_000 },
  { id: 'mandiri', name: 'Mandiri VA', type: 'VIRTUAL_ACCOUNT', channel_code: 'MANDIRI', available: true, processing_time: '1-15 menit', min_amount: 1000, max_amount: 50_000_000 },
  { id: 'bsi', name: 'BSI VA', type: 'VIRTUAL_ACCOUNT', channel_code: 'BSI', available: true, processing_time: '1-15 menit', min_amount: 1000, max_amount: 50_000_000 },
  { id: 'permata', name: 'Permata VA', type: 'VIRTUAL_ACCOUNT', channel_code: 'PERMATA', available: true, processing_time: '1-15 menit', min_amount: 1000, max_amount: 50_000_000 },
  // Over the counter
  { id: 'indomaret', name: 'Indomaret', type: 'OVER_THE_COUNTER', channel_code: 'INDOMARET', available: true, processing_time: 'Instant setelah bayar', min_amount: 10_000, max_amount: 2_500_000, popular: true },
];

export function getActivatedPaymentChannels(): ActivatedPaymentChannel[] {
  return ACTIVATED_PAYMENT_CHANNELS.filter((c) => c.available);
}

export function getXenditChannelCode(paymentMethodId: string): string {
  const channel = ACTIVATED_PAYMENT_CHANNELS.find((c) => c.id === paymentMethodId);
  return channel?.channel_code || paymentMethodId.toUpperCase();
}

export function isChannelActivated(paymentMethodId: string): boolean {
  return getActivatedPaymentChannels().some((c) => c.id === paymentMethodId);
}
