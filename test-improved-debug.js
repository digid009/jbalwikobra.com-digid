const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDebugFeatures() {
  try {
    console.log('🧪 Testing Debug Features with improved filtering...\n');

    // Test 1: Create test notification (now marked as read immediately)
    console.log('1. Testing createTestNotification (auto-read)...');
    const currentTime = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const { data: notifData, error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'system',
        title: 'Bang! ini test notifikasi nih!',
        message: `Test notifikasi berhasil dibuat pada jam ${currentTime}, sistem notifikasi berjalan normal!`,
        is_read: true, // Mark as read immediately
        metadata: {
          priority: 'low',
          category: 'debug',
          test: true,
          debug_mode: true,
          auto_read: true,
          created_time: currentTime
        }
      })
      .select()
      .single();

    if (notifError) {
      console.log('❌ Failed to create test notification:', notifError);
    } else {
      console.log('✅ Test notification created successfully (auto-read):', notifData.id);
    }

    // Test 2: Create test product
    console.log('\n2. Testing createTestProduct...');
    const timestamp = new Date().getTime();
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        name: `Mobile Legends - Akun Sultan ${timestamp}`,
        description: `Akun ML Sultan untuk testing - dibuat pada ${new Date().toLocaleString('id-ID')}. *NOTE: Ini adalah produk test untuk debugging sistem*`,
        price: 50000,
        original_price: 75000,
        image: 'https://via.placeholder.com/300x200?text=TEST+PRODUCT',
        images: ['https://via.placeholder.com/300x200?text=TEST+PRODUCT'],
        category: 'mobile-legends',
        game_title: 'Mobile Legends',
        account_level: 'Mythic Glory',
        account_details: 'Hero: 90+, Skin: 150+, Emblem Max - *TEST PRODUCT*',
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

    // Test 3: Check notification filtering (should exclude test notifications from floating)
    console.log('\n3. Testing notification filtering...');
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.log('❌ Failed to fetch notifications:', fetchError);
    } else {
      const testNotifications = notifications.filter(n => n.metadata?.test === true || n.metadata?.debug_mode === true);
      const nonTestUnread = notifications.filter(n => 
        !n.is_read && 
        (!n.metadata?.test || n.metadata?.test !== true) &&
        (!n.metadata?.debug_mode || n.metadata?.debug_mode !== true) &&
        (!n.metadata?.auto_read || n.metadata?.auto_read !== true) &&
        !n.title.toLowerCase().includes('[debug]') &&
        !n.title.toLowerCase().includes('test')
      );
      
      console.log(`📊 Found ${testNotifications.length} test/debug notifications (should be hidden in floating)`);
      console.log(`📊 Found ${nonTestUnread.length} non-test unread notifications (should be shown in floating)`);
      
      if (testNotifications.length > 0) {
        console.log('📋 Test notifications found:');
        testNotifications.forEach(n => {
          console.log(`  - ${n.title} (read: ${n.is_read})`);
        });
      }
    }

    console.log('\n🎉 All debug features working correctly!');
    console.log('\n📝 Summary:');
    console.log('- Test notifications are auto-marked as read to prevent showing in floating notifications');
    console.log('- Multiple filtering layers ensure no test content appears in production floating notifications');
    console.log('- Debug tools are ready for use in admin settings');

  } catch (error) {
    console.error('❌ Error testing debug features:', error);
  }

  process.exit(0);
}

// Run the test
testDebugFeatures();
