/**
 * Payment Channel Configuration
 * Only include payment methods that are activated on your Xendit account
 * Update this configuration based on your actual Xendit dashboard activation status
 */

export interface ActivatedPaymentChannel {
  id: string;
  name: string;
  type: 'EWALLET' | 'VIRTUAL_ACCOUNT' | 'QRIS' | 'CREDIT_CARD' | 'OVER_THE_COUNTER';
  description: string;
  channel_code?: string; // Xendit channel code for API calls
  available: boolean;
  processing_time: string;
  popular?: boolean;
  min_amount: number;
  max_amount: number;
  icon?: string;
}

/**
 * ACTIVATED PAYMENT CHANNELS ONLY
 * Update this list to match your actual Xendit account activations
 * Remove or set available: false for channels not activated on your account
 */
export const ACTIVATED_PAYMENT_CHANNELS: ActivatedPaymentChannel[] = [
  // E-Wallets - ONLY ACTIVATED CHANNELS FROM YOUR XENDIT DASHBOARD
  {
    id: 'astrapay',
    name: 'AstraPay',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan AstraPay',
    channel_code: 'ID_ASTRAPAY',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: true,
    min_amount: 10000,
    max_amount: 10000000,
    icon: '💳'
  },
  // DISABLED E-WALLETS - NOT ACTIVATED ON YOUR ACCOUNT
  {
    id: 'ovo',
    name: 'OVO',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan OVO',
    channel_code: 'ID_OVO',
    available: false, // NOT ACTIVATED ❌
    processing_time: 'Instant',
    popular: false,
    min_amount: 10000,
    max_amount: 10000000,
    icon: '🟡'
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan DANA',
    channel_code: 'ID_DANA',
    available: false, // NOT ACTIVATED ❌
    processing_time: 'Instant',
    popular: false,
    min_amount: 10000,
    max_amount: 10000000,
    icon: '🔵'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan ShopeePay',
    channel_code: 'ID_SHOPEEPAY',
    available: false, // NOT ACTIVATED ❌
    processing_time: 'Instant',
    popular: false,
    min_amount: 10000,
    max_amount: 10000000,
    icon: '🟠'
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan LinkAja',
    channel_code: 'ID_LINKAJA',
    available: false, // NOT ACTIVATED ❌
    processing_time: 'Instant',
    min_amount: 10000,
    max_amount: 10000000,
    icon: '🔴'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'EWALLET',
    description: 'Pembayaran instant dengan GoPay',
    channel_code: 'GOPAY',
    available: false, // NOT ACTIVATED ❌
    processing_time: 'Instant',
    min_amount: 10000,
    max_amount: 2000000,
    icon: '🟢'
  },

  // QRIS - Usually activated by default
  {
    id: 'qris',
    name: 'QRIS',
    type: 'QRIS',
    description: 'Scan QR Code untuk bayar',
    channel_code: 'QRIS',
    available: true, // Usually activated by default
    processing_time: 'Instant',
    popular: true,
    min_amount: 1000,
    max_amount: 10000000,
    icon: '📱'
  },

  // Virtual Accounts - ONLY ACTIVATED CHANNELS FROM YOUR XENDIT DASHBOARD
  {
    id: 'bjb',
    name: 'BJB Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BJB',
    channel_code: 'BJB',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: false,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🏦'
  },
  {
    id: 'bni',
    name: 'BNI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BNI',
    channel_code: 'BNI',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: true,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🟡'
  },
  {
    id: 'bri',
    name: 'BRI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BRI',
    channel_code: 'BRI',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: true,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '�'
  },
  {
    id: 'bsi',
    name: 'BSI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BSI',
    channel_code: 'BSI',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: false,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🟢'
  },
  {
    id: 'cimb',
    name: 'CIMB Niaga Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account CIMB Niaga',
    channel_code: 'CIMB',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: false,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🔴'
  },
  {
    id: 'mandiri',
    name: 'Mandiri Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account Mandiri',
    channel_code: 'MANDIRI',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: true,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '�'
  },
  {
    id: 'permata',
    name: 'Permata Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account Permata',
    channel_code: 'PERMATA',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: false,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🟣'
  },
  // DISABLED VIRTUAL ACCOUNTS - NOT ACTIVATED ON YOUR ACCOUNT
  {
    id: 'bca',
    name: 'BCA Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BCA',
    channel_code: 'BCA',
    available: false, // NOT ACTIVATED ❌
    processing_time: '1-15 menit',
    popular: false,
    min_amount: 10000,
    max_amount: 50000000,
    icon: '🔵'
  },

  // Over-The-Counter - ONLY ACTIVATED CHANNELS
  {
    id: 'indomaret',
    name: 'Indomaret',
    type: 'OVER_THE_COUNTER',
    description: 'Bayar di Indomaret terdekat',
    channel_code: 'INDOMARET',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant setelah bayar',
    popular: true,
    min_amount: 10000,
    max_amount: 5000000,
    icon: '🏪'
  },

  // PayLater - ONLY ACTIVATED CHANNELS
  {
    id: 'akulaku',
    name: 'Akulaku',
    type: 'OVER_THE_COUNTER',
    description: 'Bayar nanti dengan Akulaku',
    channel_code: 'AKULAKU',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: false,
    min_amount: 50000,
    max_amount: 10000000,
    icon: '�'
  },

  // Credit Card - Usually activated by default
  {
    id: 'credit_card',
    name: 'Kartu Kredit/Debit',
    type: 'CREDIT_CARD',
    description: 'Visa, Mastercard, JCB',
    available: true, // Usually activated by default
    processing_time: 'Instant',
    min_amount: 10000,
    max_amount: 50000000,
    icon: '💳'
  }
];

