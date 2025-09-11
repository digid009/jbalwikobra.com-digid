import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { isLoggedIn } from '../services/authService';
import { standardClasses, cn } from '../styles/standardClasses';

type Order = {
  id: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  amount: number;
  created_at: string;
  xendit_invoice_id?: string | null;
  xendit_invoice_url?: string | null;
  currency?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  payment_channel?: string | null;
  payer_email?: string | null;
};

const PaymentStatusPage: React.FC = () => {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = params.get('order_id');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const ok = await isLoggedIn();
      setAuthed(ok);
      if (!supabase) { setLoading(false); return; }
      if (orderId) {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
        setOrder(data as any);
        setLoading(false);
        return;
      }
      // Fallback: show latest order for logged-in user
      if (ok) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        setOrder((data && data[0]) as any);
      }
      setLoading(false);
    };
    run();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-background text-ios-text px-6">
        <div className="w-full max-w-md">
          <div className="ios-skeleton h-6 w-60 mb-4"></div>
          <div className="ios-skeleton h-4 w-full mb-2"></div>
          <div className="ios-skeleton h-4 w-5/6 mb-2"></div>
          <div className="ios-skeleton h-4 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-background text-ios-text px-4 with-bottom-nav">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-ios-text mb-4">Tidak ada detail order</h2>
          <p className="text-ios-text-secondary mb-6 text-sm sm:text-base">
            Jika pembayaran berhasil, Anda akan menerima email konfirmasi. 
            {authed ? ' Cek juga riwayat order Anda.' : ' Silakan login untuk melihat riwayat order.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {authed && (
              <Link 
                to="/orders" 
                className="bg-pink-600 text-white px-6 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-pink-700 transition-colors text-center"
              >
                Lihat Riwayat Order
              </Link>
            )}
            <Link 
              to="/" 
              className="border border-ios-border px-6 py-3 min-h-[44px] rounded-xl bg-ios-surface text-ios-text hover:bg-ios-surface/80 transition-colors text-center"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const map = {
    paid: { title: 'Pembayaran diterima', color: 'text-green-600', bg: 'bg-green-50' },
    completed: { title: 'Transaksi selesai', color: 'text-green-700', bg: 'bg-green-50' },
    pending: { title: 'Menunggu pembayaran', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    cancelled: { title: 'Transaksi dibatalkan/expired', color: 'text-red-600', bg: 'bg-red-50' },
  } as const;

  const style = map[order.status];

  return (
    <div className="min-h-screen bg-ios-background text-ios-text with-bottom-nav">
      <div className={standardClasses.container.boxed}>
        <div className="bg-ios-surface border border-ios-border rounded-2xl p-6 sm:p-8 shadow-lg">
          <h1 className={`text-xl sm:text-2xl font-bold mb-4 ${style.color}`}>{style.title}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <span className="text-ios-text-secondary text-sm">Order ID:</span>
              <span className="font-mono text-sm sm:text-base">{order.id}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <span className="text-ios-text-secondary text-sm">Total Pembayaran:</span>
              <span className="font-bold text-lg text-ios-text">Rp {Number(order.amount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-ios-bg-secondary rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-ios-text mb-3">Detail Pembayaran</h3>
            <div className="space-y-2 text-sm">
              {order.payment_channel && (
                <div className="flex justify-between">
                  <span className="text-ios-text-secondary">Metode:</span>
                  <span className="font-medium capitalize">{order.payment_channel.toLowerCase().replace(/_/g,' ')}</span>
                </div>
              )}
              {order.payer_email && (
                <div className="flex justify-between">
                  <span className="text-ios-text-secondary">Email:</span>
                  <span className="font-medium">{order.payer_email}</span>
                </div>
              )}
              {order.xendit_invoice_id && (
                <div className="flex justify-between">
                  <span className="text-ios-text-secondary">Invoice ID:</span>
                  <span className="font-mono text-xs">{order.xendit_invoice_id}</span>
                </div>
              )}
              {order.expires_at && (
                <div className="flex justify-between">
                  <span className="text-ios-text-secondary">Expired:</span>
                  <span className="font-medium">{new Date(order.expires_at).toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-ios-text-secondary">Dibayar:</span>
                  <span className="font-medium">{new Date(order.paid_at).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {order.xendit_invoice_url && order.status === 'pending' && (
              <a 
                href={order.xendit_invoice_url} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-pink-600 text-white px-6 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-pink-700 transition-colors text-center"
              >
                Bayar Sekarang
              </a>
            )}
            <Link 
              to="/products" 
              className="bg-ios-accent text-white px-6 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-ios-accent/90 transition-colors text-center"
            >
              Lanjut Belanja
            </Link>
            <Link 
              to="/" 
              className="border border-ios-border px-6 py-3 min-h-[44px] rounded-xl bg-ios-surface text-ios-text hover:bg-ios-surface/80 transition-colors text-center"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
