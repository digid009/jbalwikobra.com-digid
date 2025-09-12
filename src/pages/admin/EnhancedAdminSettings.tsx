import React, { useEffect, useState } from 'react';
import { SettingsService } from '../../services/settingsService';
import { WebsiteSettings } from '../../types';
import { 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Clock,
  Shield,
  Settings as SettingsIcon,
  Palette,
  Users
} from 'lucide-react';
import PhoneInput from '../../components/PhoneInput';
import { useNotifications } from '../../components/NotificationSystem';
import { IOSCard, IOSButton, IOSContainer } from '../../components/ios/IOSDesignSystem';

const EnhancedAdminSettings: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [form, setForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [phoneValidation, setPhoneValidation] = useState({ whatsapp: true, contact: true });
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => { 
    (async () => {
      setLoading(true);
      try {
        const s = await SettingsService.get();
        setSettings(s);
        setForm({
          // General Settings
          siteName: s.siteName || '',
          companyDescription: s.companyDescription || '',
          
          // Contact Information
          contactEmail: s.contactEmail || '',
          supportEmail: s.supportEmail || '',
          contactPhone: s.contactPhone || '',
          whatsappNumber: s.whatsappNumber || '',
          address: s.address || '',
          businessHours: s.businessHours || '',
          
          // Hero Section
          heroTitle: s.heroTitle || '',
          heroSubtitle: s.heroSubtitle || '',
          
          // Social Media
          facebookUrl: s.facebookUrl || '',
          instagramUrl: s.instagramUrl || '',
          twitterUrl: s.twitterUrl || '',
          tiktokUrl: s.tiktokUrl || '',
          youtubeUrl: s.youtubeUrl || '',
          
          // Footer Settings
          footerCopyrightText: s.footerCopyrightText || '',
          newsletterEnabled: s.newsletterEnabled !== false,
          socialMediaEnabled: s.socialMediaEnabled !== false,
          
          // Brand Assets
          logoUrl: s.logoUrl || '',
          faviconUrl: s.faviconUrl || '',
        });
      } catch (error) {
        addNotification('Gagal memuat pengaturan', 'error');
      } finally {
        setLoading(false);
      }
    })(); 
  }, [addNotification]);

  const save = async () => {
    // Validate phone numbers before saving
    if (!phoneValidation.whatsapp && form.whatsappNumber) {
      addNotification('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    if (!phoneValidation.contact && form.contactPhone) {
      addNotification('Nomor telepon tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    setSaving(true);
    try {
      await SettingsService.upsert({ ...form, logoFile, faviconFile });
      addNotification('Pengaturan berhasil disimpan!', 'success');
      
      // Reset file states after successful save
      setLogoFile(null);
      setFaviconFile(null);
      setLogoPreview('');
      setFaviconPreview('');
      
      // Reload settings
      const updatedSettings = await SettingsService.get();
      setSettings(updatedSettings);
    } catch (error) {
      addNotification('Gagal menyimpan pengaturan. Silakan coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IOSContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat pengaturan...</span>
          </div>
        </div>
      </IOSContainer>
    );
  }

  const sections = [
    { id: 'general', label: 'Umum', icon: SettingsIcon },
    { id: 'contact', label: 'Kontak', icon: Phone },
    { id: 'social', label: 'Media Sosial', icon: Globe },
    { id: 'hero', label: 'Hero Section', icon: Palette },
    { id: 'footer', label: 'Footer', icon: Users },
    { id: 'brand', label: 'Brand Assets', icon: ImageIcon },
  ];

  return (
    <IOSContainer>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Website Settings</h1>
          <p className="text-white/70">Kelola pengaturan website dan informasi perusahaan</p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                  ${activeSection === section.id
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* General Settings */}
        {activeSection === 'general' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Pengaturan Umum
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nama Website
                </label>
                <input 
                  value={form.siteName} 
                  onChange={e => setForm((p: any) => ({...p, siteName: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  placeholder="Nama website/perusahaan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Deskripsi Perusahaan
                </label>
                <textarea 
                  value={form.companyDescription} 
                  onChange={e => setForm((p: any) => ({...p, companyDescription: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  rows={4}
                  placeholder="Deskripsi singkat tentang perusahaan yang akan ditampilkan di footer"
                />
              </div>
            </div>
          </IOSCard>
        )}

        {/* Contact Information */}
        {activeSection === 'contact' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informasi Kontak
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Kontak
                  </label>
                  <input 
                    type="email"
                    value={form.contactEmail} 
                    onChange={e => setForm((p: any) => ({...p, contactEmail: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Email Support
                  </label>
                  <input 
                    type="email"
                    value={form.supportEmail} 
                    onChange={e => setForm((p: any) => ({...p, supportEmail: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Telepon Kontak
                  </label>
                  <PhoneInput
                    value={form.contactPhone}
                    onChange={(value) => setForm((p: any) => ({...p, contactPhone: value}))}
                    onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, contact: isValid}))}
                    placeholder="Masukkan Nomor Telepon"
                    className="bg-white/10 border-white/20 text-white focus:border-pink-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    WhatsApp
                  </label>
                  <PhoneInput
                    value={form.whatsappNumber}
                    onChange={(value) => setForm((p: any) => ({...p, whatsappNumber: value}))}
                    onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, whatsapp: isValid}))}
                    placeholder="Masukkan Nomor WhatsApp"
                    className="bg-white/10 border-white/20 text-white focus:border-pink-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Alamat
                </label>
                <textarea 
                  value={form.address} 
                  onChange={e => setForm((p: any) => ({...p, address: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  rows={3}
                  placeholder="Alamat lengkap perusahaan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Jam Operasional
                </label>
                <input 
                  value={form.businessHours} 
                  onChange={e => setForm((p: any) => ({...p, businessHours: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  placeholder="Contoh: Senin-Jumat 09:00-17:00 atau 24/7"
                />
              </div>
            </div>
          </IOSCard>
        )}

        {/* Social Media */}
        {activeSection === 'social' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Media Sosial
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook URL
                  </label>
                  <input 
                    type="url"
                    value={form.facebookUrl} 
                    onChange={e => setForm((p: any) => ({...p, facebookUrl: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="https://facebook.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram URL
                  </label>
                  <input 
                    type="url"
                    value={form.instagramUrl} 
                    onChange={e => setForm((p: any) => ({...p, instagramUrl: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Twitter className="w-4 h-4 inline mr-2" />
                    Twitter/X URL
                  </label>
                  <input 
                    type="url"
                    value={form.twitterUrl} 
                    onChange={e => setForm((p: any) => ({...p, twitterUrl: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Youtube className="w-4 h-4 inline mr-2" />
                    YouTube URL
                  </label>
                  <input 
                    type="url"
                    value={form.youtubeUrl} 
                    onChange={e => setForm((p: any) => ({...p, youtubeUrl: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="https://youtube.com/channel/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    TikTok URL
                  </label>
                  <input 
                    type="url"
                    value={form.tiktokUrl} 
                    onChange={e => setForm((p: any) => ({...p, tiktokUrl: e.target.value}))} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Hero Section */}
        {activeSection === 'hero' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Hero Section
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Hero Title
                </label>
                <input 
                  value={form.heroTitle} 
                  onChange={e => setForm((p: any) => ({...p, heroTitle: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  placeholder="Judul utama halaman"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Hero Subtitle
                </label>
                <textarea 
                  value={form.heroSubtitle} 
                  onChange={e => setForm((p: any) => ({...p, heroSubtitle: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  rows={3}
                  placeholder="Deskripsi atau subtitle"
                />
              </div>
            </div>
          </IOSCard>
        )}

        {/* Footer Settings */}
        {activeSection === 'footer' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pengaturan Footer
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Teks Copyright
                </label>
                <input 
                  value={form.footerCopyrightText} 
                  onChange={e => setForm((p: any) => ({...p, footerCopyrightText: e.target.value}))} 
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300" 
                  placeholder="All rights reserved."
                />
                <p className="text-xs text-white/60 mt-2">
                  Teks yang akan ditampilkan di footer. Tahun akan ditambahkan otomatis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/20">
                  <input 
                    type="checkbox"
                    checked={form.newsletterEnabled}
                    onChange={e => setForm((p: any) => ({...p, newsletterEnabled: e.target.checked}))}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/30 rounded focus:ring-pink-500/50"
                  />
                  <div>
                    <label className="text-sm font-medium text-white">
                      Aktifkan Newsletter
                    </label>
                    <p className="text-xs text-white/60">
                      Tampilkan form berlangganan newsletter di footer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/20">
                  <input 
                    type="checkbox"
                    checked={form.socialMediaEnabled}
                    onChange={e => setForm((p: any) => ({...p, socialMediaEnabled: e.target.checked}))}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/30 rounded focus:ring-pink-500/50"
                  />
                  <div>
                    <label className="text-sm font-medium text-white">
                      Tampilkan Media Sosial
                    </label>
                    <p className="text-xs text-white/60">
                      Tampilkan link media sosial di footer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Brand Assets */}
        {activeSection === 'brand' && (
          <IOSCard padding="large">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Brand Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Logo Website
                </label>
                <div className="space-y-4">
                  <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl hover:bg-white/20 hover:border-pink-500/50 cursor-pointer transition-all duration-300 group">
                    <ImageIcon className="w-5 h-5 text-white/60 group-hover:text-pink-400" />
                    <span className="text-white/80 group-hover:text-white">Pilih Logo</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={e => {
                        const f = e.target.files?.[0] || null; 
                        setLogoFile(f);
                        if (f) setLogoPreview(URL.createObjectURL(f));
                      }} 
                    />
                  </label>
                  {(logoPreview || settings?.logoUrl) && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/20">
                      <img 
                        src={logoPreview || settings?.logoUrl || ''} 
                        alt="Logo preview" 
                        className="h-16 w-auto mx-auto rounded-lg object-contain" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Favicon
                </label>
                <div className="space-y-4">
                  <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl hover:bg-white/20 hover:border-pink-500/50 cursor-pointer transition-all duration-300 group">
                    <ImageIcon className="w-5 h-5 text-white/60 group-hover:text-pink-400" />
                    <span className="text-white/80 group-hover:text-white">Pilih Favicon</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={e => {
                        const f = e.target.files?.[0] || null; 
                        setFaviconFile(f);
                        if (f) setFaviconPreview(URL.createObjectURL(f));
                      }} 
                    />
                  </label>
                  {(faviconPreview || settings?.faviconUrl) && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/20">
                      <img 
                        src={faviconPreview || settings?.faviconUrl || ''} 
                        alt="Favicon preview" 
                        className="h-12 w-12 mx-auto rounded-lg object-contain" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </IOSCard>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <IOSButton 
            onClick={save} 
            disabled={saving}
            size="large"
            className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white px-8 py-3"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </IOSButton>
        </div>
      </div>
    </IOSContainer>
  );
};

export default EnhancedAdminSettings;
