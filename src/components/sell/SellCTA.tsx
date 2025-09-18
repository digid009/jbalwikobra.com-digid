import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNButton } from '../ui/PinkNeonDesignSystem';
import { StatsRow } from './StatsRow';

interface SellCTAProps {
  onGetStarted?: () => void;
}

export const SellCTA: React.FC<SellCTAProps> = ({ onGetStarted }) => {
  return (
    <PNSection padding="lg" className="border-t border-white/10 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
      <PNContainer>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            {/* Main CTA Heading */}
            <div className="mb-10">
              <PNHeading level={2} gradient className="mb-6 text-2xl lg:text-3xl">
                Siap Menjual Akun Game?
              </PNHeading>
              <PNText className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-300 leading-relaxed">
                Dapatkan evaluasi gratis dan penawaran terbaik. Proses cepat, aman, dan terpercaya.
              </PNText>
            </div>
          
          {/* Stats Row */}
          <div className="mb-8">
            <StatsRow />
          </div>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <PNButton 
              size="lg" 
              onClick={onGetStarted}
              className="px-8 py-4 group"
            >
              <MessageCircle size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">Mulai Sekarang</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </PNButton>
            
            <PNText className="text-gray-400 text-sm">
              Evaluasi gratis • Tanpa biaya tersembunyi
            </PNText>
          </div>
          
          {/* Security Badge */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <PNText className="text-green-400 text-sm font-medium">
                Keamanan data terjamin
              </PNText>
            </div>
          </div>
        </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default SellCTA;
