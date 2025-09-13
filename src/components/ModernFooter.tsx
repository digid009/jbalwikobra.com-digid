import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin,
  Package,
  Zap,
  User,
  BookOpen,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Send,
  CheckCircle
} from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import { IOSButton } from './ios/IOSDesignSystem';
import type { WebsiteSettings } from '../types';

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
    badge?: string;
  }>;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}

const ModernFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SettingsService.get();
        if (mounted) setSettings(data);
      } catch (e) {
        console.warn('Failed to load settings for footer:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const footerSections: FooterSection[] = [
    {
      title: 'Produk',
      links: [
        { label: 'Semua Produk', href: '/products' },
        { label: 'Flash Sale', href: '/flash-sales', badge: 'Hot' },
        { label: 'Kategori', href: '/products?category=all' },
        { label: 'Produk Terlaris', href: '/products?sort=popular' },
      ]
    },
    {
      title: 'Akun & Layanan',
      links: [
        { label: 'Profil Saya', href: '/profile' },
        { label: 'Wishlist', href: '/wishlist' },
        { label: 'Riwayat Pesanan', href: '/orders' },
        { label: 'Jual Akun', href: '/sell' },
        { label: 'Pengaturan', href: '/settings' },
      ]
    },
    {
      title: 'Bantuan & Info',
      links: [
        { label: 'Pusat Bantuan', href: '/help' },
        { label: 'Cara Berbelanja', href: '/help#shopping' },
        { label: 'Metode Pembayaran', href: '/help#payment' },
        { label: 'Kebijakan Privasi', href: '/terms#privacy' },
        { label: 'Syarat & Ketentuan', href: '/terms' },
      ]
    },
    {
      title: 'Komunitas',
      links: [
        { label: 'Feed Komunitas', href: '/feed' },
        { label: 'Forum Diskusi', href: '/community', external: true },
        { label: 'Discord Server', href: '#discord', external: true },
        { label: 'Telegram Group', href: '#telegram', external: true },
      ]
    },
  ];

  const socialLinks: SocialLink[] = [
    { name: 'Instagram', href: settings?.instagramUrl || '#', icon: Instagram, color: 'from-pink-500 to-rose-500' },
    { name: 'Twitter', href: settings?.twitterUrl || '#', icon: Twitter, color: 'from-blue-400 to-blue-600' },
    { name: 'YouTube', href: settings?.youtubeUrl || '#', icon: Youtube, color: 'from-red-500 to-red-600' },
    { name: 'Facebook', href: settings?.facebookUrl || '#', icon: Globe, color: 'from-green-500 to-emerald-600' },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    
    // Simulate newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubscribed(true);
    setIsSubscribing(false);
    setEmail('');

    // Reset after showing success message
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <footer className="relative bg-black/40 backdrop-blur-xl border-t border-white/10">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <FooterBrand settings={settings} />
              <FooterContact settings={settings} />
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {footerSections.map((section) => (
                <FooterSection key={section.title} section={section} />
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          {settings?.newsletterEnabled !== false && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <NewsletterSection
                email={email}
                setEmail={setEmail}
                onSubmit={handleNewsletterSubmit}
                isSubscribing={isSubscribing}
                isSubscribed={isSubscribed}
              />
            </div>
          )}

          {/* Social & Bottom Section */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Social Links */}
              {settings?.socialMediaEnabled !== false && (
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-sm mr-2">Ikuti kami:</span>
                  {socialLinks
                    .filter(social => social.href && social.href !== '#')
                    .map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-pink-500/50 transition-all duration-300"
                          title={social.name}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`} />
                          <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                        </a>
                      );
                    })}
                </div>
              )}

              {/* Copyright & Trust Badges */}
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-6 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>100% Aman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Terpercaya</span>
                  </div>
                </div>
                
                <div className="text-sm text-white/60 text-center lg:text-right">
                  <p>&copy; {currentYear} {settings?.siteName || 'JBalwikobra'}. {settings?.footerCopyrightText || 'All rights reserved.'}</p>
                  <p className="mt-1">
                    Made with <Heart className="w-3 h-3 text-pink-400 inline mx-1" /> in Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Brand Component
const FooterBrand: React.FC<{ settings: WebsiteSettings | null }> = ({ settings }) => (
  <div className="mb-8">
    <Link to="/" className="flex items-center gap-3 mb-6 group">
      {settings?.logoUrl ? (
        <div className="relative">
          <img
            src={settings.logoUrl}
            alt={settings.siteName || 'Logo'}
            className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/20 group-hover:ring-pink-500/50 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300">
            <span className="text-white font-bold text-lg">JB</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-fuchsia-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
          {settings?.siteName || 'JBalwikobra'}
        </h2>
        <p className="text-sm text-white/60">Digital Gaming Store</p>
      </div>
    </Link>
    
    <p className="text-white/70 text-sm leading-relaxed mb-6">
      {settings?.companyDescription || 
      'Platform terpercaya untuk jual beli akun game dengan harga terbaik. Aman, cepat, dan mudah untuk semua gamers Indonesia.'}
    </p>

    {/* Trust Indicators */}
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20">
        <div className="text-lg font-bold text-white">1000+</div>
        <div className="text-xs text-white/60">Pengguna</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20">
        <div className="text-lg font-bold text-white">500+</div>
        <div className="text-xs text-white/60">Produk</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20">
        <div className="text-lg font-bold text-white">24/7</div>
        <div className="text-xs text-white/60">Support</div>
      </div>
    </div>
  </div>
);

// Footer Contact Component
const FooterContact: React.FC<{ settings: WebsiteSettings | null }> = ({ settings }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-white text-lg mb-4">Kontak Kami</h3>
    
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 hover:border-pink-500/30 transition-all duration-300 group">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20">
          <Mail className="w-4 h-4 text-pink-400" />
        </div>
        <span className="text-white/70 text-sm group-hover:text-white transition-colors">
          {settings?.supportEmail || settings?.contactEmail || 'support@jbalwikobra.com'}
        </span>
      </div>
      
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 hover:border-pink-500/30 transition-all duration-300 group">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
          <Phone className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-white/70 text-sm group-hover:text-white transition-colors">
          {settings?.contactPhone || '+62 812-3456-7890'}
        </span>
      </div>
      
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 hover:border-pink-500/30 transition-all duration-300 group">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
          <MapPin className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-white/70 text-sm group-hover:text-white transition-colors">
          {settings?.address || 'Jakarta, Indonesia'}
        </span>
      </div>
    </div>
  </div>
);

// Footer Section Component
const FooterSection: React.FC<{ section: FooterSection }> = ({ section }) => (
  <div>
    <h3 className="font-semibold text-white mb-6 text-base">{section.title}</h3>
    <ul className="space-y-3">
      {section.links.map((link, index) => (
        <li key={`${link.href}-${link.label}-${index}`}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white/70 hover:text-pink-400 transition-all duration-200 text-sm hover:translate-x-1"
            >
              <span className="w-1 h-1 rounded-full bg-pink-500/50 group-hover:bg-pink-400 transition-colors" />
              {link.label}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              {link.badge && (
                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full">
                  {link.badge}
                </span>
              )}
            </a>
          ) : (
            <Link
              to={link.href}
              className="group flex items-center gap-2 text-white/70 hover:text-pink-400 transition-all duration-200 text-sm hover:translate-x-1"
            >
              <span className="w-1 h-1 rounded-full bg-pink-500/50 group-hover:bg-pink-400 transition-colors" />
              {link.label}
              {link.badge && (
                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

// Newsletter Section Component
interface NewsletterSectionProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubscribing: boolean;
  isSubscribed: boolean;
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  email,
  setEmail,
  onSubmit,
  isSubscribing,
  isSubscribed
}) => (
  <div className="max-w-2xl mx-auto text-center">
    <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 backdrop-blur-sm border border-pink-500/20 mb-6">
      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600">
        {isSubscribed ? (
          <CheckCircle className="w-6 h-6 text-white" />
        ) : (
          <Mail className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="text-left">
        <h3 className="font-bold text-white text-lg">
          {isSubscribed ? 'Berhasil Berlangganan!' : 'Newsletter JBalwikobra'}
        </h3>
        <p className="text-pink-200 text-sm">
          {isSubscribed ? 'Terima kasih sudah bergabung!' : 'Dapatkan penawaran eksklusif dan update terbaru'}
        </p>
      </div>
    </div>

    {!isSubscribed && (
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda..."
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
            required
          />
        </div>
        <IOSButton
          type="submit"
          variant="primary"
          disabled={isSubscribing || !email.trim()}
          className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 disabled:opacity-50"
        >
          {isSubscribing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Mengirim...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Berlangganan</span>
            </div>
          )}
        </IOSButton>
      </form>
    )}

    <p className="text-xs text-white/50 mt-4">
      Dengan berlangganan, Anda menyetujui <Link to="/terms" className="text-pink-400 hover:underline">syarat dan ketentuan</Link> kami.
    </p>
  </div>
);

export default ModernFooter;
