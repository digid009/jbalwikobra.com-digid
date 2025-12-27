import React from 'react';
import { Shield, Clock, Star, Headphones } from 'lucide-react';
import HomeSectionHeader from './shared/HomeSectionHeader';

interface Feature { icon: any; title: string; description: string; }

const FEATURES: Feature[] = [
  { icon: Shield, title: 'Aman & Terpercaya', description: 'Sistem keamanan berlapis & jaminan dana kembali' },
  { icon: Clock, title: 'Pengiriman Cepat', description: 'Akun dikirim dalam hitungan menit dengan notifikasi' },
  { icon: Star, title: 'Kualitas Premium', description: 'Akun terverifikasi & terkurasi kualitasnya' },
  { icon: Headphones, title: 'Support 24/7', description: 'Tim support responsif via WhatsApp & chat' }
];

const HomeFeaturesSection: React.FC = () => {
  return (
    <section className="px-4 py-8">
      <HomeSectionHeader
        title="Mengapa Pilih Kami?"
        subtitle="Platform tepercaya dengan keamanan terbaik"
        align="center"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`interactive-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] anim-fade-scale stagger-${(i%10)+1}`}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 via-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-4 border border-pink-500/30 shadow-inner">
              <f.icon className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 leading-tight tracking-wide">{f.title}</h3>
            <p className="text-tertiary text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(HomeFeaturesSection);
