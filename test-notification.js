const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTestNotification() {
  try {
    console.log('Creating test notification...');
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'new_order',
        title: 'Bang! ada yang ORDER nih!',
        message: 'namanya Real Customer, produknya Real Product harganya Rp 150,000, belum di bayar sih, tapi moga aja di bayar amin.',
        order_id: null, // Set to null since we don't have a real order
        customer_name: 'Real Customer',
        product_name: 'Real Product',
        amount: 150000,
        is_read: false,
        metadata: {
          priority: 'normal',
          category: 'order'
          // Removed test: true to allow it to show in floating notifications
        }
      })
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      return;
    }

    console.log('✅ Test notification created successfully:', data);
    
    // Fetch recent notifications to verify
    const { data: notifications, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return;
    }

    console.log('\n📋 Recent notifications:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - Read: ${notif.is_read} - Created: ${notif.created_at}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestNotification();
