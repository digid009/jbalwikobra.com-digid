const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Membaca file .env untuk mendapatkan kredensial Supabase
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

async function checkDatabaseSchema() {
  const creds = getSupabaseCredentials();
  
  if (!creds.url || !creds.key) {
    console.error('Tidak dapat menemukan kredensial Supabase di file .env');
    console.log('Gunakan format berikut di file .env:');
    console.log('REACT_APP_SUPABASE_URL=https://<project-id>.supabase.co');
    console.log('REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>');
    process.exit(1);
  }
  
  console.log(`Terhubung ke Supabase di ${creds.url}`);
  const supabase = createClient(creds.url, creds.key);
  
  try {
    // Memeriksa tabel yang ada dengan metadata API
    console.log('\n=== MEMERIKSA TABEL ===');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('schema_info')
      .eq('table_schema', 'public')
      .select('table_name');
      
    if (tablesError) {
      console.error('Error memeriksa tabel:', tablesError);
      
      // Alternatif: Coba memeriksa tabel secara langsung
      console.log('\nMencoba metode alternatif untuk memeriksa tabel...');
      
      // List tabel yang kemungkinan ada berdasarkan kode aplikasi
      const possibleTables = [
        'banners',
        'banner',
        'posts',
        'feed',
        'feed_posts',
        'products',
        'users',
        'profiles'
      ];
      
      for (const table of possibleTables) {
        console.log(`\nMemeriksa tabel '${table}'...`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (!error) {
          console.log(`✅ Tabel '${table}' ada!`);
          // Coba dapatkan schema tabel
          console.log(`Contoh data: ${JSON.stringify(data).substring(0, 100)}...`);
        } else {
          console.log(`❌ Tabel '${table}' tidak ditemukan atau error: ${error.message}`);
        }
      }
    } else {
      console.log('Tabel yang ditemukan:');
      tablesData.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
      
      // Memeriksa detail dari tabel banner dan posts
      for (const tableName of ['banners', 'banner', 'posts', 'feed_posts', 'feed']) {
        if (tablesData.some(t => t.table_name === tableName)) {
          console.log(`\n=== DETAIL TABEL ${tableName.toUpperCase()} ===`);
          const { data, error } = await supabase.from(tableName).select('*').limit(1);
          
          if (!error && data) {
            console.log(`Struktur: ${JSON.stringify(data[0] || {}, null, 2)}`);
            
            // Cek jumlah total record
            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
              
            if (!countError) {
              console.log(`Total record: ${count}`);
            }
          } else {
            console.log(`Error: ${error?.message || 'Unknown error'}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error tidak terduga:', err);
  }
}

checkDatabaseSchema();