/**
 * Get only activated payment channels
 */
export function getActivatedPaymentChannels(): ActivatedPaymentChannel[] {
  return ACTIVATED_PAYMENT_CHANNELS.filter(channel => channel.available);
}

/**
 * Get popular activated payment channels
 */
export function getPopularActivatedChannels(): ActivatedPaymentChannel[] {
  return getActivatedPaymentChannels().filter(channel => channel.popular);
}

/**
 * Get activated channels by type
 */
export function getActivatedChannelsByType(type: ActivatedPaymentChannel['type']): ActivatedPaymentChannel[] {
  return getActivatedPaymentChannels().filter(channel => channel.type === type);
}

/**
 * Check if a payment channel is activated
 */
export function isChannelActivated(channelId: string): boolean {
  const channel = ACTIVATED_PAYMENT_CHANNELS.find(ch => ch.id === channelId);
  return channel ? channel.available : false;
}

/**
 * Get Xendit channel code for a payment method
 */
export function getXenditChannelCode(paymentMethodId: string): string | null {
  const channel = ACTIVATED_PAYMENT_CHANNELS.find(ch => ch.id === paymentMethodId);
  return channel?.channel_code || null;
}

/**
 * Validate amount for a specific channel
 */
export function validateAmountForChannel(channelId: string, amount: number): boolean {
  const channel = ACTIVATED_PAYMENT_CHANNELS.find(ch => ch.id === channelId);
  if (!channel || !channel.available) return false;
  
  return amount >= channel.min_amount && amount <= channel.max_amount;
}

/**
 * IMPORTANT CONFIGURATION NOTES:
 * 
 * 1. UPDATE CHANNEL AVAILABILITY: 
 *    Set available: false for channels not activated on your Xendit account
 * 
 * 2. CHECK YOUR XENDIT DASHBOARD:
 *    Go to Settings > Payment Methods to see which channels are activated
 * 
 * 3. COMMON ACTIVATED CHANNELS:
 *    - QRIS (usually activated by default)
 *    - Credit Cards (usually activated by default)
 *    - OVO, DANA, ShopeePay (common e-wallets)
 *    - BCA, BNI, Mandiri VAs (common virtual accounts)
 * 
 * 4. LESS COMMON CHANNELS:
 *    - LinkAja, GoPay (may require special approval)
 *    - BRI, Permata, CIMB VAs (may not be activated by default)
 * 
 * 5. TO ACTIVATE MORE CHANNELS:
 *    Contact Xendit support or check your dashboard
 */
