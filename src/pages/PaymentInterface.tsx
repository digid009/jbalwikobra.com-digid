/**
 * PaymentInterface - Shows specific payment method interfaces
 * Handles QRIS QR codes, Virtual Account details, E-Wallet redirects, etc.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Copy, Clock, CreditCard, Building2, Smartphone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { PNContainer, PNCard, PNHeading, PNText, PNButton } from '../components/ui/PinkNeonDesignSystem';
import QRCode from 'react-qr-code';

interface PaymentData {
  id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  external_id: string;
  created: string;
  expiry_date?: string;
  
  // QRIS specific
  qr_string?: string;
  qr_url?: string;
  
  // Virtual Account specific
  account_number?: string;
  bank_code?: string;
  
  // E-Wallet specific
  payment_url?: string;
  action_type?: string;
  
  // Retail specific
  payment_code?: string;
  retail_outlet?: string;
  
  // Order info
  description?: string;
}

const PaymentInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  const paymentId = searchParams.get('id');
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    if (!paymentId) {
      setError('Payment ID tidak ditemukan');
      setLoading(false);
      return;
    }

  fetchPaymentData();
  }, [paymentId]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Payment not found');
      }
      
      const data = await response.json();
      setPaymentData(data);

      // If payment already paid, show success state briefly then redirect
  if (data.status && ['PAID', 'paid', 'SETTLED', 'COMPLETED', 'completed', 'SUCCEEDED', 'SUCCESS'].includes(String(data.status).toUpperCase())) {
        setJustPaid(true);
        setTimeout(() => {
          navigate(`/payment-status?status=success&id=${encodeURIComponent(data.id)}`);
        }, 2500);
        return;
      }

      // Start polling until paid
      if (!polling) {
        setPolling(true);
        const interval = setInterval(async () => {
          try {
            const r = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
            if (r.ok) {
              const d = await r.json();
              setPaymentData(d);
              if (d.status && ['PAID', 'paid', 'SETTLED', 'COMPLETED', 'completed', 'SUCCEEDED', 'SUCCESS'].includes(String(d.status).toUpperCase())) {
                clearInterval(interval);
                setJustPaid(true);
                setTimeout(() => {
                  navigate(`/payment-status?status=success&id=${encodeURIComponent(d.id)}`);
                }, 2500);
              }
            }
          } catch {}
        }, 5000);

        // cleanup
        return () => clearInterval(interval);
      }
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
      setError('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      setCopying(type);
      await navigator.clipboard.writeText(text);
      setTimeout(() => setCopying(null), 2000);
    } catch (err) {
      alert('Gagal menyalin');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTimeRemaining = () => {
    if (!paymentData?.expiry_date) return null;
    
    const now = new Date().getTime();
    const expiry = new Date(paymentData.expiry_date).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Kedaluwarsa';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}j ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <PNText>Memuat pembayaran...</PNText>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PNContainer>
          <div className="text-center">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <PNHeading level={2} className="mb-4">Pembayaran Tidak Ditemukan</PNHeading>
            <PNText className="mb-6">{error}</PNText>
            <PNButton onClick={() => navigate('/')}>Kembali ke Beranda</PNButton>
          </div>
        </PNContainer>
      </div>
    );
  }

  const renderPaymentMethod = () => {
    const method = (paymentMethod || paymentData.payment_method || '').toLowerCase();

  // QRIS Payment
    if (method === 'qris' && (paymentData.qr_string || paymentData.qr_url)) {
      const qrValue = paymentData.qr_string || paymentData.qr_url || '';
      return (
        <PNCard className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <QrCode className="text-orange-400" size={24} />
            <PNHeading level={3}>Scan QR Code QRIS</PNHeading>
          </div>

          <div className="bg-white p-4 rounded-xl inline-block mx-auto">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {qrValue.startsWith('data:image') ? (
                <img
                  src={qrValue}
                  alt="QRIS QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QRCode value={qrValue} size={240} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <PNText className="text-sm text-gray-300">
              Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS
            </PNText>
            <PNText className="text-sm text-gray-300">
              Scan QR code di atas untuk melakukan pembayaran
            </PNText>
          </div>
        </PNCard>
      );
    }

    // Virtual Account Payment
  if (['bca', 'bni', 'mandiri', 'bri', 'cimb', 'permata', 'bjb', 'bsi'].includes(method) && paymentData.account_number) {
      const bankName = {
        bca: 'BCA',
        bni: 'BNI',
        mandiri: 'Mandiri',
        bri: 'BRI',
    cimb: 'CIMB Niaga',
    permata: 'Permata',
    bjb: 'BJB',
    bsi: 'BSI'
      }[method] || method.toUpperCase();

      return (
        <PNCard className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="text-blue-400" size={24} />
            <PNHeading level={3}>Transfer Bank {bankName}</PNHeading>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <PNText className="text-sm text-gray-300">Nomor Virtual Account:</PNText>
              <div className="flex items-center space-x-2">
                <PNText className="font-mono text-lg font-bold">{paymentData.account_number}</PNText>
                <button
                  onClick={() => copyToClipboard(paymentData.account_number!, 'va')}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  {copying === 'va' ? (
                    <CheckCircle className="text-green-400" size={16} />
                  ) : (
                    <Copy className="text-gray-400" size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <PNText className="text-sm text-gray-300">Jumlah Transfer:</PNText>
              <PNText className="font-bold text-lg">{formatCurrency(paymentData.amount)}</PNText>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <PNText>Cara transfer:</PNText>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Buka aplikasi mobile banking atau ATM {bankName}</li>
              <li>Pilih menu Transfer / Transfer Virtual Account</li>
              <li>Masukkan nomor Virtual Account di atas</li>
              <li>Masukkan jumlah transfer sesuai nominal</li>
              <li>Konfirmasi dan selesaikan pembayaran</li>
            </ol>
          </div>
        </PNCard>
      );
    }

    // E-Wallet Payment
    if (['dana', 'gopay', 'linkaja', 'shopeepay', 'ovo'].includes(method) && paymentData.payment_url) {
      const walletName = {
        dana: 'DANA',
        gopay: 'GoPay',
        linkaja: 'LinkAja',
        shopeepay: 'ShopeePay',
        ovo: 'OVO'
      }[method] || method.toUpperCase();

      return (
        <PNCard className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Smartphone className="text-green-400" size={24} />
            <PNHeading level={3}>Pembayaran {walletName}</PNHeading>
          </div>

          <div className="space-y-4">
            <PNText className="text-gray-300">
              Klik tombol di bawah untuk melanjutkan pembayaran melalui aplikasi {walletName}
            </PNText>

            <PNButton
              onClick={() => window.open(paymentData.payment_url, '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
              size="lg"
            >
              Buka {walletName}
            </PNButton>

            <PNText className="text-sm text-gray-400">
              Anda akan diarahkan ke aplikasi {walletName} untuk menyelesaikan pembayaran
            </PNText>
          </div>
        </PNCard>
      );
    }

    // Fallback for unknown payment methods
    return (
      <PNCard className="text-center space-y-4">
        <CreditCard className="text-gray-400 mx-auto" size={48} />
        <PNHeading level={3}>Metode Pembayaran: {paymentData.payment_method.toUpperCase()}</PNHeading>
        <PNText className="text-gray-300">
          Silakan ikuti instruksi pembayaran yang diberikan
        </PNText>
      </PNCard>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PNContainer className="py-6">
        {justPaid && (
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Pembayaran berhasil! Mengarahkan...</span>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          {paymentData.expiry_date && (
            <div className="flex items-center space-x-2 text-orange-400">
              <Clock size={16} />
              <span className="text-sm">{getTimeRemaining()}</span>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <PNCard className="mb-6">
          <div className="text-center space-y-2">
            <PNHeading level={2}>Pembayaran</PNHeading>
            <PNText className="text-2xl font-bold text-pink-400">{formatCurrency(paymentData.amount)}</PNText>
            <PNText className="text-sm text-gray-300">{paymentData.description}</PNText>
            <div className="inline-flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Menunggu Pembayaran</span>
            </div>
          </div>
        </PNCard>

        {/* Payment Method Interface */}
        {renderPaymentMethod()}

        {/* Footer Info */}
        <PNCard className="mt-6 bg-gray-800/50">
          <div className="text-center space-y-2">
            <PNText className="text-sm text-gray-300">
              Pembayaran akan dikonfirmasi secara otomatis
            </PNText>
            <PNText className="text-xs text-gray-400">
              Halaman ini akan diperbarui setelah pembayaran berhasil
            </PNText>
            <PNText className="text-xs text-gray-400">
              Butuh bantuan? Hubungi customer service kami
            </PNText>
          </div>
        </PNCard>
      </PNContainer>
    </div>
  );
};

export default PaymentInterface;
