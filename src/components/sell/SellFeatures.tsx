import React from 'react';
import { Shield, DollarSign, Clock, Users } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNCard } from '../ui/PinkNeonDesignSystem';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

interface SellFeaturesProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: Shield,
    title: 'Transaksi Aman',
    description: 'Sistem escrow melindungi pembeli dan penjual'
  },
  {
    icon: DollarSign,
    title: 'Harga Terbaik',
    description: 'Dapatkan harga maksimal untuk akun game Anda'
  },
  {
    icon: Clock,
    title: 'Proses Cepat',
    description: 'Evaluasi dan penjualan dalam 24 jam'
  },
  {
    icon: Users,
    title: 'Dipercaya 1000+',
    description: 'Sudah melayani ribuan gamer Indonesia'
  }
];

export const SellFeatures: React.FC<SellFeaturesProps> = ({ features = defaultFeatures }) => {
  return (
  <PNSection padding="lg" className="border-y border-white/10">
      <PNContainer>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <PNHeading level={2} gradient className="mb-6 text-2xl lg:text-3xl">
              Mengapa Pilih Kami?
            </PNHeading>
            <PNText className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Platform terpercaya dengan sistem keamanan terbaik dan proses yang transparan
            </PNText>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <PNCard 
                key={index} 
                className="text-center p-6 lg:p-8 hover:scale-105 transition-all duration-300 group border border-white/10 hover:border-pink-500/30 bg-gradient-to-br from-black/50 to-gray-900/50 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:bg-pink-500/20 transition-colors duration-300"></div>
                
                <div className="space-y-4 relative z-10">
                  {/* Feature Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-pink-500/25">
                      <IconComponent 
                        size={28} 
                        className="text-pink-400 group-hover:text-pink-300 transition-colors duration-300" 
                      />
                    </div>
                  </div>
                  
                  {/* Feature Content */}
                  <div className="space-y-3">
                    <PNHeading level={3} className="text-white group-hover:text-pink-300 transition-colors duration-300 text-lg lg:text-xl">
                      {feature.title}
                    </PNHeading>
                    
                    <PNText className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm lg:text-base leading-relaxed">
                      {feature.description}
                    </PNText>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </PNCard>
            );
          })}
        </div>
        
        {/* Trust Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <PNText className="text-green-400 font-semibold">
              Platform terpercaya dengan tingkat kepuasan 98%+
            </PNText>
          </div>
        </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default SellFeatures;
