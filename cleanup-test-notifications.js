const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTestNotifications() {
  try {
    console.log('🧹 Cleaning up test notifications...\n');

    // Delete all test notifications
    const { data, error } = await supabase
      .from('admin_notifications')
      .delete()
      .or('metadata->>test.eq.true,title.ilike.*[debug]*,title.ilike.*test*,message.ilike.*[debug mode]*');

    if (error) {
      console.log('❌ Failed to cleanup test notifications:', error);
    } else {
      console.log('✅ Successfully cleaned up test notifications');
      console.log(`📊 Deleted ${data?.length || 0} test notifications`);
    }

    // Show remaining notifications count
    const { count, error: countError } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Remaining notifications in database: ${count || 0}`);
    }

    console.log('\n🎉 Cleanup completed!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }

  process.exit(0);
}

// Run the cleanup
cleanupTestNotifications();
