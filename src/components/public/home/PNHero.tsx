import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShoppingBag, TrendingUp, Rocket, MessageCircle, Star } from 'lucide-react';
import { PNSection, PNContainer, PNHeading, PNText, PNButton } from '../../ui/PinkNeonDesignSystem';
import { SettingsService } from '../../../services/settingsService';
import type { WebsiteSettings } from '../../../types';

const PNHero: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch {
        // silent fail – hero can render without settings
      }
    })();
    return () => { mounted = false; };
  }, []);

  const topupGameUrl = settings?.topupGameUrl || 'https://default-topup-url.com';
  const whatsappChannelUrl = settings?.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaC7K3a7DAX9YbCFSb1V';
  const heroButtonUrl = settings?.heroButtonUrl || 'https://jbalwikobra.com/special-offer';
  const jualAkunWhatsappUrl = settings?.jualAkunWhatsappUrl || 'https://wa.me/6281234567890?text=Halo%20admin%20JB%20Alwikobra!%20%F0%9F%91%8B%0A%0ASaya%20tertarik%20untuk%20jual%20akun%20dan%20admin%20WA.%20Mohon%20info%20lebih%20lanjut.%20Terima%20kasih!';
  
  // Use hero settings from admin settings
  const heroTitle = settings?.heroTitle || 'Gaming Marketplace #1';
  const heroSubtitle = settings?.heroSubtitle || 'Beli, jual, dan rental akun game favorit dengan aman, cepat, dan terpercaya';

  return (
    <PNSection padding="lg">
      <PNContainer>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-black to-black px-6 py-10">
          {/* Glow background accents */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center max-w-xl mx-auto">
            <PNHeading level={1} gradient className="mb-3">{heroTitle}</PNHeading>
            <PNText className="mb-6">{heroSubtitle}</PNText>

            <div className="space-y-3">
              {/* Top Up Game button */}
              <div>
                <a href={topupGameUrl} target="_blank" rel="noopener noreferrer">
                  <PNButton variant="primary" size="lg" fullWidth className="flex items-center justify-center gap-2">
                    <Rocket size={18} />
                    Top Up Semua Game, Murah! Klik Disini!
                  </PNButton>
                </a>
              </div>
              {/* New Hero Button */}
              <div>
                <a href={heroButtonUrl} target="_blank" rel="noopener noreferrer">
                  <PNButton variant="secondary" size="lg" fullWidth className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    <Star size={18} />
                    RekBer Klik Disini!
                  </PNButton>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/products">
                  <PNButton variant="secondary" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <ShoppingBag size={16} />
                    Stok Akun Disini!
                  </PNButton>
                </Link>
                <a href={jualAkunWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <PNButton variant="ghost" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <TrendingUp size={16} />
                    Jual dan Admin WA disini!
                  </PNButton>
                </a>
              </div>
              {/* WhatsApp Channel button */}
              <div>
                <a href={whatsappChannelUrl} target="_blank" rel="noopener noreferrer">
                  <PNButton variant="secondary" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <MessageCircle size={16} />
                    Join WhatsApp Channel
                  </PNButton>
                </a>
              </div>
            </div>
          </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default React.memo(PNHero);
