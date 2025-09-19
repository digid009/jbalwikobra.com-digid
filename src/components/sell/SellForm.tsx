import React, { forwardRef } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNCard, PNButton } from '../ui/PinkNeonDesignSystem';
import { FormField } from './FormField';
import { TipsSection } from './TipsSection';

interface SellFormProps {
  selectedGame: string;
  accountName: string;
  accountDetails: string;
  estimatedPrice: string;
  gameOptions: string[];
  onGameChange: (game: string) => void;
  onNameChange: (name: string) => void;
  onDetailsChange: (details: string) => void;
  onPriceChange: (price: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const SellForm = forwardRef<HTMLDivElement, SellFormProps>(({
  selectedGame,
  accountName,
  accountDetails,
  estimatedPrice,
  gameOptions,
  onGameChange,
  onNameChange,
  onDetailsChange,
  onPriceChange,
  onSubmit,
  loading = false
}, ref) => {
  // Format price with thousand separator
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    onPriceChange(formatPrice(value));
  };

  // Check if form is valid for submission - At least game must be selected
  const isFormValid = selectedGame && selectedGame.trim() !== '';

  return (
    <PNSection padding="lg" id="sell-form" className="border-y border-white/10">
      <PNContainer>
        <div ref={ref} className="scroll-mt-20 max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <PNHeading level={2} gradient className="mb-6 text-2xl lg:text-3xl">
              Jual Akun Game
            </PNHeading>
            <PNText className="max-w-2xl mx-auto text-lg text-gray-300 leading-relaxed">
              Isi informasi akun untuk mendapat penawaran terbaik. Tim ahli kami akan mengevaluasi akun Anda.
            </PNText>
          </div>

          {/* Form Card */}
          <PNCard className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-black/50 to-gray-900/50 border border-white/10 relative isolate">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16 pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 pointer-events-none -z-10"></div>
            
            <div className="space-y-6 relative z-10">
              {/* Game Selection */}
              <FormField label="">
                <select
                  value={selectedGame}
                  onChange={(e) => onGameChange(e.target.value)}
                  className="w-full px-5 py-4 min-h-[52px] border-2 border-white/10 bg-black/50 text-white rounded-xl 
                           focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200
                           hover:border-white/20 text-base shadow-sm focus:shadow-lg focus:shadow-pink-500/20"
                  required
                >
                  <option value="">{loading ? 'Memuat…' : 'Pilih game yang ingin dijual...'}</option>
                  {gameOptions.map(game => (
                    <option key={game} value={game} className="bg-black text-white py-2">
                      {game}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Account Name */}
              <FormField label="">
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Masukkan nama akun atau username"
                  className="w-full px-5 py-4 min-h-[52px] border-2 border-white/10 bg-black/50 text-white rounded-xl 
                           focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200
                           hover:border-white/20 text-base placeholder:text-gray-500 shadow-sm focus:shadow-lg focus:shadow-pink-500/20"
                  required
                />
              </FormField>

              {/* Account Details */}
              <FormField label="">
                <textarea
                  value={accountDetails}
                  onChange={(e) => onDetailsChange(e.target.value)}
                  placeholder="Jelaskan detail akun seperti level, rank, skin, hero yang dimiliki, dll."
                  rows={5}
                  className="w-full px-5 py-4 border-2 border-white/10 bg-black/50 text-white rounded-xl 
                           focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200
                           hover:border-white/20 text-base placeholder:text-gray-500 resize-none shadow-sm focus:shadow-lg focus:shadow-pink-500/20"
                  required
                />
              </FormField>

              {/* Price Estimation */}
              <FormField label="">
                <input
                  type="text"
                  value={estimatedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Estimasi harga (contoh: Rp 2,000,000)"
                  className="w-full px-5 py-4 min-h-[52px] border-2 border-white/10 bg-black/50 text-white rounded-xl 
                           focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200
                           hover:border-white/20 text-base placeholder:text-gray-500 shadow-sm focus:shadow-lg focus:shadow-pink-500/20"
                />
              </FormField>
            </div>

            {/* Tips Section */}
            <div className="relative z-10">
              <TipsSection />
            </div>
          </PNCard>

          {/* CTA Button - Visible on ALL screen sizes */}
          <div className="mt-8 relative z-20 text-center">
            <PNButton 
              size="lg" 
              onClick={onSubmit}
              className="w-full md:w-auto px-8 py-4 flex items-center justify-center gap-3 mx-auto relative z-30 min-h-[56px]"
              disabled={!isFormValid}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Hubungi Admin</span>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </PNButton>
            <PNText className="mt-4 text-gray-400">
              Admin akan menghubungi dalam 24 jam
            </PNText>
          </div>
        </div>
      </PNContainer>
    </PNSection>
  );
});

SellForm.displayName = 'SellForm';

export default SellForm;
