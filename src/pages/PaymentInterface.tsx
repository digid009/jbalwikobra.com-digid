/**
 * PaymentInterface - Pink Neon Design System Version
 * Following homepage design patterns with countdown timer
 * Mobile-first responsive design with professional animations
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CreditCard, ArrowLeft, QrCode, Shield, Smartphone, CheckCircle, AlertTriangle, Zap, Star } from 'lucide-react';
import { PNContainer, PNCard, PNHeading, PNText, PNButton, PNSection, PNSectionHeader } from '../components/ui/PinkNeonDesignSystem';
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
  qr_string?: string;
  description?: string;
}

const PaymentInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const paymentId = searchParams.get('id');
  const paymentMethod = searchParams.get('method');

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setError('Payment ID tidak ditemukan');
      setLoading(false);
      return;
    }
    fetchPaymentData();
  }, [paymentId]);

  // Payment status polling - check every 10 seconds for payment completion
  useEffect(() => {
    if (!paymentData || paymentData.status === 'PAID' || paymentData.status === 'SUCCEEDED') {
      return; // Don't poll if already paid or no payment data
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if payment is completed
          if (data.status === 'PAID' || data.status === 'SUCCEEDED') {
            console.log('Payment completed! Redirecting to success page...');
            clearInterval(pollInterval);
            navigate(`/payment-status?status=success&id=${encodeURIComponent(paymentId)}`);
            return;
          }
          
          // Update payment data if status changed
          if (data.status !== paymentData.status) {
            setPaymentData(data);
          }
        }
      } catch (error) {
        console.error('Payment status polling error:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [paymentData, paymentId, navigate]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
      if (!response.ok) throw new Error('Payment not found');
      const data = await response.json();
      
      // Check if payment is already completed
      if (data.status === 'PAID' || data.status === 'SUCCEEDED') {
        console.log('Payment already completed! Redirecting to success page...');
        navigate(`/payment-status?status=success&id=${encodeURIComponent(paymentId)}`);
        return;
      }
      
      setPaymentData(data);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
      setError('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
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
    if (!paymentData?.expiry_date) return 'Tidak ada batas waktu';
    
    const now = currentTime.getTime();
    const expiry = new Date(paymentData.expiry_date).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Kedaluwarsa';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const isTimeRunningOut = () => {
    if (!paymentData?.expiry_date) return false;
    const now = currentTime.getTime();
    const expiry = new Date(paymentData.expiry_date).getTime();
    const diff = expiry - now;
    return diff > 0 && diff <= 5 * 60 * 1000; // 5 minutes
  };

  // Check for expiry
  useEffect(() => {
    if (!paymentData?.expiry_date) return;
    
    const now = currentTime.getTime();
    const expiry = new Date(paymentData.expiry_date).getTime();
    
    if (now >= expiry) {
      navigate(`/payment-status?status=expired&id=${encodeURIComponent(paymentData.id)}`);
    }
  }, [currentTime, paymentData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PNContainer>
          <div className="text-center">
            {/* Enhanced Loading Animation */}
            <div className="relative mb-8">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-pink-500/20"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full flex items-center justify-center">
                  <CreditCard className="text-white" size={24} />
                </div>
              </div>
            </div>
            <PNHeading level={2} gradient className="mb-4">Memuat Pembayaran</PNHeading>
            <PNText color="muted">Menyiapkan interface pembayaran Anda...</PNText>
          </div>
        </PNContainer>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PNContainer>
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-white" size={32} />
            </div>
            <PNHeading level={1} className="text-red-400 mb-4">Terjadi Kesalahan</PNHeading>
            <PNText className="mb-8" color="muted">{error || 'Payment data tidak ditemukan'}</PNText>
            <PNButton onClick={() => navigate('/')} size="lg" fullWidth>
              <ArrowLeft size={18} className="mr-2" />
              Kembali ke Beranda
            </PNButton>
          </div>
        </PNContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PNContainer>
        
        {/* Pink Neon Header Section */}
        <PNSection padding="md">
          <PNCard className="p-6 mb-8">
            <div className="flex items-center justify-between">
              {/* Back Button with Pink Accent */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 group"
              >
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl group-hover:bg-pink-500/20 group-hover:border-pink-500/50 transition-all">
                  <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Kembali</span>
              </button>

              {/* Enhanced Countdown Timer */}
              {paymentData.expiry_date && (
                <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  isTimeRunningOut() 
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50 shadow-lg shadow-red-500/25' 
                    : 'bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/50 shadow-lg shadow-pink-500/25'
                }`}>
                  <div className="flex items-center space-x-4 px-6 py-4">
                    <div className={`relative p-2 rounded-xl ${isTimeRunningOut() ? 'bg-red-500' : 'bg-pink-500'}`}>
                      <Clock size={20} className="text-white" />
                      {isTimeRunningOut() && (
                        <div className="absolute inset-0 bg-red-400 rounded-xl animate-ping opacity-50"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-300 mb-1">Sisa Waktu Pembayaran</div>
                      <div className={`font-mono font-bold text-xl ${isTimeRunningOut() ? 'text-red-300' : 'text-white'}`}>
                        {getTimeRemaining()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PNCard>
        </PNSection>

        {/* Warning Banner for Time Running Out */}
        {isTimeRunningOut() && (
          <PNSection padding="sm">
            <div className="relative overflow-hidden bg-gradient-to-r from-red-500/20 via-pink-500/20 to-red-500/20 border border-red-500/50 rounded-2xl p-6 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-pink-600/10 animate-pulse"></div>
              <div className="relative flex items-center space-x-4">
                <div className="p-3 bg-red-500 rounded-xl">
                  <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                  <PNHeading level={3} className="text-red-300 mb-2">⚠️ Waktu Hampir Habis!</PNHeading>
                  <PNText className="text-red-200">Segera selesaikan pembayaran sebelum kedaluwarsa</PNText>
                </div>
              </div>
            </div>
          </PNSection>
        )}

        {/* Payment Summary Card - Pink Neon Style */}
        <PNSection padding="md">
          <PNCard className="p-8 mb-8 relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-fuchsia-500/5"></div>
            
            <div className="relative text-center space-y-6">
              {/* Icon with Gradient Background */}
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 mx-auto">
                  <CreditCard className="text-white" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star size={14} className="text-white" />
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-3">
                <div className="text-sm text-pink-300/80 font-medium tracking-wide">JBalwikobra Payment</div>
                <PNHeading level={1} gradient className="text-4xl font-extrabold">
                  {formatCurrency(paymentData.amount)}
                </PNHeading>
                <PNText className="text-lg max-w-md mx-auto">{paymentData.description}</PNText>
              </div>
              
              {/* Status Badge */}
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-yellow-300 px-6 py-3 rounded-2xl backdrop-blur-sm">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Menunggu Pembayaran</span>
              </div>

              {/* Payment Method Info */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <QrCode size={16} />
                <span>Metode: {(paymentMethod || paymentData.payment_method || 'QRIS').toUpperCase()}</span>
              </div>
            </div>
          </PNCard>
        </PNSection>

        {/* Enhanced QR Code Section */}
        {paymentData.qr_string && (
          <PNSection padding="md">
            <PNCard className="p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5"></div>
              
              <div className="relative">
                {/* Section Header with Pink Neon Style */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-2xl">
                      <QrCode className="text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <PNHeading level={2} gradient>Scan QR Code QRIS</PNHeading>
                      <PNText color="muted" className="text-sm">Bayar dengan aplikasi e-wallet atau mobile banking</PNText>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced QR Code Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-pink-500/10 border-4 border-pink-500/20">
                      <QRCode 
                        value={paymentData.qr_string} 
                        size={280}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Step-by-Step Instructions */}
                <div className="max-w-lg mx-auto">
                  <PNHeading level={3} className="text-center mb-6 text-white">Cara Pembayaran</PNHeading>
                  
                  <div className="space-y-4">
                    {[
                      { icon: Smartphone, text: "Buka aplikasi e-wallet atau mobile banking Anda" },
                      { icon: QrCode, text: "Pilih menu Scan QR Code atau QRIS" },
                      { icon: Zap, text: "Arahkan kamera ke QR code di atas" },
                      { icon: CheckCircle, text: `Konfirmasi pembayaran sebesar ${formatCurrency(paymentData.amount)}` }
                    ].map((step, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-3 flex-1">
                          <step.icon size={20} className="text-pink-400 flex-shrink-0" />
                          <PNText className="text-sm leading-relaxed">{step.text}</PNText>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PNCard>
          </PNSection>
        )}

        {/* Enhanced Footer Section */}
        <PNSection padding="md">
          <div className="text-center space-y-6">
            {/* Security & Features Icons */}
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2 text-green-400">
                <Shield size={18} />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Zap size={18} />
                <span className="text-sm font-medium">Real-time Update</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Auto Redirect</span>
              </div>
            </div>
            
            {/* Footer Text */}
            <PNText color="muted" className="text-center">
              Halaman ini akan otomatis terupdate ketika pembayaran berhasil
            </PNText>
            
            {/* Branding */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-pink-300/60 font-medium tracking-wide">
                Powered by JBalwikobra × Xendit
              </div>
            </div>
          </div>
        </PNSection>

      </PNContainer>
    </div>
  );
};

export default PaymentInterface;