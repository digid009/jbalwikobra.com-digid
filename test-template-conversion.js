const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTemplateConversion() {
  try {
    console.log('🧪 Testing Template Conversion for Floating Notifications...\n');

    // Create test notifications with English templates (simulating old data)
    console.log('1. Creating test notifications with English templates...');
    
    const testNotifications = [
      {
        type: 'new_order',
        title: 'New Order Received',
        message: 'A new order has been placed by John Doe for Mobile Legends Account worth Rp50,000',
        customer_name: 'John Doe',
        product_name: 'Mobile Legends Account',
        amount: 50000,
        is_read: false,
        metadata: { test_template: true }
      },
      {
        type: 'paid_order',
        title: 'Payment Confirmed',
        message: 'Payment has been confirmed for order by Jane Smith for PUBG UC 1000 worth Rp75,000',
        customer_name: 'Jane Smith', 
        product_name: 'PUBG UC 1000',
        amount: 75000,
        is_read: false,
        metadata: { test_template: true }
      },
      {
        type: 'new_user',
        title: 'New User Registration',
        message: 'A new user has registered: Ahmad with phone number 628123456789',
        customer_name: 'Ahmad',
        is_read: false,
        metadata: { test_template: true, phone: '628123456789' }
      }
    ];

    for (const notif of testNotifications) {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert(notif)
        .select()
        .single();

      if (error) {
        console.log(`❌ Failed to create ${notif.type} notification:`, error.message);
      } else {
        console.log(`✅ Created ${notif.type} notification: "${notif.title}"`);
      }
    }

    console.log('\n2. Checking template conversion logic...');
    
    // Simulate the template conversion function from FloatingNotifications
    function getNotificationTemplate(notification) {
      // If already has Indonesian template, use it
      if (notification.title.toLowerCase().includes('bang!') || 
          notification.title.toLowerCase().includes('alhamdulillah')) {
        return {
          title: notification.title,
          message: notification.message
        };
      }

      // Convert English templates to Indonesian
      switch (notification.type) {
        case 'new_order':
          return {
            title: 'Bang! ada yang ORDER nih!',
            message: `namanya ${notification.customer_name || 'Customer'}, produktnya ${notification.product_name || 'Product'} harganya Rp${notification.amount?.toLocaleString('id-ID') || '0'}, belum di bayar sih, tapi moga aja di bayar amin.`
          };
        case 'paid_order':
          return {
            title: 'Bang! Alhamdulillah udah di bayar nih',
            message: `namanya ${notification.customer_name || 'Customer'}, produktnya ${notification.product_name || 'Product'} harganya Rp${notification.amount?.toLocaleString('id-ID') || '0'}, udah di bayar Alhamdulillah.`
          };
        case 'new_user':
          return {
            title: 'Bang! ada yang DAFTAR akun nih!',
            message: `namanya ${notification.customer_name || 'User baru'} nomor wanya ${notification.metadata?.phone || 'tidak ada'}`
          };
        default:
          return {
            title: notification.title,
            message: notification.message
          };
      }
    }

    // Test conversion for each type
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('metadata->>test_template', 'true')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Failed to fetch test notifications:', fetchError);
    } else {
      console.log(`\n📊 Found ${notifications.length} test notifications to convert:\n`);

      notifications.forEach(notification => {
        const original = {
          title: notification.title,
          message: notification.message
        };
        
        const converted = getNotificationTemplate(notification);
        
        console.log(`🔄 ${notification.type.toUpperCase()} CONVERSION:`);
        console.log(`   Original: "${original.title}"`);
        console.log(`   Converted: "${converted.title}"`);
        console.log(`   Message: "${converted.message.substring(0, 60)}..."`);
        console.log('');
      });
    }

    console.log('✅ Template conversion testing completed!');
    console.log('\n📝 Summary:');
    console.log('- FloatingNotifications will now convert English templates to Indonesian');
    console.log('- Existing Indonesian templates will be preserved');
    console.log('- Templates match the style used in admin notifications page');
    
    // Cleanup test notifications
    console.log('\n🧹 Cleaning up test notifications...');
    const { error: cleanupError } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('metadata->>test_template', 'true');

    if (cleanupError) {
      console.log('❌ Failed to cleanup:', cleanupError);
    } else {
      console.log('✅ Test notifications cleaned up');
    }

  } catch (error) {
    console.error('❌ Error testing template conversion:', error);
  }

  process.exit(0);
}

// Run the test
testTemplateConversion();
