import React, { useEffect, useState } from 'react';
import { SettingsService } from '../../services/settingsService';
import { WebsiteSettings } from '../../types';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import PhoneInput from '../../components/PhoneInput';
import { useToast } from '../../components/Toast';
import { IOSCard, IOSButton, IOSContainer } from '../../components/ios/IOSDesignSystem';

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
  const [phoneValidation, setPhoneValidation] = useState({ whatsapp: true });

  useEffect(() => { (async () => {
    setLoading(true);
    const s = await SettingsService.get();
    setSettings(s);
    setForm({
      siteName: s.siteName || '',
      heroTitle: s.heroTitle || '',
      heroSubtitle: s.heroSubtitle || '',
      contactEmail: s.contactEmail || '',
      whatsappNumber: s.whatsappNumber || '',
      address: s.address || '',
      facebookUrl: s.facebookUrl || '',
      instagramUrl: s.instagramUrl || '',
      tiktokUrl: s.tiktokUrl || '',
      youtubeUrl: s.youtubeUrl || '', // Add YouTube field
      logoUrl: s.logoUrl || '',
      faviconUrl: s.faviconUrl || '',
    });
    setLoading(false);
  })(); }, []);

  const save = async () => {
    // Validate phone number before saving
    if (!phoneValidation.whatsapp && form.whatsappNumber) {
      showToast('Nomor WhatsApp tidak valid. Pastikan format sudah benar.', 'error');
      return;
    }
    
    setSaving(true);
    const updated = await SettingsService.upsert({ ...form, logoFile, faviconFile });
    setSaving(false);
    if (updated) {
      setSettings(updated);
      showToast('Pengaturan berhasil disimpan', 'success');
    }
  };

  if (loading) {
    return (
      <IOSContainer className="py-6">
        <div className="flex items-center justify-center gap-2 text-ios-text-secondary">
          <Loader2 className="animate-spin" size={18} /> 
          Memuat pengaturan...
        </div>
      </IOSContainer>
    );
  }

  return (
    <IOSContainer maxWidth="full" className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ios-text">Pengaturan Website</h1>
        <p className="text-ios-text-secondary">Kelola informasi dan konfigurasi website</p>
      </div>

      <div className="space-y-6">
        {/* Site Information */}
        <IOSCard padding="large">
          <h2 className="text-lg font-semibold text-ios-text mb-4">Informasi Situs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Nama Situs
              </label>
              <input 
                value={form.siteName} 
                onChange={e => setForm((p: any) => ({...p, siteName: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="Nama website Anda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Email Kontak
              </label>
              <input 
                type="email"
                value={form.contactEmail} 
                onChange={e => setForm((p: any) => ({...p, contactEmail: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                WhatsApp
              </label>
              <PhoneInput
                value={form.whatsappNumber}
                onChange={(value) => setForm((p: any) => ({...p, whatsappNumber: value}))}
                onValidationChange={(isValid) => setPhoneValidation(prev => ({...prev, whatsapp: isValid}))}
                placeholder="Masukkan Nomor WhatsApp"
                className="bg-ios-surface border-ios-border text-ios-text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Alamat
              </label>
              <textarea 
                value={form.address} 
                onChange={e => setForm((p: any) => ({...p, address: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                rows={3}
                placeholder="Alamat lengkap"
              />
            </div>
          </div>
        </IOSCard>

        {/* Hero Section */}
        <IOSCard padding="large">
          <h2 className="text-lg font-semibold text-ios-text mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Hero Title
              </label>
              <input 
                value={form.heroTitle} 
                onChange={e => setForm((p: any) => ({...p, heroTitle: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="Judul utama halaman"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Hero Subtitle
              </label>
              <input 
                value={form.heroSubtitle} 
                onChange={e => setForm((p: any) => ({...p, heroSubtitle: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="Deskripsi singkat"
              />
            </div>
          </div>
        </IOSCard>

        {/* Social Media */}
        <IOSCard padding="large">
          <h2 className="text-lg font-semibold text-ios-text mb-4">Media Sosial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Facebook URL
              </label>
              <input 
                type="url"
                value={form.facebookUrl} 
                onChange={e => setForm((p: any) => ({...p, facebookUrl: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="https://facebook.com/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Instagram URL
              </label>
              <input 
                type="url"
                value={form.instagramUrl} 
                onChange={e => setForm((p: any) => ({...p, instagramUrl: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="https://instagram.com/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                TikTok URL
              </label>
              <input 
                type="url"
                value={form.tiktokUrl} 
                onChange={e => setForm((p: any) => ({...p, tiktokUrl: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="https://tiktok.com/@username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                YouTube URL
              </label>
              <input 
                type="url"
                value={form.youtubeUrl} 
                onChange={e => setForm((p: any) => ({...p, youtubeUrl: e.target.value}))} 
                className="w-full px-3 py-2 border border-ios-border bg-ios-surface text-ios-text rounded-lg focus:ring-2 focus:ring-ios-accent focus:border-ios-accent" 
                placeholder="https://youtube.com/channel/..."
              />
            </div>
          </div>
        </IOSCard>

        {/* Brand Assets */}
        <IOSCard padding="large">
          <h2 className="text-lg font-semibold text-ios-text mb-4">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Logo Website
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-ios-border rounded-lg hover:bg-ios-surface cursor-pointer transition-colors">
                  <ImageIcon size={16} className="text-ios-text-secondary" /> 
                  Pilih Logo
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
                  <img 
                    src={logoPreview || settings?.logoUrl || ''} 
                    alt="logo preview" 
                    className="h-12 w-auto rounded border border-ios-border object-contain bg-white" 
                  />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                Favicon
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-ios-border rounded-lg hover:bg-ios-surface cursor-pointer transition-colors">
                  <ImageIcon size={16} className="text-ios-text-secondary" /> 
                  Pilih Favicon
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
                  <img 
                    src={faviconPreview || settings?.faviconUrl || ''} 
                    alt="favicon preview" 
                    className="h-8 w-8 rounded border border-ios-border object-contain bg-white" 
                  />
                )}
              </div>
            </div>
          </div>
        </IOSCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <IOSButton 
            onClick={save} 
            disabled={saving}
            size="large"
            className="flex items-center gap-2"
          >
            <Save size={16} /> 
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </IOSButton>
        </div>
      </div>
    </IOSContainer>
  );
};

export default AdminSettings;
