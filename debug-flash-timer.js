require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

function getSupabaseCredentials() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not found in environment variables');
  }
  
  return { url, key };
}

function calculateTimeRemaining(endTime) {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

async function debugFlashTimer() {
  const { url, key } = getSupabaseCredentials();
  const supabase = createClient(url, key);
  
  console.log('=== FLASH SALE TIMER DEBUG ===');
  console.log(`⏰ Current time: ${new Date().toISOString()}`);
  
  // Get flash sales data
  const { data, error } = await supabase
    .from('flash_sales')
    .select(`
      id,
      end_time,
      is_active,
      products (name)
    `)
    .eq('is_active', true)
    .limit(5);

  if (error) {
    console.log('❌ Query error:', error.message);
    return;
  }

  console.log(`\n📊 Found ${data?.length || 0} active flash sales`);
  
  if (data && data.length > 0) {
    data.forEach((sale, index) => {
      console.log(`\n${index + 1}. ${sale.products?.name || 'Unknown Product'}`);
      console.log(`   Flash Sale ID: ${sale.id}`);
      console.log(`   End Time: ${sale.end_time}`);
      
      const endTime = new Date(sale.end_time);
      const now = new Date();
      console.log(`   End Time (parsed): ${endTime.toISOString()}`);
      console.log(`   Current Time: ${now.toISOString()}`);
      console.log(`   Time difference (ms): ${endTime.getTime() - now.getTime()}`);
      
      const timeRemaining = calculateTimeRemaining(sale.end_time);
      console.log(`   Time Remaining:`, timeRemaining);
      
      if (timeRemaining.isExpired) {
        console.log(`   🔴 EXPIRED!`);
      } else {
        console.log(`   🟢 ACTIVE - ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m left`);
      }
    });
    
    console.log('\n🔧 RECOMMENDED ACTION:');
    const expiredCount = data.filter(sale => calculateTimeRemaining(sale.end_time).isExpired).length;
    if (expiredCount > 0) {
      console.log(`⚠️  ${expiredCount} flash sales have expired end times!`);
      console.log('   Need to update end times to future dates for testing.');
    } else {
      console.log('✅ All flash sales have valid future end times.');
    }
  }
}

debugFlashTimer().catch(console.error);
