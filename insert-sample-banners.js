const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getSupabaseCredentials() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const urlMatch = envContent.match(/REACT_APP_SUPABASE_URL=([^\s]+)/);
      const keyMatch = envContent.match(/REACT_APP_SUPABASE_ANON_KEY=([^\s]+)/);
      
      return {
        url: urlMatch && urlMatch[1] ? urlMatch[1].trim() : null,
        key: keyMatch && keyMatch[1] ? keyMatch[1].trim() : null
      };
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
  
  return { url: null, key: null };
}

async function insertSampleBanners() {
  const creds = getSupabaseCredentials();
  
  if (!creds.url || !creds.key) {
    console.error('Cannot find Supabase credentials');
    return;
  }
  
  const supabase = createClient(creds.url, creds.key);
  
  const sampleBanners = [
    {
      title: 'Flash Sale Setiap Hari',
      subtitle: 'Diskon hingga 70% untuk akun terpilih',
      image_url: 'https://images.unsplash.com/photo-1602367289840-74b3dfb3d7e8?w=1200',
      link_url: '/flash-sales',
      sort_order: 1,
      is_active: true
    },
    {
      title: 'TOP UP Game Termurah',
      subtitle: 'Proses kilat, harga terjangkau',
      image_url: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200',
      link_url: '/products',
      sort_order: 2,
      is_active: true
    },
    {
      title: 'Jual Akun Game Rare',
      subtitle: 'Koleksi akun game terlengkap',
      image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200',
      link_url: '/accounts',
      sort_order: 3,
      is_active: true
    }
  ];
  
  console.log('Inserting sample banners...');
  
  try {
    const { data, error } = await supabase
      .from('banners')
      .insert(sampleBanners)
      .select();
    
    if (error) {
      console.error('Error inserting banners:', error);
      return;
    }
    
    console.log('✅ Successfully inserted banners:', data?.length);
    console.log('Banner data:', JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('Failed to insert banners:', err);
  }
}

insertSampleBanners().catch(console.error);
