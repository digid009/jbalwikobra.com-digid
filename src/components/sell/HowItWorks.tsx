import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText } from '../ui/PinkNeonDesignSystem';

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    number: '01',
    title: 'Isi Form Estimasi',
    description: 'Lengkapi detail akun game yang ingin dijual untuk mendapat estimasi harga.'
  },
  {
    number: '02',
    title: 'Evaluasi Admin',
    description: 'Tim ahli kami akan mengevaluasi akun dan memberikan penawaran terbaik.'
  },
  {
    number: '03',
    title: 'Transfer Akun',
    description: 'Setelah sepakat, transfer akun melalui sistem aman kami.'
  },
  {
    number: '04',
    title: 'Terima Pembayaran',
    description: 'Dapatkan pembayaran langsung setelah akun berhasil terjual ke pembeli.'
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ steps = defaultSteps }) => {
  return (
  <PNSection padding="lg" id="how-it-works" className="border-y border-white/10">
      <PNContainer>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <PNHeading level={2} gradient className="mb-6 text-2xl lg:text-3xl">
              Cara Kerjanya
            </PNHeading>
            <PNText className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Proses mudah dan aman untuk menjual akun game Anda dalam 4 langkah sederhana
            </PNText>
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Number */}
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg sm:text-xl">{step.number}</span>
                </div>
                
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-pink-500/50 to-purple-500/50 transform -translate-y-1/2 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                )}
              </div>
              
              {/* Step Content */}
              <PNHeading level={3} className="text-white mb-3 group-hover:text-pink-300 transition-colors duration-300">
                {step.title}
              </PNHeading>
              
              <PNText className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {step.description}
              </PNText>
              
              {/* Check Icon */}
              <div className="mt-4 flex justify-center">
                <CheckCircle 
                  size={20} 
                  className="text-green-500 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Process Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <CheckCircle size={24} className="text-blue-400" />
            <div className="text-left">
              <PNText className="text-blue-400 font-semibold">
                Proses Terjamin
              </PNText>
              <PNText className="text-gray-400 text-sm">
                Rata-rata selesai dalam 24 jam
              </PNText>
            </div>
          </div>
        </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default HowItWorks;
