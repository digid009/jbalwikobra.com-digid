import { supabase } from './supabase';
import { WebsiteSettings } from '../types';
import { uploadFile, deletePublicUrls } from './storageService';

const DEFAULT_SETTINGS: WebsiteSettings = {
  id: 'default',
  siteName: 'JB Alwikobra',
  heroTitle: 'Jual Beli & Rental Akun Game',
  heroSubtitle: 'Aman, cepat, terpercaya',
};

export class SettingsService {
  // Small in-memory cache to minimize repeated DB fetches across the SPA session
  private static cache: { v: WebsiteSettings; t: number } | null = null;
  private static TTL = 5 * 60 * 1000; // 5 minutes

  static async get(): Promise<WebsiteSettings> {
    try {
      console.log('🔍 SettingsService.get() called');
      
      // Serve from cache if fresh
      if (this.cache && Date.now() - this.cache.t < this.TTL) {
        console.log('📦 Serving from cache');
        return this.cache.v;
      }

      if (!supabase) {
        console.log('⚠️ No Supabase client, using DEFAULT_SETTINGS');
        this.cache = { v: DEFAULT_SETTINGS, t: Date.now() };
        return DEFAULT_SETTINGS;
      }
      
      console.log('🌐 Fetching from database...');
      const { data, error } = await (supabase as any)
        .from('website_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('📭 No data found, using DEFAULT_SETTINGS');
        return DEFAULT_SETTINGS;
      }
      
      console.log('✅ Database data fetched:', {
        id: data.id,
        site_name: data.site_name,
        contact_email: data.contact_email,
        whatsapp_number: data.whatsapp_number
      });
      const result: WebsiteSettings = {
        id: data.id ?? 'default',
        siteName: data.site_name ?? DEFAULT_SETTINGS.siteName,
        logoUrl: data.logo_url ?? undefined,
        faviconUrl: data.favicon_url ?? undefined,
        contactEmail: data.contact_email ?? undefined,
        supportEmail: data.support_email ?? undefined,
        contactPhone: data.contact_phone ?? undefined,
        whatsappNumber: data.whatsapp_number ?? undefined,
        address: data.address ?? undefined,
        businessHours: data.business_hours ?? undefined,
        companyDescription: data.company_description ?? undefined,
        facebookUrl: data.facebook_url ?? undefined,
        instagramUrl: data.instagram_url ?? undefined,
        tiktokUrl: data.tiktok_url ?? undefined,
        youtubeUrl: data.youtube_url ?? undefined,
        twitterUrl: data.twitter_url ?? undefined,
        heroTitle: data.hero_title ?? undefined,
        heroSubtitle: data.hero_subtitle ?? undefined,
        footerCopyrightText: data.footer_copyright_text ?? undefined,
        newsletterEnabled: data.newsletter_enabled ?? true,
        socialMediaEnabled: data.social_media_enabled ?? true,
        topupGameUrl: data.topup_game_url ?? undefined,
        whatsappChannelUrl: data.whatsapp_channel_url ?? undefined,
        heroButtonUrl: data.hero_button_url ?? undefined,
        updatedAt: data.updated_at ?? undefined,
      };
      
      console.log('🎯 Mapped result:', {
        siteName: result.siteName,
        contactEmail: result.contactEmail,
        whatsappNumber: result.whatsappNumber,
        businessHours: result.businessHours,
        whatsappChannelUrl: result.whatsappChannelUrl,
        topupGameUrl: result.topupGameUrl
      });
      
      this.cache = { v: result, t: Date.now() };
      return result;
    } catch (e) {
      console.error('SettingsService.get error:', e);
      return DEFAULT_SETTINGS;
    }
  }

