import React, { useState, useMemo } from 'react';
import { Info, Calendar } from 'lucide-react';
import { RentalOption } from '../../../types';
import { PNSection } from '../../ui/PinkNeonDesignSystem';
import {
  PurchaseFormHeader,
  CustomerInfoForm,
  PaymentMethods,
  PurchaseActions
} from '../../purchase-form';

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
  onCheckout: (paymentMethod: string) => void;
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Handle payment method selection (don't redirect immediately)
  const handlePaymentMethodSelect = (methodId: string) => {
    console.log('Payment method selected:', methodId);
    setSelectedPaymentMethod(methodId);
    // Don't trigger form submission - wait for user to click "Bayar Sekarang"
  };

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      customer.name.trim().length > 0 &&
      customer.email.trim().length > 0 &&
      customer.phone.trim().length > 0 &&
      isPhoneValid &&
      acceptedTerms && // Both rental and purchase now require terms acceptance
      selectedPaymentMethod.trim().length > 0 // Payment method required for both rental and purchase
    );
  }, [customer, isPhoneValid, selectedPaymentMethod, checkoutType, acceptedTerms]);

  // Form errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    paymentMethod?: string;
    terms?: string;
  }>({});

  // Validate form on submit
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!customer.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    }
    
    if (!customer.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!customer.phone.trim()) {
      newErrors.phone = 'Nomor WhatsApp wajib diisi';
    } else if (!isPhoneValid) {
      newErrors.phone = 'Format nomor WhatsApp tidak valid';
    }

    if (!selectedPaymentMethod.trim()) {
      newErrors.paymentMethod = 'Pilih metode pembayaran';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prevent duplicate submissions
    if (creatingInvoice) {
      console.log('🚫 Already creating invoice, ignoring submission');
      return;
    }

    if (checkoutType === 'purchase') {
      onCheckout(selectedPaymentMethod);
    } else {
      // For rental, always use Xendit payment (payment method is now required)
      onCheckout(selectedPaymentMethod);
    }
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-2 pt-4 md:p-6 z-50">
      <div className="relative max-w-2xl w-full mt-0 md:mt-0">
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-fuchsia-600/20 rounded-full blur-3xl" />
        </div>
        
        {/* Modal content with PinkNeon design */}
        <div className="relative bg-black border border-white/10 rounded-2xl backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_50px_-12px_rgba(0,0,0,0.25)] max-h-[95vh] md:max-h-[85vh] overflow-hidden">
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[95vh] md:max-h-[85vh] p-4 md:p-6 pb-20 md:pb-6">
            <form className="space-y-4 md:space-y-6">
              {/* Header */}
              <PurchaseFormHeader
                checkoutType={checkoutType}
                productName={productName}
                effectivePrice={effectivePrice}
                selectedRental={selectedRental}
                onClose={onClose}
              />

              {/* Customer Information */}
              <CustomerInfoForm
                customer={customer}
                setCustomer={setCustomer}
                isPhoneValid={isPhoneValid}
                setIsPhoneValid={setIsPhoneValid}
                errors={errors}
              />

              {/* Payment Methods */}
              <PaymentMethods 
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
                showSelection={true} 
                amount={effectivePrice}
                loading={creatingInvoice}
                error={errors.paymentMethod}
                checkoutType={checkoutType}
              />

              {/* Actions */}
              <PurchaseActions
                checkoutType={checkoutType}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                creatingInvoice={creatingInvoice}
                isFormValid={isFormValid}
                onCheckout={() => handleSubmit()}
                onWhatsAppRental={() => handleSubmit()}
                onCancel={onClose}
                selectedPaymentMethod={selectedPaymentMethod}
                termsError={errors.terms}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
