/**
 * Payment Channel Configuration
 * Only include payment methods that are activated on your Xendit account
 * Update this configuration based on your actual X    channel_code: 'BCA_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: true,
    min_amount: 1000,
    max_amount: 500000000, // BCA VA limit: 500 million
    icon: '🔵'
  },shboard activation status
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
 * Updated to match exactly with Xendit dashboard activation status
 * All channels listed below are confirmed activated
 */
export const ACTIVATED_PAYMENT_CHANNELS: ActivatedPaymentChannel[] = [
  // E-Wallets - ONLY ACTIVATED CHANNELS
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
  // QRIS - ACTIVATED ✅
  {
    id: 'qris',
    name: 'QRIS',
    type: 'QRIS',
    description: 'Scan QR Code untuk bayar',
    channel_code: 'QRIS',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: true,
    min_amount: 1000,
    max_amount: 10000000,
    icon: '�'
  },

  // Virtual Accounts - ALL ACTIVATED CHANNELS FROM DASHBOARD ✅
  {
    id: 'bjb',
    name: 'BJB Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BJB',
    channel_code: 'BJB_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: false,
    min_amount: 1000,
    max_amount: 500000000,
    icon: '🟢'
  },

  {
    id: 'bni',
    name: 'BNI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BNI',
    channel_code: 'BNI_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: true,
    min_amount: 1000,
    max_amount: 500000000, // BNI VA limit: 500 million
    icon: '🟡'
  },
  {
    id: 'bri',
    name: 'BRI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BRI',
    channel_code: 'BRI_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: true,
    min_amount: 1000,
    max_amount: 1000000000, // BRI VA limit: 1 billion
    icon: '🔵'
  },
  {
    id: 'bsi',
    name: 'BSI Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account BSI',
    channel_code: 'BSI_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: false,
    min_amount: 1000,
    max_amount: 100000000, // BSI VA limit: 100 million
    icon: '🟢'
  },
  {
    id: 'cimb',
    name: 'CIMB Niaga Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account CIMB Niaga',
    channel_code: 'CIMB_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: false,
    min_amount: 1000,
    max_amount: 100000000, // CIMB VA limit: 100 million
    icon: '🔴'
  },
  {
    id: 'mandiri',
    name: 'Mandiri Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account Mandiri',
    channel_code: 'MANDIRI_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: '1-15 menit',
    popular: true,
    min_amount: 1000,
    max_amount: 500000000, // Mandiri VA limit: 500 million
    icon: '🟠'
  },
  {
    id: 'permata',
    name: 'Permata Virtual Account',
    type: 'VIRTUAL_ACCOUNT',
    description: 'Transfer melalui Virtual Account Permata',
    channel_code: 'PERMATA_VIRTUAL_ACCOUNT',
    available: true, // ACTIVATED ✅
    processing_time: 'Instant',
    popular: false,
    min_amount: 1000,
    max_amount: 100000000, // Permata VA limit: 100 million
    icon: '🟣'
  },
  // DISABLED VIRTUAL ACCOUNTS - NOT ACTIVATED ON YOUR ACCOUNT
  // BCA Virtual Account - REMOVED (not activated)
  // {
  //   id: 'bca',
  //   name: 'BCA Virtual Account',
  //   type: 'VIRTUAL_ACCOUNT',
  //   description: 'Transfer melalui Virtual Account BCA',
  //   channel_code: 'BCA_VIRTUAL_ACCOUNT',
  //   available: false, // NOT ACTIVATED ❌
  //   processing_time: '1-15 menit',
  //   popular: false,
  //   min_amount: 10000,
  //   max_amount: 500000000, // BCA VA limit: 500 million
  //   icon: '🔵'
  // },

  // Over-The-Counter - NEEDS FULL XENDIT ACTIVATION
  {
    id: 'indomaret',
    name: 'Indomaret',
    type: 'OVER_THE_COUNTER',
    description: 'Bayar di Indomaret terdekat',
    channel_code: 'INDOMARET',
    available: false, // NEEDS XENDIT SUPPORT ACTIVATION ⚠️
    processing_time: 'Instant setelah bayar',
    popular: true,
    min_amount: 10000,
    max_amount: 5000000,
    icon: '🏪'
  },

  // PayLater - NEEDS FULL XENDIT ACTIVATION
  {
    id: 'akulaku',
    name: 'Akulaku',
    type: 'OVER_THE_COUNTER', // PayLater treated as OTC for API
    description: 'Bayar nanti dengan Akulaku',
    channel_code: 'AKULAKU',
    available: false, // NEEDS XENDIT SUPPORT ACTIVATION ⚠️
    processing_time: 'Instant',
    popular: false,
    min_amount: 50000,
    max_amount: 10000000,
    icon: '💳'
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
    max_amount: 1000000000, // Updated to support high-value transactions
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
