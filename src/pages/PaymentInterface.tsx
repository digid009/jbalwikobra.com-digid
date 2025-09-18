/**
 * PaymentInterface - Simple version with working countdown timer
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CreditCard, ArrowLeft } from 'lucide-react';
import { PNContainer, PNHeading, PNText, PNButton } from '../components/ui/PinkNeonDesignSystem';
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

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/xendit/get-payment?id=${paymentId}`);
      if (!response.ok) throw new Error('Payment not found');
      const data = await response.json();
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
        <div className="text-center">
          <PNHeading level={1} className="text-red-400 mb-4">Terjadi Kesalahan</PNHeading>
          <PNText className="mb-6">{error || 'Payment data tidak ditemukan'}</PNText>
          <PNButton onClick={() => navigate('/')}>Kembali ke Beranda</PNButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PNContainer className="py-8">
        
        {/* Header with Back Button and Timer */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          {/* COUNTDOWN TIMER - VISIBLE AND WORKING */}
          {paymentData.expiry_date && (
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-lg border ${
              isTimeRunningOut() 
                ? 'bg-red-900/50 text-red-300 border-red-500' 
                : 'bg-blue-900/50 text-blue-300 border-blue-500'
            }`}>
              <Clock size={20} />
              <div className="text-center">
                <div className="text-sm font-medium">Sisa Waktu</div>
                <div className="font-mono font-bold text-xl">
                  {getTimeRemaining()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warning for time running out */}
        {isTimeRunningOut() && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <div className="flex items-center space-x-3 text-red-300">
              <Clock size={24} />
              <div>
                <div className="font-bold text-lg">⚠️ Waktu Hampir Habis!</div>
                <div className="text-sm">Segera selesaikan pembayaran sebelum kedaluwarsa</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="text-white" size={24} />
            </div>
            
            <div>
              <PNHeading level={2} className="text-gray-100 mb-2">Total Pembayaran</PNHeading>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(paymentData.amount)}
              </div>
              <PNText className="text-gray-300">{paymentData.description}</PNText>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg border border-yellow-500/30">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm">Menunggu Pembayaran</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {paymentData.qr_string && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center space-y-6">
              <PNHeading level={3} className="text-white mb-4">Scan QR Code QRIS</PNHeading>
              
              <div className="bg-white p-6 rounded-lg inline-block">
                <QRCode value={paymentData.qr_string} size={250} />
              </div>
              
              <div className="text-left max-w-md mx-auto space-y-3">
                <div className="text-sm text-gray-300 space-y-2">
                  <div>1. Buka aplikasi e-wallet atau mobile banking</div>
                  <div>2. Pilih menu Scan QR Code atau QRIS</div>
                  <div>3. Arahkan kamera ke QR code di atas</div>
                  <div>4. Konfirmasi pembayaran sebesar <span className="font-bold text-pink-400">{formatCurrency(paymentData.amount)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <div className="mb-2">🔒 Pembayaran Aman</div>
          <div>Halaman ini akan otomatis terupdate ketika pembayaran berhasil</div>
        </div>

      </PNContainer>
    </div>
  );
};

export default PaymentInterface;