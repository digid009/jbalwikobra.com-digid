import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import type { WebsiteSettings } from '../types';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

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

  const footerSections = [
    {
      title: 'Produk',
      links: [
        { label: 'Semua Produk', href: '/products' },
        { label: 'Flash Sale', href: '/flash-sales' },
        { label: 'Kategori', href: '/products?category=all' },
        { label: 'Produk Terlaris', href: '/products?sort=popular' },
      ]
    },
    {
      title: 'Akun',
      links: [
        { label: 'Profil Saya', href: '/profile' },
        { label: 'Wishlist', href: '/wishlist' },
        { label: 'Riwayat Pesanan', href: '/orders' },
        { label: 'Pengaturan', href: '/settings' },
      ]
    },
    {
      title: 'Bantuan',
      links: [
        { label: 'Pusat Bantuan', href: '/help' },
        { label: 'Cara Berbelanja', href: '/help#shopping' },
        { label: 'Metode Pembayaran', href: '/help#payment' },
        { label: 'Kebijakan Pengembalian', href: '/help#returns' },
      ]
    },
    {
      title: 'Tentang',
      links: [
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Karir', href: '/careers' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Blog', href: '/blog' },
      ]
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black border-t border-white/10 mt-auto">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                {settings?.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt={settings.siteName || 'Logo'} 
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20 group-hover:ring-pink-500/50 transition-all duration-300" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all duration-300">
                    <span className="text-white font-bold text-xl">JB</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-white text-xl tracking-tight">{settings?.siteName || 'JBalwikobra'}</span>
                  <p className="text-pink-400/80 text-sm -mt-1">Digital Store</p>
                </div>
              </Link>
              
              <p className="text-gray-300 text-base mb-8 leading-relaxed max-w-md">
                Platform jual beli online terpercaya dengan pengalaman berbelanja yang aman dan nyaman untuk semua kebutuhan digital Anda.
              </p>
              
              {/* Contact Info Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20">
                    <Mail className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{settings?.contactEmail || 'support@jbalwikobra.com'}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{settings?.contactPhone || '+62 812-3456-7890'}</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{settings?.address || 'Jakarta, Indonesia'}</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="lg:col-span-1">
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 h-full hover:border-pink-500/30 transition-all duration-300 group">
                  <h3 className="font-semibold text-white mb-6 text-lg group-hover:text-pink-400 transition-colors">{section.title}</h3>
                  <ul className="space-y-4">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-gray-300 hover:text-pink-400 transition-all duration-200 text-sm flex items-center gap-2 hover:translate-x-1 group/link"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 group-hover/link:bg-pink-400 transition-colors"></span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Subscription */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 backdrop-blur-sm border border-pink-500/20 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-fuchsia-600">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-lg">Dapatkan Update Terbaru</h3>
                  <p className="text-gray-400 text-sm">Info promo dan produk eksklusif langsung ke email Anda</p>
                </div>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-300 font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transform"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Copyright */}
              <div className="text-gray-400 text-sm">
                © {currentYear} <span className="text-white font-medium">JBalwikobra</span>. All rights reserved.
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-8">
                <Link
                  to="/terms"
                  className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm group"
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Syarat & Ketentuan</span>
                </Link>
                <Link
                  to="/privacy"
                  className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm group"
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Kebijakan Privasi</span>
                </Link>
                <Link
                  to="/help"
                  className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm group"
                >
                  <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Bantuan</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Dibuat dengan cinta</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="text-lg">🇮🇩</span>
                  <span>Made in Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
