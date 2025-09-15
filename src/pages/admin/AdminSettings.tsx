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
  Users,
  Bug,
  TestTube,
  Package,
  AlertCircle
} from 'lucide-react';
import PhoneInput from '../../components/PhoneInput';
import { useToast } from '../../components/Toast';
// DS migration: replace legacy iOS components with DS panels/buttons
import { adminInputBase, adminCheckboxBase } from './components/ui/InputStyles';
import { adminNotificationService } from '../../services/adminNotificationService';
import { enhancedAdminService } from '../../services/enhancedAdminService';
import { AdminPageHeaderV2 } from './components/ui';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
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
  const [testLoading, setTestLoading] = useState({ notification: false, product: false });

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
        showToast('Gagal memuat pengaturan', 'error');
      } finally {
        setLoading(false);
      }
    })(); 
  }, [showToast]);

  const save = async () => {
    // Validate phone numbers before saving
    if (!phoneValidation.whatsapp && form.whatsappNumber) {
      showToast('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    if (!phoneValidation.contact && form.contactPhone) {
      showToast('Nomor telepon tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    setSaving(true);
    try {
      await SettingsService.upsert({ ...form, logoFile, faviconFile });
      showToast('Pengaturan berhasil disimpan!', 'success');
      
      // Reset file states after successful save
      setLogoFile(null);
      setFaviconFile(null);
      setLogoPreview('');
      setFaviconPreview('');
      
      // Reload settings
      const updatedSettings = await SettingsService.get();
      setSettings(updatedSettings);
    } catch (error) {
      showToast('Gagal menyimpan pengaturan. Silakan coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(prev => ({ ...prev, notification: true }));
    try {
      await adminNotificationService.createTestNotification();
      showToast('Test notification berhasil dibuat!', 'success');
    } catch (error) {
      console.error('Failed to create test notification:', error);
      showToast('Gagal membuat test notification', 'error');
    } finally {
      setTestLoading(prev => ({ ...prev, notification: false }));
    }
  };

  const handleTestProduct = async () => {
    setTestLoading(prev => ({ ...prev, product: true }));
    try {
      const result = await enhancedAdminService.createTestProduct();
      if (result.success) {
        showToast('Test product berhasil dibuat!', 'success');
      } else {
        throw new Error(result.error || 'Failed to create test product');
      }
    } catch (error) {
      console.error('Failed to create test product:', error);
      showToast('Gagal membuat test product', 'error');
    } finally {
      setTestLoading(prev => ({ ...prev, product: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3 text-ds-text">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat pengaturan...</span>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'general', label: 'Umum', icon: SettingsIcon },
    { id: 'contact', label: 'Kontak', icon: Phone },
    { id: 'social', label: 'Media Sosial', icon: Globe },
    { id: 'hero', label: 'Hero Section', icon: Palette },
    { id: 'footer', label: 'Footer', icon: Users },
    { id: 'brand', label: 'Brand Assets', icon: ImageIcon },
    { id: 'debug', label: 'Debug', icon: Bug },
  ];

  return (
    <div className="p-4">
      <div className="space-y-6">
        <AdminPageHeaderV2
          title="Website Settings"
          subtitle="Manage website configuration and company information"
          icon={SettingsIcon}
        />

        {/* Section Navigation */}
  <div className="flex flex-wrap gap-2 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-token">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                  ${activeSection === section.id
        ? 'bg-ds-pink text-white'
        : 'text-ds-text-secondary hover:text-ds-text hover:bg-[var(--bg-tertiary)]'
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
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-ds-text mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Pengaturan Umum
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Nama Website
                </label>
                <input 
                  value={form.siteName} 
                  onChange={e => setForm((p: any) => ({...p, siteName: e.target.value}))} 
                  className={adminInputBase}
                  placeholder="Nama website/perusahaan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Deskripsi Perusahaan
                </label>
                <textarea 
                  value={form.companyDescription} 
                  onChange={e => setForm((p: any) => ({...p, companyDescription: e.target.value}))} 
                  className={adminInputBase}
                  rows={4}
                  placeholder="Deskripsi singkat tentang perusahaan yang akan ditampilkan di footer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {activeSection === 'contact' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-ds-text mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informasi Kontak
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Kontak
                  </label>
                  <input 
                    type="email"
                    value={form.contactEmail} 
                    onChange={e => setForm((p: any) => ({...p, contactEmail: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Email Support
                  </label>
                  <input 
                    type="email"
                    value={form.supportEmail} 
                    onChange={e => setForm((p: any) => ({...p, supportEmail: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    Telepon Kontak
                  </label>
                  <PhoneInput
                    value={form.contactPhone}
                    onChange={(value) => setForm((p: any) => ({...p, contactPhone: value}))}
                    onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, contact: isValid}))}
                    placeholder="Masukkan Nomor Telepon"
                    className="text-ds-text"
                    disableAutoDetection={true}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    WhatsApp
                  </label>
                  <PhoneInput
                    value={form.whatsappNumber}
                    onChange={(value) => setForm((p: any) => ({...p, whatsappNumber: value}))}
                    onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, whatsapp: isValid}))}
                    placeholder="Masukkan Nomor WhatsApp"
                    className="text-ds-text"
                    disableAutoDetection={true}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Alamat
                </label>
                <textarea 
                  value={form.address} 
                  onChange={e => setForm((p: any) => ({...p, address: e.target.value}))} 
                  className={adminInputBase}
                  rows={3}
                  placeholder="Alamat lengkap perusahaan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Jam Operasional
                </label>
                <input 
                  value={form.businessHours} 
                  onChange={e => setForm((p: any) => ({...p, businessHours: e.target.value}))} 
                  className={adminInputBase}
                  placeholder="Contoh: Senin-Jumat 09:00-17:00 atau 24/7"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media */}
        {activeSection === 'social' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-ds-text mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Media Sosial
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook URL
                  </label>
                  <input 
                    type="url"
                    value={form.facebookUrl} 
                    onChange={e => setForm((p: any) => ({...p, facebookUrl: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="https://facebook.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram URL
                  </label>
                  <input 
                    type="url"
                    value={form.instagramUrl} 
                    onChange={e => setForm((p: any) => ({...p, instagramUrl: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Twitter className="w-4 h-4 inline mr-2" />
                    Twitter/X URL
                  </label>
                  <input 
                    type="url"
                    value={form.twitterUrl} 
                    onChange={e => setForm((p: any) => ({...p, twitterUrl: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    <Youtube className="w-4 h-4 inline mr-2" />
                    YouTube URL
                  </label>
                  <input 
                    type="url"
                    value={form.youtubeUrl} 
                    onChange={e => setForm((p: any) => ({...p, youtubeUrl: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="https://youtube.com/channel/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                    TikTok URL
                  </label>
                  <input 
                    type="url"
                    value={form.tiktokUrl} 
                    onChange={e => setForm((p: any) => ({...p, tiktokUrl: e.target.value}))} 
                    className={adminInputBase}
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {activeSection === 'hero' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-ds-text mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Hero Section
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Hero Title
                </label>
                <input 
                  value={form.heroTitle} 
                  onChange={e => setForm((p: any) => ({...p, heroTitle: e.target.value}))} 
                  className={adminInputBase}
                  placeholder="Judul utama halaman"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Hero Subtitle
                </label>
                <textarea 
                  value={form.heroSubtitle} 
                  onChange={e => setForm((p: any) => ({...p, heroSubtitle: e.target.value}))} 
                  className={adminInputBase}
                  rows={3}
                  placeholder="Deskripsi atau subtitle"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Settings */}
        {activeSection === 'footer' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-ds-text mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pengaturan Footer
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ds-text-secondary mb-2">
                  Teks Copyright
                </label>
                <input 
                  value={form.footerCopyrightText} 
                  onChange={e => setForm((p: any) => ({...p, footerCopyrightText: e.target.value}))} 
                  className={adminInputBase}
                  placeholder="All rights reserved."
                />
                <p className="text-xs text-ds-text-tertiary mt-2">
                  Teks yang akan ditampilkan di footer. Tahun akan ditambahkan otomatis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl border border-token">
                  <input 
                    type="checkbox"
                    checked={form.newsletterEnabled}
                    onChange={e => setForm((p: any) => ({...p, newsletterEnabled: e.target.checked}))}
                    className={adminCheckboxBase}
                  />
                  <div>
                    <label className="text-sm font-medium text-ds-text">
                      Aktifkan Newsletter
                    </label>
                    <p className="text-xs text-ds-text-tertiary">
                      Tampilkan form berlangganan newsletter di footer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl border border-token">
                  <input 
                    type="checkbox"
                    checked={form.socialMediaEnabled}
                    onChange={e => setForm((p: any) => ({...p, socialMediaEnabled: e.target.checked}))}
                    className={adminCheckboxBase}
                  />
                  <div>
                    <label className="text-sm font-medium text-ds-text">
                      Tampilkan Media Sosial
                    </label>
                    <p className="text-xs text-ds-text-tertiary">
                      Tampilkan link media sosial di footer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brand Assets */}
        {activeSection === 'brand' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
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
          </div>
        )}

        {/* Debug Section */}
        {activeSection === 'debug' && (
          <div className="dashboard-data-panel padded rounded-xl p-stack-lg">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Debug Tools
            </h2>
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Peringatan</span>
                </div>
                <p className="text-sm text-yellow-300/80">
                  Tools ini hanya untuk testing dan debugging. Jangan gunakan di production.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Test Notification
                  </h3>
                  <p className="text-sm text-white/70">
                    Membuat notifikasi test untuk debugging sistem notifikasi
                  </p>
                  <button
                    onClick={handleTestNotification}
                    disabled={testLoading.notification}
                    className="btn btn-secondary btn-sm w-full"
                  >
                    {testLoading.notification ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Membuat...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Notifikasi
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Test Product
                  </h3>
                  <p className="text-sm text-white/70">
                    Membuat produk test untuk debugging sistem produk
                  </p>
                  <button
                    onClick={handleTestProduct}
                    disabled={testLoading.product}
                    className="btn btn-secondary btn-sm w-full"
                  >
                    {testLoading.product ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Membuat...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Test Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button - Only show for non-debug sections */}
        {activeSection !== 'debug' && (
          <div className="flex justify-end pt-6">
            <button 
              onClick={save} 
              disabled={saving}
              className="btn btn-primary bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white px-8 py-3"
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
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
