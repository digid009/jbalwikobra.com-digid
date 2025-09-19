import React from 'react';
import { MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNButton } from '../ui/PinkNeonDesignSystem';
import { TrustIndicators } from './TrustIndicators';
import { generateWhatsAppUrl } from '../../utils/helpers';

interface SellHeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
  whatsappNumber?: string;
}

export const SellHero: React.FC<SellHeroProps> = ({ 
  onGetStarted, 
  onLearnMore, 
  whatsappNumber = '6281234567890' 
}) => {
  // Normalize phone number
  const normalizePhoneNumber = (phone: string) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (!digits.startsWith('62')) {
      digits = '62' + digits;
    }
    return digits;
  };

  const handleWhatsAppClick = () => {
    const message = `Halo admin JB Alwikobra! 👋\n\nSaya ingin konsultasi langsung mengenai penjualan akun game. Mohon bantuannya untuk diskusi lebih lanjut. Terima kasih!`;
    const whatsappUrl = generateWhatsAppUrl(normalizePhoneNumber(whatsappNumber), message);
    window.open(whatsappUrl, '_blank');
  };
  return (
    <PNSection padding="lg">
      <PNContainer>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-black to-black px-6 sm:px-8 py-16 sm:py-20 lg:py-28">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Hero Icon */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/25">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-black animate-ping"></div>
              </div>
            </div>
            
            {/* Main heading */}
            <PNHeading level={1} gradient className="mb-8">
              Jual Akun Game
            </PNHeading>
            
            {/* Subtitle */}
            <PNText className="text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed text-gray-300">
              Platform terpercaya untuk menjual akun game. Proses mudah, aman, dan harga terbaik.
            </PNText>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <PNButton 
                variant="primary" 
                size="lg" 
                onClick={onGetStarted}
                className="px-8 py-4 flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Mulai Jual</span>
                <ArrowRight className="w-5 h-5" />
              </PNButton>
              
              <PNButton 
                variant="secondary" 
                size="lg" 
                onClick={onLearnMore}
                className="px-8 py-4"
              >
                Cara Kerja
              </PNButton>
            </div>
            
            {/* WhatsApp CTA */}
            <div className="flex justify-center mb-8">
              <PNButton 
                variant="secondary" 
                size="lg" 
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 text-white px-8 py-4 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold text-center">Chat lewat WhatsApp</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </PNButton>
            </div>
            
            {/* WhatsApp Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <PNText className="text-sm font-medium">Respon Cepat</PNText>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <PNText className="text-sm font-medium">Gratis Konsultasi</PNText>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <PNText className="text-sm font-medium">Tersedia 24/7</PNText>
              </div>
            </div>
          </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default SellHero;
