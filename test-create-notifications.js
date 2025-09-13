// Test notifications menggunakan adminNotificationService
// Untuk test manual langsung dari browser console

console.log('🚀 Creating test notifications...');

// Function untuk membuat test notifications
async function createTestNotifications() {
  try {
    console.log('📝 Creating User Signup Notification...');
    
    // Simulate user signup notification
    const response1 = await fetch('/api/test-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_signup',
        userName: 'Ahmad Rizky Pratama',
        userPhone: '6281234567890'
      })
    });
    
    if (response1.ok) {
      console.log('✅ User signup notification created!');
    }
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🛒 Creating New Order Notification...');
    
    // Simulate new order notification  
    const response2 = await fetch('/api/test-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_order',
        customerName: 'Sinta Dewi Kartika',
        productName: 'FREE FIRE A - VAULT 645 PRIME 4 SG',
        amount: 2800000,
        customerPhone: '6289876543210'
      })
    });
    
    if (response2.ok) {
      console.log('✅ New order notification created!');
    }
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('💰 Creating Paid Order Notification...');
    
    // Simulate paid order notification
    const response3 = await fetch('/api/test-notification', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'paid_order',
        customerName: 'Bayu Aji Nugroho', 
        productName: 'FREE FIRE B10 - VAULT 756 EVOGUN',
        amount: 2300000,
        customerPhone: '6287654321098'
      })
    });
    
    if (response3.ok) {
      console.log('✅ Paid order notification created!');
    }
    
    console.log('\n🎉 All test notifications created!');
    console.log('👀 Check the top-right corner of the admin page for floating notifications!');
    console.log('\n📋 Expected Templates:');
    console.log('1. User signup: "Bang! ada yang DAFTAR akun nih! namanya Ahmad Rizky Pratama nomor wanya 6281234567890"');
    console.log('2. New order: "Bang! ada yang ORDER nih! namanya Sinta Dewi Kartika, produknya FREE FIRE A - VAULT 645 PRIME 4 SG harganya Rp2.800.000, belum di bayar sih, tapi moga aja di bayar amin."');
    console.log('3. Paid order: "Bang! Alhamdulillah udah di bayar nih ORDERAN produk FREE FIRE B10 - VAULT 756 EVOGUN, harganya Rp2.300.000 sama si Bayu Aji Nugroho"');
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
    console.log('\n🔧 Alternative: Manual test using Supabase console');
    console.log('   1. Go to Supabase dashboard');
    console.log('   2. Insert into admin_notifications table');
    console.log('   3. Check if floating notifications appear');
  }
}

// Create API endpoint test atau langsung via service
createTestNotifications();
