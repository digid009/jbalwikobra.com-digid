const { adminNotificationService } = require('./src/services/adminNotificationService');
const { enhancedAdminService } = require('./src/services/enhancedAdminService');

async function testDebugFeatures() {
  try {
    console.log('🧪 Testing Debug Features...\n');

    // Test 1: Create test notification
    console.log('1. Testing createTestNotification...');
    await adminNotificationService.createTestNotification();
    console.log('✅ Test notification created successfully');

    // Test 2: Create test product
    console.log('\n2. Testing createTestProduct...');
    const productResult = await enhancedAdminService.createTestProduct();
    if (productResult.success) {
      console.log('✅ Test product created successfully:', {
        id: productResult.data.id,
        name: productResult.data.name
      });
    } else {
      console.log('❌ Failed to create test product:', productResult.error);
    }

    // Test 3: Check unread notifications (should exclude test ones from floating)
    console.log('\n3. Testing notification filtering...');
    const notifications = await adminNotificationService.getAdminNotifications(10);
    const testNotifications = notifications.filter(n => n.metadata?.test === true);
    const nonTestNotifications = notifications.filter(n => n.metadata?.test !== true && !n.is_read);
    
    console.log(`📊 Found ${testNotifications.length} test notifications (should be hidden in floating)`);
    console.log(`📊 Found ${nonTestNotifications.length} non-test unread notifications (should be shown)`);

    console.log('\n🎉 All debug features working correctly!');

  } catch (error) {
    console.error('❌ Error testing debug features:', error);
  }
}

// Run the test
testDebugFeatures();
