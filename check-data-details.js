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

async function checkDataDetails() {
  const creds = getSupabaseCredentials();
  
  if (!creds.url || !creds.key) {
    console.error('Cannot find Supabase credentials');
    return;
  }
  
  const supabase = createClient(creds.url, creds.key);
  
  console.log('=== CHECKING BANNERS TABLE ===');
  try {
    const { data: banners, error: bannerError } = await supabase
      .from('banners')
      .select('*')
      .limit(5);
    
    console.log('Banners count:', banners?.length || 0);
    console.log('Banners data:', JSON.stringify(banners, null, 2));
    if (bannerError) console.log('Banners error:', bannerError);
  } catch (err) {
    console.error('Banner check failed:', err.message);
  }
  
  console.log('\n=== CHECKING FEED_POSTS TABLE ===');
  try {
    const { data: feedPosts, error: feedError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(3);
    
    console.log('Feed posts count:', feedPosts?.length || 0);
    console.log('Feed posts data:', JSON.stringify(feedPosts, null, 2));
    if (feedError) console.log('Feed error:', feedError);
  } catch (err) {
    console.error('Feed check failed:', err.message);
  }
  
  console.log('\n=== CHECKING POSTS TABLE (fallback) ===');
  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(3);
    
    console.log('Posts count:', posts?.length || 0);
    console.log('Posts data:', JSON.stringify(posts, null, 2));
    if (postsError) console.log('Posts error:', postsError);
  } catch (err) {
    console.error('Posts check failed:', err.message);
  }
  
  // Check if we need to insert sample data
  console.log('\n=== RECOMMENDATIONS ===');
  
  const { data: bannerCount } = await supabase.from('banners').select('*', { count: 'exact', head: true });
  const { data: postCount } = await supabase.from('feed_posts').select('*', { count: 'exact', head: true });
  
  if (!bannerCount || bannerCount.length === 0) {
    console.log('📝 BANNERS TABLE IS EMPTY - Need to insert sample banners');
  }
  
  if (!postCount || postCount.length === 0) {
    console.log('📝 FEED_POSTS TABLE IS EMPTY - Need to insert sample posts');
  }
}

checkDataDetails().catch(console.error);
