// Script untuk testing Debug Tools
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cvdduvwbyvbhvqdydvoo.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZGR1dndieXZiaHZxZHlkdm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzNTk2MjcsImV4cCI6MjA0MTkzNTYyN30.7Ntz1uOJNXd1L9qXQ89aGxXIiQU6qf4uOXN-E2bxO3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateTestNotification() {
  console.log('🧪 Testing Create Test Notification...');
  
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'system',
        title: '[DEBUG] Test Notification',
        message: `Test notification dibuat pada ${new Date().toLocaleString('id-ID')}`,
        is_read: false,
        metadata: {
          priority: 'normal',
          category: 'debug',
          test: true
        }
      })
      .select();

    if (error) throw error;
    
    console.log('✅ Test notification berhasil dibuat:', data[0]);
  } catch (error) {
    console.error('❌ Gagal membuat test notification:', error.message);
  }
}

async function testCreateTestProduct() {
  console.log('🛍️ Testing Create Test Product...');
  
  try {
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product created by debug tools',
      price: 10000,
      category: 'testing',
      stock: 999,
      game_slug: 'mobile-legends',
      is_popular: false,
      status: 'active',
      metadata: {
        test: true,
        created_by: 'debug-tools'
      }
    };

    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select();

    if (error) throw error;
    
    console.log('✅ Test product berhasil dibuat:', data[0]);
  } catch (error) {
    console.error('❌ Gagal membuat test product:', error.message);
  }
}

async function testFilterNotifications() {
  console.log('🔍 Testing Filter Notifications...');
  
  try {
    // Get all notifications
    const { data: allNotifications, error: allError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allError) throw allError;
    
    console.log('📋 Total notifications:', allNotifications.length);
    
    // Filter out test notifications (should be excluded from UI)
    const nonTestNotifications = allNotifications.filter(n => 
      !n.is_read && (!n.metadata?.test || n.metadata?.test !== true)
    );
    
    console.log('📋 Non-test unread notifications:', nonTestNotifications.length);
    console.log('📋 Test notifications (should be filtered out):', 
      allNotifications.filter(n => n.metadata?.test === true).length);
      
  } catch (error) {
    console.error('❌ Gagal filter notifications:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Debug Tools Test...\n');
  
  await testCreateTestNotification();
  console.log('');
  
  await testCreateTestProduct();
  console.log('');
  
  await testFilterNotifications();
  console.log('');
  
  console.log('✨ Debug Tools Test Complete!');
}

runTests().catch(console.error);
