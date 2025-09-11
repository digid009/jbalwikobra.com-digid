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
  <footer className="bg-ios-background border-t border-ios-border mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName || 'Logo'} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 bg-ios-accent rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JB</span>
                </div>
              )}
              <span className="font-bold text-ios-text text-xl">{settings?.siteName || 'JBalwikobra'}</span>
            </Link>
            <p className="text-ios-text-secondary text-sm mb-6 leading-relaxed">
              Platform jual beli online terpercaya dengan pengalaman berbelanja yang aman dan nyaman.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-ios-text-secondary">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{settings?.contactEmail || 'support@jbalwikobra.com'}</span>
              </div>
              <div className="flex items-center space-x-3 text-ios-text-secondary">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{settings?.contactPhone || '+62 812-3456-7890'}</span>
              </div>
              <div className="flex items-center space-x-3 text-ios-text-secondary">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{settings?.address || 'Jakarta, Indonesia'}</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold text-ios-text mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-ios-text-secondary hover:text-ios-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-ios-border">
          <div className="max-w-md">
            <h3 className="font-semibold text-ios-text mb-2">Dapatkan Update Terbaru</h3>
            <p className="text-ios-text-secondary text-sm mb-4">
              Berlangganan newsletter untuk mendapatkan info promo dan produk terbaru.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="flex-1 px-4 py-2.5 bg-ios-surface border border-ios-border rounded-lg text-ios-text placeholder-ios-text-secondary focus:outline-none focus:ring-2 focus:ring-ios-accent focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-ios-accent text-white rounded-lg hover:bg-ios-accent/90 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ios-border bg-ios-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-ios-text-secondary text-sm">
              © {currentYear} JBalwikobra. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/terms"
                className="flex items-center space-x-1 text-ios-text-secondary hover:text-ios-accent transition-colors text-sm"
              >
                <Shield className="w-3 h-3" />
                <span>Syarat & Ketentuan</span>
              </Link>
              <Link
                to="/privacy"
                className="flex items-center space-x-1 text-ios-text-secondary hover:text-ios-accent transition-colors text-sm"
              >
                <Shield className="w-3 h-3" />
                <span>Kebijakan Privasi</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center space-x-1 text-ios-text-secondary hover:text-ios-accent transition-colors text-sm"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Bantuan</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-ios-text-secondary text-xs">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Dibuat dengan cinta</span>
              </div>
              <div className="w-px h-4 bg-ios-border"></div>
              <div className="text-ios-text-secondary text-xs">
                🇮🇩 Made in Indonesia
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
