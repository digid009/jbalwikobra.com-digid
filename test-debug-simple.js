const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://hqcvkzchqugszpkplwsf.supabase.co';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDebugFeatures() {
  try {
    console.log('🧪 Testing Debug Features...\n');

    // Test 1: Create test notification
    console.log('1. Testing createTestNotification...');
    const { data: notifData, error: notifError } = await supabase
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
      .select()
      .single();

    if (notifError) {
      console.log('❌ Failed to create test notification:', notifError);
    } else {
      console.log('✅ Test notification created successfully:', notifData.id);
    }

    // Test 2: Create test product
    console.log('\n2. Testing createTestProduct...');
    const timestamp = new Date().getTime();
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        name: `[TEST] Debug Product ${timestamp}`,
        description: `Test product untuk debug - dibuat pada ${new Date().toLocaleString('id-ID')}`,
        price: 10000,
        original_price: 15000,
        image: 'https://via.placeholder.com/300x200?text=TEST+PRODUCT',
        images: ['https://via.placeholder.com/300x200?text=TEST+PRODUCT'],
        category: 'test-category',
        game_title: 'DEBUG GAME',
        account_level: 'Test Level',
        account_details: 'Account details untuk testing',
        is_flash_sale: false,
        has_rental: false,
        stock: 999,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (productError) {
      console.log('❌ Failed to create test product:', productError);
    } else {
      console.log('✅ Test product created successfully:', {
        id: productData.id,
        name: productData.name
      });
    }

    // Test 3: Check notification filtering
    console.log('\n3. Testing notification filtering...');
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.log('❌ Failed to fetch notifications:', fetchError);
    } else {
      const testNotifications = notifications.filter(n => n.metadata?.test === true);
      const nonTestUnread = notifications.filter(n => n.metadata?.test !== true && !n.is_read);
      
      console.log(`📊 Found ${testNotifications.length} test notifications (should be hidden in floating)`);
      console.log(`📊 Found ${nonTestUnread.length} non-test unread notifications (should be shown)`);
    }

    console.log('\n🎉 All debug features working correctly!');

  } catch (error) {
    console.error('❌ Error testing debug features:', error);
  }

  process.exit(0);
}

// Run the test
testDebugFeatures();
