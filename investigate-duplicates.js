// Investigate duplicate orders
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xeithuvgldzxnggxadri.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8'
);

async function investigateDuplicates() {
  try {
    console.log('🔍 Investigating duplicate orders...\n');
    
    // Look for recent orders with similar external IDs
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📊 Recent orders analysis:');
    
    // Group by potential duplicates (same timestamp in external_id)
    const groupedByTimestamp = {};
    
    recentOrders.forEach(order => {
      if (order.client_external_id) {
        // Extract timestamp from external_id like "order_1758088853374_..."
        const match = order.client_external_id.match(/order_(\d+)_/);
        if (match) {
          const timestamp = match[1];
          if (!groupedByTimestamp[timestamp]) {
            groupedByTimestamp[timestamp] = [];
          }
          groupedByTimestamp[timestamp].push(order);
        }
      }
    });
    
    console.log('\n🔍 Potential duplicates found:');
    let duplicatesFound = false;
    
    Object.keys(groupedByTimestamp).forEach(timestamp => {
      const orders = groupedByTimestamp[timestamp];
      if (orders.length > 1) {
        duplicatesFound = true;
        console.log(`\n⚠️  Timestamp ${timestamp} has ${orders.length} orders:`);
        orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ID: ${order.id}`);
          console.log(`      External ID: ${order.client_external_id}`);
          console.log(`      Customer: ${order.customer_name}`);
          console.log(`      Email: ${order.customer_email}`);
          console.log(`      Amount: Rp ${order.amount?.toLocaleString()}`);
          console.log(`      Created: ${order.created_at}`);
          console.log(`      Order Type: ${order.order_type}`);
        });
      }
    });
    
    if (!duplicatesFound) {
      console.log('✅ No timestamp-based duplicates found');
    }
    
    // Look for exact customer duplicates
    console.log('\n🔍 Checking for exact customer duplicates...');
    const customerGroups = {};
    
    recentOrders.forEach(order => {
      const key = `${order.customer_name}_${order.customer_email}_${order.amount}`;
      if (!customerGroups[key]) {
        customerGroups[key] = [];
      }
      customerGroups[key].push(order);
    });
    
    let customerDuplicatesFound = false;
    Object.keys(customerGroups).forEach(key => {
      const orders = customerGroups[key];
      if (orders.length > 1) {
        customerDuplicatesFound = true;
        console.log(`\n⚠️  Customer duplicate found (${orders.length} orders):`);
        console.log(`   Customer: ${orders[0].customer_name}`);
        console.log(`   Email: ${orders[0].customer_email}`);
        console.log(`   Amount: Rp ${orders[0].amount?.toLocaleString()}`);
        orders.forEach((order, index) => {
          console.log(`   Order ${index + 1}: ${order.id} (${order.created_at})`);
        });
      }
    });
    
    if (!customerDuplicatesFound) {
      console.log('✅ No exact customer duplicates found');
    }
    
    // Check for recent test orders
    console.log('\n🔍 Recent test orders:');
    const testOrders = recentOrders.filter(order => 
      order.customer_name?.toLowerCase().includes('test') ||
      order.customer_email?.toLowerCase().includes('test')
    );
    
    console.log(`📋 Found ${testOrders.length} test orders:`);
    testOrders.slice(0, 5).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.customer_name} (${order.customer_email})`);
      console.log(`      Amount: Rp ${order.amount?.toLocaleString()}`);
      console.log(`      Created: ${order.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

investigateDuplicates();
