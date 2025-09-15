import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShoppingBag, TrendingUp, Rocket } from 'lucide-react';
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

  const topupUrl = settings?.topupUrl || 'https://www.example.com';

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
            <PNHeading level={1} gradient className="mb-3">Gaming Marketplace #1</PNHeading>
            <PNText className="mb-6">Beli, jual, dan rental akun game favorit dengan aman, cepat, dan terpercaya</PNText>

            <div className="space-y-3">
              <Link to="/flash-sales">
                <PNButton variant="primary" size="lg" fullWidth className="flex items-center justify-center gap-2">
                  <Zap size={18} />
                  Flash Sale Hari Ini
                </PNButton>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/products">
                  <PNButton variant="secondary" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <ShoppingBag size={16} />
                    Belanja
                  </PNButton>
                </Link>
                <Link to="/sell">
                  <PNButton variant="ghost" size="md" fullWidth className="flex items-center justify-center gap-2">
                    <TrendingUp size={16} />
                    Jual Akun
                  </PNButton>
                </Link>
              </div>
              {/* New Top Up Game CTA */}
              <div>
                <a href={topupUrl} target="_blank" rel="noopener noreferrer">
                  <PNButton variant="secondary" size="md" fullWidth className="flex items-center justify-center gap-2 mt-1 border border-white/15 bg-white/5 hover:bg-white/10">
                    <Rocket size={16} />
                    Top Up Game
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