  static async upsert(input: Partial<WebsiteSettings> & { logoFile?: File | null; faviconFile?: File | null }): Promise<WebsiteSettings | null> {
    try {
      if (!supabase) return null;
      const current = await this.get();
      const payload: any = {
        site_name: input.siteName ?? current.siteName ?? null,
        contact_email: input.contactEmail ?? current.contactEmail ?? null,
        support_email: input.supportEmail ?? current.supportEmail ?? null,
        contact_phone: input.contactPhone ?? current.contactPhone ?? null,
        whatsapp_number: input.whatsappNumber ?? current.whatsappNumber ?? null,
        address: input.address ?? current.address ?? null,
        business_hours: input.businessHours ?? current.businessHours ?? null,
        company_description: input.companyDescription ?? current.companyDescription ?? null,
        facebook_url: input.facebookUrl ?? current.facebookUrl ?? null,
        instagram_url: input.instagramUrl ?? current.instagramUrl ?? null,
        tiktok_url: input.tiktokUrl ?? current.tiktokUrl ?? null,
        youtube_url: input.youtubeUrl ?? current.youtubeUrl ?? null,
        twitter_url: input.twitterUrl ?? current.twitterUrl ?? null,
        hero_title: input.heroTitle ?? current.heroTitle ?? null,
        hero_subtitle: input.heroSubtitle ?? current.heroSubtitle ?? null,
        footer_copyright_text: input.footerCopyrightText ?? current.footerCopyrightText ?? null,
        newsletter_enabled: input.newsletterEnabled ?? current.newsletterEnabled ?? true,
        social_media_enabled: input.socialMediaEnabled ?? current.socialMediaEnabled ?? true,
        topup_game_url: input.topupGameUrl ?? current.topupGameUrl ?? null,
        whatsapp_channel_url: input.whatsappChannelUrl ?? current.whatsappChannelUrl ?? null,
        hero_button_url: input.heroButtonUrl ?? current.heroButtonUrl ?? null,
      };
      if (input.logoFile instanceof File) {
        const result = await uploadFile(input.logoFile, 'settings');
        if (result.url) payload.logo_url = result.url;
      } else if (input.logoUrl) {
        payload.logo_url = input.logoUrl;
      }
      if (input.faviconFile instanceof File) {
        const result = await uploadFile(input.faviconFile, 'settings');
        if (result.url) payload.favicon_url = result.url;
      } else if (input.faviconUrl) {
        payload.favicon_url = input.faviconUrl;
      }
      const { data, error } = await (supabase as any)
        .from('website_settings')
        .upsert({ id: current.id === 'default' ? undefined : current.id, ...payload }, { onConflict: 'id' })
        .select()
        .maybeSingle();
      if (error) throw error;
      const row = data || payload;
  const result: WebsiteSettings = {
        id: row.id ?? current.id ?? 'default',
        siteName: row.site_name ?? current.siteName,
        logoUrl: row.logo_url ?? current.logoUrl,
        faviconUrl: row.favicon_url ?? current.faviconUrl,
        contactEmail: row.contact_email ?? current.contactEmail,
        supportEmail: row.support_email ?? current.supportEmail,
        contactPhone: row.contact_phone ?? current.contactPhone,
        whatsappNumber: row.whatsapp_number ?? current.whatsappNumber,
        address: row.address ?? current.address,
        businessHours: row.business_hours ?? current.businessHours,
        companyDescription: row.company_description ?? current.companyDescription,
        facebookUrl: row.facebook_url ?? current.facebookUrl,
        instagramUrl: row.instagram_url ?? current.instagramUrl,
        tiktokUrl: row.tiktok_url ?? current.tiktokUrl,
        youtubeUrl: row.youtube_url ?? current.youtubeUrl,
        twitterUrl: row.twitter_url ?? current.twitterUrl,
        heroTitle: row.hero_title ?? current.heroTitle,
        heroSubtitle: row.hero_subtitle ?? current.heroSubtitle,
        footerCopyrightText: row.footer_copyright_text ?? current.footerCopyrightText,
        newsletterEnabled: row.newsletter_enabled ?? current.newsletterEnabled ?? true,
        socialMediaEnabled: row.social_media_enabled ?? current.socialMediaEnabled ?? true,
        topupGameUrl: row.topup_game_url ?? current.topupGameUrl,
        whatsappChannelUrl: row.whatsapp_channel_url ?? current.whatsappChannelUrl,
        heroButtonUrl: row.hero_button_url ?? current.heroButtonUrl,
        updatedAt: row.updated_at ?? new Date().toISOString(),
      };
  // Invalidate/refresh cache
  this.cache = { v: result, t: Date.now() };
  return result;
    } catch (e) {
      console.error('SettingsService.upsert error:', e);
      return null;
    }
  }
}
