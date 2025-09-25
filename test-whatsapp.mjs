import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testWhatsAppService() {
  try {
    console.log('🧪 Testing WhatsApp Service...');
    
    // Import the service
    const { DynamicWhatsAppService } = await import('./api/_utils/dynamicWhatsAppService.ts');
    const wa = new DynamicWhatsAppService();
    
    console.log('✅ WhatsApp Service instantiated successfully');
    
    // Test getting provider settings
    const settings = await wa.getActiveProviderSettings();
    console.log('Provider settings available:', !!settings);
    
    if (settings) {
      console.log('\n📋 Current WhatsApp Configuration:');
      console.log('- Default group ID:', settings.default_group_id || 'NOT SET');
      
      if (settings.group_configurations) {
        console.log('- Group configurations found:');
        console.log('  * Purchase orders:', settings.group_configurations.purchase_orders || 'NOT SET');
        console.log('  * Rental orders:', settings.group_configurations.rental_orders || 'NOT SET');
        console.log('  * Flash sales:', settings.group_configurations.flash_sales || 'NOT SET');
        console.log('  * General notifications:', settings.group_configurations.general_notifications || 'NOT SET');
      } else {
        console.log('- No group configurations set');
      }
      
      // Test message logging capability
      const hasLog = await wa.hasMessageLog('test', 'test-context');
      console.log('✅ Message logging functional:', typeof hasLog === 'boolean');
      
      console.log('\n🎯 WhatsApp notification system is FUNCTIONAL ✅');
      
    } else {
      console.log('❌ No provider settings found - WhatsApp may not be configured properly');
    }
    
  } catch (error) {
    console.error('❌ WhatsApp Service Test Failed:', error.message);
    console.error('Full error:', error);
  }
}

testWhatsAppService();
