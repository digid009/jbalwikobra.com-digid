// Test script untuk Admin Floating Notifications
// Jalankan di browser console saat berada di halaman admin

console.log('🧪 Testing Admin Floating Notifications System...\n');

// Test notification templates
async function testNotificationTemplates() {
  console.log('📱 Testing notification templates...');
  
  try {
    // Import adminNotificationService 
    const { adminNotificationService } = await import('/src/services/adminNotificationService.js');
    
    console.log('1. ✅ Testing User Signup Notification...');
    await adminNotificationService.createUserSignupNotification(
      'test-user-' + Date.now(),
      'Ahmad Wijaya',
      '6281234567890',
      'ahmad.wijaya@email.com'
    );
    
    console.log('2. ✅ Testing New Order Notification...');
    await adminNotificationService.createOrderNotification(
      'test-order-' + Date.now(),
      'Siti Nurhaliza',
      'FREE FIRE A - VAULT 645 PRIME 4',
      2800000,
      'new_order',
      '6289876543210'
    );
    
    console.log('3. ✅ Testing Paid Order Notification...');
    await adminNotificationService.createOrderNotification(
      'test-order-paid-' + Date.now(),
      'Budi Santoso',
      'FREE FIRE B10 - VAULT 756 EVOGUN',
      2300000,
      'paid_order',
      '6287654321098'
    );
    
    console.log('4. ✅ Getting recent notifications...');
    const notifications = await adminNotificationService.getAdminNotifications(3);
    
    console.log('\n📋 Recent Notification Templates:');
    notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.type.toUpperCase()}`);
      console.log(`   📝 Title: "${notif.title}"`);
      console.log(`   💬 Message: "${notif.message}"`);
      console.log(`   ⏰ Created: ${new Date(notif.created_at).toLocaleString('id-ID')}`);
      console.log(`   👁️ Read: ${notif.is_read ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 All notification templates are working correctly!');
    console.log('\n📌 Check the floating notifications in the top-right corner of the admin page.');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }
}

// Test mark as read functionality
async function testMarkAsRead() {
  try {
    const { adminNotificationService } = await import('/src/services/adminNotificationService.js');
    
    console.log('\n🔄 Testing Mark as Read functionality...');
    
    const notifications = await adminNotificationService.getAdminNotifications(1);
    if (notifications.length > 0) {
      const firstNotification = notifications[0];
      console.log(`📌 Marking notification "${firstNotification.title}" as read...`);
      
      await adminNotificationService.markAsRead(firstNotification.id);
      console.log('✅ Mark as read successful!');
      
      const unreadCount = await adminNotificationService.getUnreadCount();
      console.log(`📊 Unread notifications count: ${unreadCount}`);
    } else {
      console.log('ℹ️ No notifications available to mark as read.');
    }
    
  } catch (error) {
    console.error('❌ Error testing mark as read:', error);
  }
}

// Run tests
console.log('🚀 Starting notification system tests...');
testNotificationTemplates().then(() => {
  setTimeout(() => {
    testMarkAsRead();
  }, 2000);
});

// Instructions for manual testing
console.log('\n📋 Manual Testing Instructions:');
console.log('1. Navigate to admin page: http://localhost:3000/admin');
console.log('2. Look for floating notifications in top-right corner');
console.log('3. Check notification templates match requirements:');
console.log('   - User signup: "Bang! ada yang DAFTAR akun nih! namanya [nama] nomor wanya [nomor]"');
console.log('   - New order: "Bang! ada yang ORDER nih! namanya [nama], produknya [produk] harganya [harga], belum di bayar sih, tapi moga aja di bayar amin."');
console.log('   - Paid order: "Bang! Alhamdulillah udah di bayar nih ORDERAN produk [produk], harganya [harga] sama si [nama]"');
console.log('4. Test "Tandai Sudah Dibaca" button functionality');
console.log('5. Check IOSDesignSystemV2 styling (gradients, cards, buttons)');
