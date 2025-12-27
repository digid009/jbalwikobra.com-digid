import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PNSection, PNContainer, PNHeading, PNText, PNButton } from '../../ui/PinkNeonDesignSystem';
import { SettingsService } from '../../../services/settingsService';
import { ensureUrlProtocol } from '../../../utils/helpers';
import type { WebsiteSettings } from '../../../types';

const PNCTA: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch {
        // silent fail – CTA can render without settings
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Default fallback URL if not set in admin
  const jualAkunWhatsappUrl = ensureUrlProtocol(settings?.jualAkunWhatsappUrl || 'https://www.alwikobra.com');
  return (
    <PNSection padding="lg">
      <PNContainer>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center max-w-xl mx-auto">
            <PNHeading level={2} gradient className="mb-2">Siap Memulai Gaming Anda?</PNHeading>
            <PNText className="mb-5">Bergabunglah dengan ribuan gamer yang sudah mempercayakan transaksi mereka kepada kami.</PNText>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <Link to="/products">
                <PNButton variant="secondary" size="lg" fullWidth>Mulai Belanja</PNButton>
              </Link>
              <a href={jualAkunWhatsappUrl} target="_blank" rel="noopener noreferrer">
                <PNButton variant="ghost" size="lg" fullWidth>Jual dan Admin WA disini!</PNButton>
              </a>
            </div>
          </div>
        </div>
      </PNContainer>
    </PNSection>
  );
};

export default React.memo(PNCTA);
