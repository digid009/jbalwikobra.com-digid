/**
 * PurchaseActions - Action buttons for purchase/rental forms
 * Handles terms acceptance, loading states, and action buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import { PNButton, PNText } from '../ui/PinkNeonDesignSystem';

interface PurchaseActionsProps {
  checkoutType: 'purchase' | 'rental';
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  creatingInvoice: boolean;
  isFormValid: boolean;
  onCheckout: () => void;
  onWhatsAppRental: () => void;
  onCancel: () => void;
}

export const PurchaseActions = React.memo(({
  checkoutType,
  acceptedTerms,
  setAcceptedTerms,
  creatingInvoice,
  isFormValid,
  onCheckout,
  onWhatsAppRental,
  onCancel
}: PurchaseActionsProps) => {
  const isPurchase = checkoutType === 'purchase';
  const canProceed = isPurchase ? (acceptedTerms && isFormValid && !creatingInvoice) : isFormValid;

  return (
    <div className="space-y-6">
      {/* Terms and Conditions for Purchase */}
      {isPurchase && (
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="sr-only"
              />
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                ${acceptedTerms 
                  ? 'bg-pink-500 border-pink-500' 
                  : 'border-gray-400 hover:border-pink-400'
                }
              `}>
                {acceptedTerms && <CheckCircle className="text-white" size={12} />}
              </div>
            </div>
            <div className="flex-1">
              <PNText className="text-sm leading-relaxed">
                Saya menyetujui{' '}
                <Link 
                  to="/terms" 
                  className="text-pink-400 underline hover:text-pink-300 transition-colors"
                  target="_blank" 
                  rel="noreferrer"
                >
                  Syarat & Ketentuan
                </Link>
                {' '}dan{' '}
                <Link 
                  to="/privacy" 
                  className="text-pink-400 underline hover:text-pink-300 transition-colors"
                  target="_blank" 
                  rel="noreferrer"
                >
                  Kebijakan Privasi
                </Link>
              </PNText>
            </div>
          </label>
        </div>
      )}

      {/* Security & Support Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-sm">
          <Shield className="text-green-400 flex-shrink-0" size={16} />
          <PNText className="text-gray-300">Pembayaran Aman</PNText>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MessageSquare className="text-blue-400 flex-shrink-0" size={16} />
          <PNText className="text-gray-300">Support 24/7</PNText>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <PNButton
          variant="ghost"
          size="lg"
          onClick={onCancel}
          className="flex-1 border border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Batal
        </PNButton>

        {isPurchase ? (
          <PNButton
            variant="primary"
            size="lg"
            onClick={onCheckout}
            disabled={!canProceed}
            className={`flex-1 flex items-center justify-center space-x-2 ${
              canProceed 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {creatingInvoice && (
              <Loader className="animate-spin" size={18} />
            )}
            <span>
              {creatingInvoice ? 'Memproses...' : 'Bayar Sekarang'}
            </span>
          </PNButton>
        ) : (
          <PNButton
            variant="primary"
            size="lg"
            onClick={onWhatsAppRental}
            disabled={!isFormValid}
            className={`flex-1 flex items-center justify-center space-x-2 ${
              isFormValid
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <MessageSquare size={18} />
            <span>Lanjut ke WhatsApp</span>
          </PNButton>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <PNText className="text-xs text-gray-400">
          {isPurchase 
            ? 'Setelah pembayaran berhasil, Tim kami akan menghubungi Anda via WhatsApp untuk proses selanjutnya'
            : 'Tim kami akan menghubungi Anda via WhatsApp untuk mengatur rental'
          }
        </PNText>
      </div>
    </div>
  );
});

PurchaseActions.displayName = 'PurchaseActions';
