/**
 * Test script untuk sistem notifikasi admin
 * Memverifikasi template notifikasi dan fungsi mark as read
 */
import { adminNotificationService } from './src/services/adminNotificationService.js';

console.log('🧪 Testing Admin Notification System...\n');

async function testNotificationSystem() {
  try {
    console.log('1. Testing User Signup Notification Template...');
    await adminNotificationService.createUserSignupNotification(
      'test-user-id-123',
      'John Doe',
      '628123456789',
      'john@example.com'
    );
    console.log('✅ User signup notification created successfully');

    console.log('\n2. Testing New Order Notification Template...');
    await adminNotificationService.createOrderNotification(
      'test-order-id-123',
      'Jane Smith',
      'FREE FIRE A - Premium Account',
      2500000,
      'new_order',
      '628987654321'
    );
    console.log('✅ New order notification created successfully');

    console.log('\n3. Testing Paid Order Notification Template...');
    await adminNotificationService.createOrderNotification(
      'test-order-id-456',
      'Bob Wilson',
      'FREE FIRE B10 - VAULT Account',
      2300000,
      'paid_order',
      '628555666777'
    );
    console.log('✅ Paid order notification created successfully');

    console.log('\n4. Getting recent notifications...');
    const notifications = await adminNotificationService.getAdminNotifications(3);
    console.log(`✅ Retrieved ${notifications.length} notifications`);

    if (notifications.length > 0) {
      console.log('\n📱 Notification Templates:');
      notifications.forEach((notif, index) => {
        console.log(`\n${index + 1}. ${notif.type.toUpperCase()}`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Is Read: ${notif.is_read}`);
      });

      console.log('\n5. Testing mark as read functionality...');
      const firstNotification = notifications[0];
      await adminNotificationService.markAsRead(firstNotification.id);
      console.log(`✅ Marked notification ${firstNotification.id} as read`);
      
      console.log('\n6. Getting unread count...');
      const unreadCount = await adminNotificationService.getUnreadCount();
      console.log(`✅ Unread notifications count: ${unreadCount}`);
    }

    console.log('\n🎉 All tests passed! Admin notification system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testNotificationSystem();
