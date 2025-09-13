import React from 'react';
import { Shield, Clock, Star, Headphones } from 'lucide-react';

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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Mengapa Pilih Kami?</h2>
        <p className="text-zinc-400 text-sm">Platform tepercaya dengan keamanan terbaik</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <f.icon className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{f.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(HomeFeaturesSection);
