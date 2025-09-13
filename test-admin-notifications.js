// Test script untuk admin notifications dengan format pesan baru
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestNotifications() {
  console.log('🔧 Creating test admin notifications...\n');

  try {
    // Test notification untuk new user signup
    const userSignupNotif = {
      type: 'new_user',
      title: 'Bang! ada yang DAFTAR akun nih!',
      message: 'namanya John Doe nomor wanya 628123456789',
      user_id: 'd13a4bc3-412e-4343-9f6d-405c1a7162bd', // Admin user ID sebagai contoh
      customer_name: 'John Doe',
      is_read: false,
      metadata: {
        phone: '628123456789',
        priority: 'normal',
        category: 'user'
      }
    };

    // Test notification untuk new order
    const newOrderNotif = {
      type: 'new_order',
      title: 'Bang! ada yang ORDER nih!',
      message: 'namanya Sarah Kim, produknya FREE FIRE ACCOUNT A harganya Rp 2.800.000, belum di bayar sih, tapi moga aja di bayar amin.',
      order_id: '12345678-1234-1234-1234-123456789012',
      customer_name: 'Sarah Kim',
      product_name: 'FREE FIRE ACCOUNT A',
      amount: 2800000,
      is_read: false,
      metadata: {
        priority: 'normal',
        category: 'order'
      }
    };

    // Test notification untuk paid order
    const paidOrderNotif = {
      type: 'paid_order',
      title: 'Bang! Alhamdulillah udah di bayar nih',
      message: 'ORDERAN produk FREE FIRE ACCOUNT B, harganya Rp 3.200.000 sama si Ahmad Rizki',
      order_id: '87654321-4321-4321-4321-210987654321',
      customer_name: 'Ahmad Rizki',
      product_name: 'FREE FIRE ACCOUNT B',
      amount: 3200000,
      is_read: false,
      metadata: {
        priority: 'high',
        category: 'order'
      }
    };

    // Insert notifications
    const { data: insertedNotifications, error } = await supabase
      .from('admin_notifications')
      .insert([userSignupNotif, newOrderNotif, paidOrderNotif])
      .select();

    if (error) {
      console.error('❌ Error creating test notifications:', error);
      return;
    }

    console.log('✅ Test notifications created successfully!');
    console.log(`📊 Created ${insertedNotifications.length} notifications:\n`);

    insertedNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.type.toUpperCase()}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   ID: ${notif.id}\n`);
    });

    // Fetch and display current notifications
    const { data: allNotifications } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`📋 Current admin notifications (latest 10):`);
    allNotifications?.forEach((notif, index) => {
      const timeAgo = new Date(Date.now() - new Date(notif.created_at).getTime()).toISOString().substr(11, 8);
      console.log(`${index + 1}. [${notif.type}] ${notif.title} (${timeAgo} ago)`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function cleanupTestNotifications() {
  console.log('🧹 Cleaning up old test notifications...\n');
  
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .delete()
      .or('customer_name.eq.John Doe,customer_name.eq.Sarah Kim,customer_name.eq.Ahmad Rizki')
      .select();

    if (error) {
      console.error('❌ Error cleaning up:', error);
      return;
    }

    console.log(`✅ Cleaned up ${data?.length || 0} test notifications`);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Main execution
async function main() {
  const action = process.argv[2];
  
  if (action === 'cleanup') {
    await cleanupTestNotifications();
  } else {
    await createTestNotifications();
  }
}

main().catch(console.error);
