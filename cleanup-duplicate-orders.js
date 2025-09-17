// Clean up duplicate orders and implement prevention
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xeithuvgldzxnggxadri.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8'
);

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting duplicate order cleanup...\n');
    
    // Get all orders
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true }); // Keep older ones
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    console.log(`📊 Total orders found: ${allOrders.length}`);
    
    // Group by customer + email + amount to find duplicates
    const groupedOrders = {};
    
    allOrders.forEach(order => {
      const key = `${order.customer_name}_${order.customer_email}_${order.amount}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = [];
      }
      groupedOrders[key].push(order);
    });
    
    // Find duplicates
    const duplicateGroups = Object.keys(groupedOrders).filter(key => 
      groupedOrders[key].length > 1
    );
    
    console.log(`🔍 Found ${duplicateGroups.length} duplicate groups:`);
    
    let totalToDelete = 0;
    const ordersToDelete = [];
    
    for (const key of duplicateGroups) {
      const orders = groupedOrders[key];
      console.log(`\n📋 Group: ${key.replace(/_/g, ' | ')}`);
      console.log(`   Orders: ${orders.length}`);
      
      // Keep the first (oldest) order, mark others for deletion
      orders.slice(1).forEach((order, index) => {
        console.log(`   🗑️  Will delete: ${order.id} (created: ${order.created_at})`);
        ordersToDelete.push(order.id);
        totalToDelete++;
      });
      
      console.log(`   ✅ Will keep: ${orders[0].id} (created: ${orders[0].created_at})`);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total duplicate orders to delete: ${totalToDelete}`);
    console.log(`   Keeping: ${allOrders.length - totalToDelete} orders`);
    
    if (totalToDelete > 0) {
      console.log('\n⚠️  CLEANUP PLAN:');
      console.log('   This will delete the following duplicate orders:');
      ordersToDelete.forEach((id, index) => {
        console.log(`   ${index + 1}. ${id}`);
      });
      
      console.log('\n❓ Do you want to proceed with cleanup?');
      console.log('   Run this script with --confirm flag to execute deletion');
      
      // Check if confirm flag is passed
      const shouldProceed = process.argv.includes('--confirm');
      
      if (shouldProceed) {
        console.log('\n🚀 Proceeding with cleanup...');
        
        // Delete duplicates in batches
        const batchSize = 10;
        for (let i = 0; i < ordersToDelete.length; i += batchSize) {
          const batch = ordersToDelete.slice(i, i + batchSize);
          console.log(`   Deleting batch ${Math.floor(i/batchSize) + 1}...`);
          
          const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .in('id', batch);
          
          if (deleteError) {
            console.error(`   ❌ Error deleting batch:`, deleteError);
          } else {
            console.log(`   ✅ Deleted ${batch.length} orders`);
          }
        }
        
        console.log('\n🎉 Cleanup complete!');
        
        // Verify cleanup
        const { count: finalCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        console.log(`📊 Final order count: ${finalCount}`);
        
      } else {
        console.log('\n⏸️  Cleanup not executed. Add --confirm flag to proceed.');
      }
    } else {
      console.log('\n✅ No duplicates found to clean up!');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Duplicate prevention recommendations
function showPreventionMeasures() {
  console.log('\n🛡️  DUPLICATE PREVENTION MEASURES:');
  console.log('\n1. Frontend Prevention:');
  console.log('   - Disable submit button after click');
  console.log('   - Show loading state during submission');
  console.log('   - Use debouncing for form submissions');
  console.log('   - Implement client-side request deduplication');
  
  console.log('\n2. Backend Prevention:');
  console.log('   - Add unique constraints on client_external_id');
  console.log('   - Implement idempotency keys');
  console.log('   - Use database transactions');
  console.log('   - Add rate limiting');
  
  console.log('\n3. Database Prevention:');
  console.log('   - Create unique index on (customer_email, amount, created_at)');
  console.log('   - Add check constraints');
  console.log('   - Use row-level security');
  
  console.log('\n4. Monitoring:');
  console.log('   - Alert on duplicate detection');
  console.log('   - Log submission patterns');
  console.log('   - Track submission timing');
}

// Run cleanup
cleanupDuplicates().then(() => {
  showPreventionMeasures();
});
