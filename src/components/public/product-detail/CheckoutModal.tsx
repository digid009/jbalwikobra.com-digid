import React from 'react';
import { Link } from 'react-router-dom';
import PhoneInput from '../../../components/PhoneInput';
import { Info, Calendar } from 'lucide-react';
import { RentalOption } from '../../../types';

interface Customer { name: string; email: string; phone: string; }

interface Props {
  visible: boolean;
  onClose: () => void;
  checkoutType: 'purchase' | 'rental';
  productName: string;
  effectivePrice: number;
  selectedRental: RentalOption | null;
  customer: Customer;
  setCustomer: (c: Customer) => void;
  isPhoneValid: boolean;
  setIsPhoneValid: (v: boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;
  creatingInvoice: boolean;
  onCheckout: () => void;
  onWhatsAppRental: () => void;
}

const CheckoutModal: React.FC<Props> = ({
  visible,
  onClose,
  checkoutType,
  productName,
  effectivePrice,
  selectedRental,
  customer,
  setCustomer,
  isPhoneValid,
  setIsPhoneValid,
  acceptedTerms,
  setAcceptedTerms,
  creatingInvoice,
  onCheckout,
  onWhatsAppRental
}) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-gray-700 rounded-xl max-w-md w-full p-6 text-white modal-mobile overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {checkoutType === 'purchase' ? 'Beli Akun' : 'Rental Akun'}
        </h3>
        <div className="mb-4 p-4 bg-black border border-gray-700 rounded-lg">
          <p className="font-medium text-white">{productName}</p>
          <p className="text-pink-400 font-semibold">
            {checkoutType === 'rental' && selectedRental
              ? `${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedRental.price)} (${selectedRental.duration})`
              : Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(effectivePrice)}
          </p>
        </div>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); onCheckout(); }}>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={customer.name}
              onChange={e => setCustomer({ ...customer, name: e.target.value })}
              className="w-full px-3 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[44px]"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email *</label>
            <input
              type="email"
              required
              value={customer.email}
              onChange={e => setCustomer({ ...customer, email: e.target.value })}
              className="w-full px-3 border border-gray-700 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[44px]"
              placeholder="Masukkan email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">No. WhatsApp *</label>
            <PhoneInput
              value={customer.phone}
              onChange={(value) => setCustomer({ ...customer, phone: value })}
              onValidationChange={setIsPhoneValid}
              placeholder="Masukkan Nomor WhatsApp"
              required
              disableAutoDetection
            />
          </div>
          {checkoutType === 'purchase' && (
            <div className="p-3 bg-black border border-gray-700 rounded-lg flex items-start space-x-2 text-white/70 text-sm">
              <Info size={16} className="mt-0.5" />
              <span>Pembayaran aman dan terjamin. Detail akan dikirim via WhatsApp setelah pembayaran berhasil.</span>
            </div>
          )}
          {checkoutType === 'rental' && (
            <div className="p-3 bg-black border border-gray-700 rounded-lg flex items-start space-x-2 text-white/70 text-sm">
              <Calendar size={16} className="mt-0.5" />
              <span>Akses rental diberikan melalui WhatsApp.</span>
            </div>
          )}
          {checkoutType === 'purchase' && (
            <label className="flex items-start space-x-2 text-sm text-white/70 min-h-[44px]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-pink-600 border-gray-700 bg-black rounded"
              />
              <span>
                Saya menyetujui <Link to="/terms" className="text-pink-400 underline hover:text-pink-300" target="_blank" rel="noreferrer">Syarat & Ketentuan</Link>
              </span>
            </label>
          )}
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 border border-gray-700 text-white/70 rounded-lg hover:bg-black transition-colors min-h-[44px]">Batal</button>
            {checkoutType === 'purchase' ? (
              <button
                type="submit"
                disabled={!acceptedTerms || creatingInvoice}
                className={`flex-1 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] ${acceptedTerms && !creatingInvoice ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              >
                {creatingInvoice && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                {creatingInvoice ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            ) : (
              <button type="button" onClick={onWhatsAppRental} className="flex-1 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px]">Lanjut ke WhatsApp</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
