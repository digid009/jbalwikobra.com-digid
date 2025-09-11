const { ordersService } = require('./src/services/ordersService');
require('dotenv').config();

async function testOrdersService() {
  console.log('🧪 Testing Orders Service...\n');
  
  try {
    // Test getOrders
    console.log('📋 Testing getOrders...');
    const ordersResult = await ordersService.getOrders({
      page: 1,
      limit: 5
    });
    
    console.log(`✅ Found ${ordersResult.orders.length} orders out of ${ordersResult.totalCount} total`);
    console.log(`📄 Total pages: ${ordersResult.totalPages}`);
    
    if (ordersResult.orders.length > 0) {
      console.log('\n📊 Sample orders:');
      ordersResult.orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.customer_name} - $${order.amount/1000}k (${order.status})`);
      });
    }
    
    // Test getOrderStats
    console.log('\n💰 Testing getOrderStats...');
    const stats = await ordersService.getOrderStats();
    console.log(`✅ Stats loaded:`);
    console.log(`   - Total Orders: ${stats.totalOrders}`);
    console.log(`   - Total Revenue: $${stats.totalRevenue/1000}k`);
    console.log(`   - Pending: ${stats.pendingOrders}`);
    console.log(`   - Completed: ${stats.completedOrders}`);
    
  } catch (error) {
    console.error('❌ Error testing orders service:', error.message);
  }
}

testOrdersService();
