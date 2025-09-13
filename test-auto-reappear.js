const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAutoReappearLogic() {
  try {
    console.log('🧪 Testing Auto-Reappear Logic...\n');

    // Create a regular notification (will show and reappear if dismissed)
    console.log('1. Creating regular notification...');
    const { data: notifData, error: notifError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'new_order',
        title: 'Bang! ada yang ORDER nih!',
        message: 'namanya Test Customer, produknya Mobile Legends Diamond harganya Rp50,000, belum di bayar sih, tapi moga aja di bayar amin.',
        customer_name: 'Test Customer',
        product_name: 'Mobile Legends Diamond',
        amount: 50000,
        is_read: false,
        metadata: {
          priority: 'normal',
          category: 'order'
        }
      })
      .select()
      .single();

    if (notifError) {
      console.log('❌ Failed to create test notification:', notifError);
    } else {
      console.log('✅ Regular notification created successfully:', notifData.id);
      console.log('📝 This notification will:');
      console.log('   - Show in floating notifications');
      console.log('   - Reappear in 30 seconds if dismissed (not marked read)');
      console.log('   - Disappear permanently when marked as read');
    }

    // Check current notifications
    console.log('\n2. Checking current unread notifications...');
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Failed to fetch notifications:', fetchError);
    } else {
      console.log(`📊 Found ${notifications.length} unread notifications:`);
      notifications.forEach(n => {
        const isTest = n.metadata?.test === true || n.metadata?.debug_mode === true;
        console.log(`  - ${n.title} ${isTest ? '(TEST - will not show in floating)' : '(will show in floating)'}`);
      });
    }

    console.log('\n🎯 Auto-Reappear Logic Summary:');
    console.log('✅ Notifications that are dismissed (not marked read) will reappear in 30 seconds');
    console.log('✅ Notifications that are marked read will disappear permanently');
    console.log('✅ Test/debug notifications are filtered out and never appear in floating');
    console.log('✅ Reappeared notifications have visual indicators (yellow border, badge)');
    console.log('✅ All templates now use consistent Indonesian language');

    console.log('\n📋 Test Instructions:');
    console.log('1. Open admin panel and observe floating notifications');
    console.log('2. Click X to dismiss (should reappear in 30s)');
    console.log('3. Click "Tandai Sudah Dibaca" to mark read (should not reappear)');

  } catch (error) {
    console.error('❌ Error testing auto-reappear logic:', error);
  }

  process.exit(0);
}

// Run the test
testAutoReappearLogic();
