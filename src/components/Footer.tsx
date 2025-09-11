import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import { IOSContainer, IOSCard, IOSGrid } from './ios/IOSDesignSystem';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [siteName, setSiteName] = React.useState<string>('JB Alwikobra');
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = React.useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const [contactEmail, setContactEmail] = React.useState<string>('admin@jbalwikobra.com');
  const [contactPhone, setContactPhone] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('Jakarta, Indonesia');
  const [facebookUrl, setFacebookUrl] = React.useState<string>('https://facebook.com/');
  const [instagramUrl, setInstagramUrl] = React.useState<string>('https://instagram.com/');
  const [tiktokUrl, setTiktokUrl] = React.useState<string>('https://tiktok.com/');

  React.useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.siteName) setSiteName(s.siteName);
        if (s?.logoUrl) setLogoUrl(s.logoUrl);
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
        if (s?.contactEmail) setContactEmail(s.contactEmail);
        if (s?.contactPhone) setContactPhone(s.contactPhone);
        if (s?.address) setAddress(s.address);
        if (s?.facebookUrl) setFacebookUrl(s.facebookUrl);
        if (s?.instagramUrl) setInstagramUrl(s.instagramUrl);
        if (s?.tiktokUrl) setTiktokUrl(s.tiktokUrl);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    })();
  }, []);

  return (
    <footer className="hidden lg:block bg-black border-t border-gray-800 text-gray-300">
      <IOSContainer className="pt-8 pb-6">
        {/* Mobile-first: Simplified footer for mobile screens */}
        <div className="lg:hidden">
          <div className="text-center py-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">JB</span>
                </div>
              )}
              <span className="text-lg font-bold text-white">{siteName}</span>
            </div>
            
            {/* Contact info only on mobile */}
            <div className="space-y-2 mb-4">
              {contactEmail && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Mail size={16} />
                  <span>{contactEmail}</span>
                </div>
              )}
              {whatsappNumber && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Phone size={16} />
                  <span>+{whatsappNumber}</span>
                </div>
              )}
            </div>
            
            {/* Social media - mobile */}
            <div className="flex justify-center space-x-3 mb-4">
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38C1.34 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.71-1.46-1.38-2.13C19.46 1.34 18.79.93 18 .63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
              </a>
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.85l-.46 2.91h-2.39v7.04A10 10 0 0 0 22 12z"/></svg>
              </a>
            </div>
            
            <p className="text-xs text-gray-500">
              © {currentYear} {siteName}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Desktop: Full footer */}
        <IOSGrid columns={4} gap="large" className="hidden lg:grid mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <IOSCard variant="default" padding="medium" className="bg-transparent border-none shadow-none">
              <div className="flex items-center space-x-2 mb-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={siteName} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-pink-500 to-pink-600">
                    <span className="text-white font-bold text-sm">JB</span>
                  </div>
                )}
                <div>
                  <span className="text-xl font-bold text-white">{siteName}</span>
                  <p className="text-sm text-gray-400 -mt-1">Gaming Marketplace</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md text-sm md:text-base">
                Platform terpercaya untuk jual beli dan rental akun game di Indonesia. 
                Dapatkan akun game impian Anda dengan harga terbaik dan layanan terpercaya.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons */}
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800" aria-label="Instagram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0 2a3 3 0 1 1-.001 6.001A3 3 0 0 1 12 9zm5.5-.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/></svg>
                </a>
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800" aria-label="Facebook">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.85l-.46 2.91h-2.39v7.04A10 10 0 0 0 22 12z"/></svg>
                </a>
                <a href={tiktokUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800" aria-label="TikTok">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.5a7.5 7.5 0 0 1-5-2v8.2a5.7 5.7 0 1 1-4.9-5.65v2.7a3 3 0 1 0 2 2.83V2h3a4.5 4.5 0 0 0 4 3.9v2.6z"/></svg>
                </a>
                <a href="https://youtube.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800" aria-label="YouTube">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                </a>
              </div>
            </IOSCard>
          </div>

          {/* Quick Links */}
          <div>
            <IOSCard variant="default" padding="medium" className="bg-transparent border-none shadow-none">
              <h3 className="text-lg font-semibold mb-4 text-white">Menu Utama</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/flash-sales" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Flash Sale
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Katalog Produk
                  </Link>
                </li>
                <li>
                  <Link to="/sell" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Jual Akun
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Bantuan
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-pink-400 transition-colors text-sm md:text-base block py-1 px-2 rounded hover:bg-gray-800">
                    Syarat & Ketentuan
                  </Link>
                </li>
              </ul>
            </IOSCard>
          </div>

          {/* Contact */}
          <div>
            <IOSCard variant="default" padding="medium" className="bg-transparent border-none shadow-none">
              <h3 className="text-lg font-semibold mb-4 text-white">Kontak</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2 text-gray-300 text-sm md:text-base">
                  <Phone size={16} className="text-pink-400" />
                  <span>+{whatsappNumber}</span>
                </li>
                {contactPhone && (
                  <li className="flex items-center space-x-2 text-gray-300 text-sm md:text-base">
                    <Phone size={16} className="text-pink-400" />
                    <span>{contactPhone}</span>
                  </li>
                )}
                <li className="flex items-center space-x-2 text-gray-300 text-sm md:text-base">
                  <Mail size={16} className="text-pink-400" />
                  <span>{contactEmail}</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-300 text-sm md:text-base">
                  <MapPin size={16} className="text-pink-400" />
                  <span>{address}</span>
                </li>
              </ul>
            </IOSCard>
          </div>
        </IOSGrid>

        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-800">
          <p className="text-gray-400 text-sm md:text-sm text-center md:text-left mb-4 md:mb-0">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-gray-400 text-sm md:text-sm">
            <Link to="/terms" className="hover:text-pink-400 transition-colors py-2 px-3 rounded hover:bg-gray-800 text-center">Syarat & Ketentuan</Link>
            <span className="opacity-50 hidden sm:inline">|</span>
            <div className="flex items-center space-x-2">
              <span>Made with</span>
              <Heart size={16} className="text-pink-500" />
              <span>for Indonesian Gamers</span>
            </div>
          </div>
        </div>
      </IOSContainer>
    </footer>
  );
};

export default Footer;
