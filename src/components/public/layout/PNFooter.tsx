import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { PNContainer, PNHeading, PNText } from '../../ui/PinkNeonDesignSystem';
import { SettingsService } from '../../../services/settingsService';
import type { WebsiteSettings } from '../../../types';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

const columns = [
  {
    title: 'Produk',
    links: [
      { label: 'Semua Produk', href: '/products' },
      { label: 'Flash Sale', href: '/flash-sales' },
      { label: 'Kategori', href: '/products?category=all' },
      { label: 'Terlaris', href: '/products?sort=popular' },
    ],
  },
  {
    title: 'Akun & Layanan',
    links: [
      { label: 'Profil', href: '/profile' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Riwayat Pesanan', href: '/orders' },
      { label: 'Jual Akun', href: '/sell' },
    ],
  },
  {
    title: 'Bantuan & Info',
    links: [
      { label: 'Pusat Bantuan', href: '/help' },
      { label: 'Metode Pembayaran', href: '/help#payment' },
      { label: 'Kebijakan Privasi', href: '/terms#privacy' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
    ],
  },
  {
    title: 'Komunitas',
    links: [
      { label: 'Feed Komunitas', href: '/feed' },
      { label: 'Forum', href: '/community' },
      { label: 'Instagram', href: 'https://instagram.com', external: true },
      { label: 'YouTube', href: 'https://youtube.com', external: true },
    ],
  },
];

const socials = [
  { icon: Instagram, href: 'https://instagram.com' },
  { icon: Twitter, href: 'https://twitter.com' },
  { icon: Youtube, href: 'https://youtube.com' },
];

const PNFooter: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="mt-8 border-t border-white/10 bg-black/60">
      <PNContainer className="px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="logo" className="w-10 h-10 rounded-xl ring-1 ring-white/15" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <div>
                <div className="text-white font-semibold">{settings?.siteName || 'JBalwikobra'}</div>
                <div className="text-xs text-white/70">Digital Store</div>
              </div>
            </div>
            <PNText className="text-sm text-white/70">
              Toko digital terpercaya untuk akun game premium, item, dan layanan instan.
            </PNText>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-pink-400" />{settings?.supportEmail || 'support@jbalwikobra.com'}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" />{settings?.contactPhone || '+62 812-3456-7890'}</div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" />{settings?.address || 'Jakarta, Indonesia'}</div>
            </div>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {columns.map((col) => (
              <div key={col.title}>
                <PNHeading level={3} className="mb-4">{col.title}</PNHeading>
                <ul className="space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={`${col.title}-${l.label}`}>
                      {l.external ? (
                        <a href={l.href} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white hover:underline">
                          {l.label}
                        </a>
                      ) : (
                        <Link to={l.href} className="text-white/80 hover:text-white hover:underline">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/60">© {year} {settings?.siteName || 'JBalwikobra'}. All rights reserved.</div>
          <div className="text-xs text-white/60 flex items-center gap-3">
            <Link to="/terms" className="hover:text-white">Syarat</Link>
            <span>•</span>
            <Link to="/terms#privacy" className="hover:text-white">Privasi</Link>
          </div>
        </div>
      </PNContainer>
    </footer>
  );
};

export default PNFooter;
