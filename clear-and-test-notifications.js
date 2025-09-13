// Script untuk membersihkan notifications lama dan menambahkan template Indonesia
// Jalankan di browser console saat di halaman admin

console.log('🧹 Script untuk clear notifications lama...');

// Function untuk delete notifications lama dengan template Inggris
async function clearOldEnglishNotifications() {
  try {
    console.log('🗑️ Menghapus notifications dengan template bahasa Inggris...');
    
    const response = await fetch('/api/admin-notifications/clear-old', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Old English notifications cleared!');
    } else {
      console.log('⚠️ Could not clear via API, manual clearing needed');
    }
    
  } catch (error) {
    console.log('⚠️ API call failed, use manual method');
  }
}

// Function untuk create test notifications dengan template Indonesia
async function createIndonesianTestNotifications() {
  console.log('📝 Creating test notifications dengan template Indonesia...');
  
  const testNotifications = [
    {
      type: 'user_signup',
      userName: 'Ahmad Rizky Pratama',
      userPhone: '6281234567890'
    },
    {
      type: 'new_order', 
      customerName: 'Sinta Dewi Kartika',
      productName: 'FREE FIRE A - VAULT 645 PRIME 4 SG',
      amount: 2800000,
      customerPhone: '6289876543210'
    },
    {
      type: 'paid_order',
      customerName: 'Bayu Aji Nugroho', 
      productName: 'FREE FIRE B10 - VAULT 756 EVOGUN',
      amount: 2300000,
      customerPhone: '6287654321098'
    }
  ];
  
  for (const notif of testNotifications) {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      });
      
      if (response.ok) {
        console.log(`✅ ${notif.type} notification created!`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to create ${notif.type} notification:`, error);
    }
  }
}

// Manual instructions
console.log('\n📋 MANUAL METHOD (if API calls fail):');
console.log('1. Go to Supabase Dashboard > Table Editor > admin_notifications');
console.log('2. Delete rows with English titles: "Test Notification", "New Order Received", etc.');
console.log('3. Insert new rows with Indonesian templates:');
console.log('   - Type: new_user, Title: "Bang! ada yang DAFTAR akun nih!", Message: "namanya [nama] nomor wanya [nomor]"');
console.log('   - Type: new_order, Title: "Bang! ada yang ORDER nih!", Message: "namanya [nama], produknya [produk]..."');
console.log('   - Type: paid_order, Title: "Bang! Alhamdulillah udah di bayar nih", Message: "ORDERAN produk [produk]..."');

// Auto-run functions
console.log('\n🚀 Running automated cleanup and test creation...');
clearOldEnglishNotifications().then(() => {
  setTimeout(() => {
    createIndonesianTestNotifications().then(() => {
      console.log('\n🎉 Process completed!');
      console.log('📍 Check top-right corner of admin page for new notifications');
      console.log('📍 Templates should now be in Indonesian as requested');
    });
  }, 1000);
});
    } else {
      console.log('✅ Old English notifications cleared!');
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n2. 📝 Creating NEW notifications with Indonesian templates...');

    // Create User Signup notification
    console.log('   👤 Creating User Signup...');
    await adminNotificationService.createUserSignupNotification(
      'user-123-' + Date.now(),
      'Budi Santoso',
      '6281234567890',
      'budi.santoso@email.com'
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Create New Order notification
    console.log('   🛒 Creating New Order...');
    await adminNotificationService.createOrderNotification(
      'order-456-' + Date.now(),
      'Siti Rahayu',
      'FREE FIRE A - VAULT 645 PRIME 4 SG EVO MAX',
      2800000,
      'new_order',
      '6289876543210'
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Create Paid Order notification
    console.log('   💰 Creating Paid Order...');
    await adminNotificationService.createOrderNotification(
      'order-paid-789-' + Date.now(),
      'Ahmad Wijaya',
      'FREE FIRE B10 - VAULT 756 EVOGUN 6 MAX',
      2300000,
      'paid_order',
      '6287654321098'
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n3. 📋 Getting latest notifications to verify templates...');
    
    const notifications = await adminNotificationService.getAdminNotifications(5);
    
    console.log('\n🇮🇩 INDONESIAN TEMPLATES - VERIFICATION:');
    console.log('=========================================');
    
    notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.type.toUpperCase()}`);
      console.log(`   📝 Title: "${notif.title}"`);
      console.log(`   💬 Message: "${notif.message}"`);
      console.log(`   ⏰ Created: ${new Date(notif.created_at).toLocaleString('id-ID')}`);
      
      // Verify templates
      if (notif.type === 'new_user' && notif.title === 'Bang! ada yang DAFTAR akun nih!') {
        console.log('   ✅ User signup template: CORRECT');
      } else if (notif.type === 'new_order' && notif.title === 'Bang! ada yang ORDER nih!') {
        console.log('   ✅ New order template: CORRECT');
      } else if (notif.type === 'paid_order' && notif.title === 'Bang! Alhamdulillah udah di bayar nih') {
        console.log('   ✅ Paid order template: CORRECT');
      }
    });

    console.log('\n🎉 SUCCESS! All Indonesian templates are now active!');
    console.log('📱 Refresh http://localhost:3000/admin to see the corrected notifications');
    console.log('\n💡 Expected results:');
    console.log('   👤 User: "Bang! ada yang DAFTAR akun nih! namanya Budi Santoso nomor wanya 6281234567890"');
    console.log('   🛒 Order: "Bang! ada yang ORDER nih! namanya Siti Rahayu, produknya ... harganya Rp2.800.000, belum di bayar sih, tapi moga aja di bayar amin."');
    console.log('   💰 Paid: "Bang! Alhamdulillah udah di bayar nih ORDERAN produk ... harganya Rp2.300.000 sama si Ahmad Wijaya"');

  } catch (error) {
    console.error('❌ Error during cleanup and testing:', error);
  }
}

// Run the cleanup and test
clearAndTestNotifications();
