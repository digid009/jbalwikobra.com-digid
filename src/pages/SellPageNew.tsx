import React, { useEffect, useRef, useState } from 'react';
import {
  generateWhatsAppUrl,
  generateSellAccountMessage
} from '../utils/helpers';
import { SettingsService } from '../services/settingsService';
import { ProductService } from '../services/productService';
import { 
  IOSContainer, 
  IOSCard, 
  IOSButton, 
  IOSSectionHeader, 
  IOSHeroV2,
  IOSInputField
} from '../components/ios/IOSDesignSystemV2';
import {
  MessageCircle,
  DollarSign,
  Shield,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Gamepad2,
  Trophy,
  Users
} from 'lucide-react';

const SellPageNew: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [accountLevel, setAccountLevel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [gameOptions, setGameOptions] = useState<string[]>([
    'Mobile Legends','PUBG Mobile','Free Fire','Genshin Impact','Call of Duty Mobile','Valorant','Arena of Valor','Clash of Clans','Clash Royale','Honkai Impact','Lainnya'
  ]);
  const [popularGames, setPopularGames] = useState<Array<{
    name: string; 
    count: string; 
    icon: any;
    color?: string;
    logoUrl?: string;
  }>>([
    { name: 'Mobile Legends', count: '500+', icon: Gamepad2, color: '#3b82f6' },
    { name: 'PUBG Mobile', count: '350+', icon: Smartphone, color: '#f59e0b' },
    { name: 'Free Fire', count: '300+', icon: Trophy, color: '#ef4444' },
    { name: 'Genshin Impact', count: '200+', icon: Star, color: '#8b5cf6' },
  ]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
      } catch (_e) {
        /* ignore settings fetch for smoother UX */
      }
    })();
  }, []);

  // Format price with thousand separator
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  // Handle price input with formatting
  const handlePriceChange = (value: string) => {
    setEstimatedPrice(formatPrice(value));
  };

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

  const handleSellAccount = () => {
    // Generate detailed message using form data
    const gameInfo = selectedGame || 'Game yang ingin dijual';
    const levelInfo = accountLevel ? ` (Level/Rank: ${accountLevel})` : '';
    const priceInfo = estimatedPrice ? ` dengan estimasi harga ${estimatedPrice}` : '';
    const detailsInfo = accountDetails ? `\n\nDetail akun:\n${accountDetails}` : '';
    
    const customMessage = `Halo admin JB Alwikobra! 👋\n\nSaya ingin menjual akun ${gameInfo}${levelInfo}${priceInfo}.${detailsInfo}\n\nMohon bantuan untuk evaluasi dan proses penjualan akun saya. Terima kasih!`;
    
    const whatsappUrl = generateWhatsAppUrl(normalizePhoneNumber(whatsappNumber), customMessage);
    window.open(whatsappUrl, '_blank');
  };

  const scrollToForm = () => {
    const el = formRef.current || document.getElementById('sell-form');
    if (el) {
      // Offset for fixed header (approx 56px mobile / 64px desktop)
      const headerOffset = window.innerWidth < 768 ? 56 : 64;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - headerOffset - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    // Fallback anchor navigation
    window.location.hash = '#sell-form';
  };

  // Features data
  const features = [
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

  // How it works steps
  const steps = [
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <IOSHeroV2
        title="Jual Akun Game Anda"
        subtitle="Platform terpercaya untuk menjual akun game Anda. Proses mudah, aman, dan harga kompetitif. Sudah dipercaya oleh ribuan gamer di Indonesia."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <IOSButton variant="primary" size="lg" onClick={scrollToForm}>
            <MessageCircle size={20} />
            <span>Mulai Jual Akun</span>
          </IOSButton>
          <IOSButton variant="secondary" size="lg" onClick={() => {
            const element = document.getElementById('how-it-works');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Cara Kerjanya
          </IOSButton>
        </div>
      </IOSHeroV2>

      {/* Quick Form Section */}
      <section id="sell-form" className="py-16 bg-black">
        <IOSContainer>
          <div ref={formRef} className="scroll-mt-20">
            <IOSSectionHeader
              title="Estimasi Harga Akun Anda"
              subtitle="Isi form di bawah untuk mendapat estimasi harga akun game Anda"
            />

            <IOSCard className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pilih Game *
                  </label>
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="w-full px-4 py-3 min-h-[44px] border border-gray-600 bg-gray-900 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    required
                  >
                    <option value="">{loadingGames ? 'Memuat…' : 'Pilih game...'}</option>
                    {gameOptions.map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>
                </div>

                {/* Account Level */}
                <IOSInputField
                  label="Level/Rank Akun"
                  value={accountLevel}
                  onChange={(e) => setAccountLevel(e.target.value)}
                  placeholder="Contoh: Mythic Glory, Conqueror, dll"
                />

                {/* Price Estimation */}
                <IOSInputField
                  label="Estimasi Harga (Opsional)"
                  value={estimatedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Contoh: Rp 2,000,000"
                />

                {/* Account Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detail Akun
                  </label>
                  <textarea
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    placeholder="Skin, hero, item khusus, dll"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm resize-none min-h-[88px]"
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8">
                {/* Desktop CTA */}
                <div className="hidden sm:block text-center">
                  <IOSButton 
                    size="lg" 
                    onClick={handleSellAccount}
                    className="px-8 py-4"
                  >
                    <MessageCircle size={20} />
                    <span>Hubungi Admin untuk Evaluasi</span>
                    <ArrowRight size={20} />
                  </IOSButton>
                  <p className="text-sm text-gray-400 mt-4">
                    Admin akan menghubungi Anda untuk evaluasi lebih lanjut
                  </p>
                </div>

                {/* Mobile CTA - Fixed at bottom */}
                <div className="sm:hidden">
                  <div className="h-20" />
                  <div className="fixed left-4 right-4 bottom-20 z-50">
                    <IOSButton 
                      onClick={handleSellAccount}
                      className="w-full shadow-2xl"
                      size="lg"
                    >
                      <MessageCircle size={18} />
                      <span>Hubungi Admin</span>
                      <ArrowRight size={18} />
                    </IOSButton>
                  </div>
                </div>
              </div>
            </IOSCard>
          </div>
        </IOSContainer>
      </section>

      {/* Popular Games Section */}
      <section className="py-16 bg-black border-t border-gray-800">
        <IOSContainer>
          <IOSSectionHeader
            title="Game Populer"
            subtitle="Akun game yang paling banyak dicari pembeli"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {popularGames.map((game, index) => (
              <IOSCard key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <game.icon size={24} style={{ color: game.color }} />
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{game.name}</h3>
                <p className="text-sm text-gray-400">{game.count} akun terjual</p>
              </IOSCard>
            ))}
          </div>
        </IOSContainer>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black border-t border-gray-800">
        <IOSContainer>
          <IOSSectionHeader
            title="Mengapa Pilih Kami?"
            subtitle="Keuntungan menjual akun game di platform kami"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {features.map((feature, index) => (
              <IOSCard key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <feature.icon size={24} className="text-pink-500" />
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </IOSCard>
            ))}
          </div>
        </IOSContainer>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-black border-t border-gray-800">
        <IOSContainer>
          <IOSSectionHeader
            title="Cara Kerjanya"
            subtitle="Proses mudah untuk menjual akun game Anda"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500 flex items-center justify-center">
                  <span className="text-black font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </IOSContainer>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-black border-t border-gray-800">
        <IOSContainer>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Siap Menjual Akun Game Anda?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Dapatkan evaluasi gratis dan penawaran terbaik untuk akun game Anda. 
              Proses cepat, aman, dan terpercaya.
            </p>
            <IOSButton size="lg" onClick={scrollToForm}>
              <MessageCircle size={20} />
              <span>Mulai Sekarang</span>
              <ArrowRight size={20} />
            </IOSButton>
          </div>
        </IOSContainer>
      </section>
    </div>
  );
};

export default SellPageNew;
