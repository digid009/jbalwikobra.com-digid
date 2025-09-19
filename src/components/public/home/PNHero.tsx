import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShoppingBag, TrendingUp, Rocket, MessageCircle } from 'lucide-react';
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
                    Top Up Game Murah
                  </PNButton>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/products">
                  <PNButton variant="secondary" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <ShoppingBag size={16} />
                    Lihat Stok Akun
                  </PNButton>
                </Link>
                <Link to="/sell">
                  <PNButton variant="ghost" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <TrendingUp size={16} />
                    Jual Akun
                  </PNButton>
                </Link>
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
