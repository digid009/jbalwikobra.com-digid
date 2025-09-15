// Clear admin cache and force fresh data
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearCacheAndRefresh() {
  console.log('🧹 CLEARING CACHE AND FORCING FRESH DATA...\n');
  
  // Clear localStorage cache
  console.log('Clearing browser cache...');
  // This would need to be done in browser console: localStorage.clear();
  
  console.log('💡 INSTRUCTIONS TO FIX DASHBOARD:');
  console.log('================================');
  console.log('1. Open your browser Developer Tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Run this command: localStorage.clear()');
  console.log('4. Refresh the page (F5 or Ctrl+R)');
  console.log('5. Check if dashboard now shows correct data:');
  console.log('   - Total Orders: 178');
  console.log('   - Total Users: 47');
  console.log('   - Total Products: 124');
  console.log('   - Total Revenue: Rp 24,350,360');
  console.log('   - Completed Orders: 20');
  console.log('   - Pending Orders: 47');
  
  console.log('\n🔍 If cache clearing doesn\'t work, there may be a service worker or');
  console.log('   network cache issue. Try hard refresh (Ctrl+Shift+R)');
}

clearCacheAndRefresh();
