import React from 'react';
import { MessageCircle, ArrowRight, Headphones, CheckCircle } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNButton, PNCard } from '../ui/PinkNeonDesignSystem';
import { generateWhatsAppUrl } from '../../utils/helpers';

interface WhatsAppConsultationProps {
  whatsappNumber?: string;
  onConsultationClick?: () => void;
}

export const WhatsAppConsultation: React.FC<WhatsAppConsultationProps> = ({ 
  whatsappNumber = '6281234567890',
  onConsultationClick 
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
    
    if (onConsultationClick) {
      onConsultationClick();
    }
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <PNSection padding="lg" className="border-y border-white/10">
      <PNContainer>
        <PNCard className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl translate-y-12 -translate-x-12"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 relative z-10">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/25">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="space-y-2">
                <PNHeading level={2} className="text-white text-xl lg:text-2xl">
                  Atau Konsultasi Langsung dengan Kami di WhatsApp
                </PNHeading>
                
                <PNText className="text-gray-300 text-base lg:text-lg max-w-2xl">
                  Butuh bantuan atau ingin konsultasi gratis sebelum menjual? Tim ahli kami siap membantu.
                </PNText>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
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
            
            {/* CTA Button */}
            <div className="flex-shrink-0">
              <PNButton 
                variant="secondary"
                size="lg"
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 text-white px-8 py-4 flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold text-base">Chat Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </PNButton>
            </div>
          </div>

        </PNCard>
      </PNContainer>
    </PNSection>
  );
};

export default WhatsAppConsultation;
