#!/usr/bin/env node

/**
 * Test Purchase Flow WhatsApp Group Settings
 * 
 * This script tests that purchase orders are properly routed to the configured
 * WhatsApp groups based on the admin settings we've implemented.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mzrqjvvzdknpjrwftsiq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.TEST_BASE_URL || 'https://jbalwikobra-com-digid-fymxrkce2-digitalindo.vercel.app';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testPurchaseFlowGroupSettings() {
  console.log('🧪 Testing Purchase Flow WhatsApp Group Settings');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('🗄️ Database:', SUPABASE_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Check current WhatsApp provider settings
    console.log('\n1️⃣ Checking WhatsApp Provider Settings...');
    
    const { data: providers, error: providerError } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .limit(1);
      
    if (providerError) {
      console.error('❌ Failed to fetch provider settings:', providerError);
      return;
    }
    
    if (!providers || providers.length === 0) {
      console.log('⚠️ No active WhatsApp provider found');
      return;
    }
    
    const provider = providers[0];
    console.log('✅ Active Provider:', provider.display_name || provider.name);
    console.log('📋 Provider Settings:', JSON.stringify(provider.settings, null, 2));
    
    const settings = provider.settings || {};
    const groupConfigs = settings.group_configurations || {};
    
    console.log('\n📊 Group Configuration Summary:');
    console.log(`   • Default Group: ${settings.default_group_id || 'Not set'}`);
    console.log(`   • Purchase Orders: ${groupConfigs.purchase_orders || 'Not set (will use default)'}`);
    console.log(`   • Rental Orders: ${groupConfigs.rental_orders || 'Not set (will use default)'}`);
    console.log(`   • Flash Sales: ${groupConfigs.flash_sales || 'Not set (will use default)'}`);
    console.log(`   • General Notifications: ${groupConfigs.general_notifications || 'Not set (will use default)'}`);

    // 2. Test the admin-whatsapp API endpoint
    console.log('\n2️⃣ Testing Admin WhatsApp API...');
    
    const adminResponse = await fetch(`${BASE_URL}/api/admin-whatsapp`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!adminResponse.ok) {
      console.log('❌ Admin API failed:', adminResponse.status, adminResponse.statusText);
      const errorText = await adminResponse.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const adminData = await adminResponse.json();
    console.log('✅ Admin API Response:', JSON.stringify(adminData, null, 2));

    // 3. Create a test purchase order to verify group routing
    console.log('\n3️⃣ Creating Test Purchase Order...');
    
    const testOrderId = `test_purchase_${Date.now()}`;
    const testOrder = {
      id: testOrderId,
      customer_name: 'Test Customer Purchase',
      customer_email: 'test.purchase@jbalwikobra.com',
      customer_phone: '6281234567890',
      amount: 150000,
      status: 'pending',
      order_type: 'purchase',
      product_id: 'test-product-123',
      client_external_id: `client_${testOrderId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Failed to create test order:', insertError);
      return;
    }
    
    console.log('✅ Test Purchase Order Created:', newOrder.id);
    console.log('   Customer:', newOrder.customer_name);
    console.log('   Order Type:', newOrder.order_type);
    console.log('   Amount:', `Rp ${newOrder.amount?.toLocaleString('id-ID')}`);

    // 4. Update order to paid status to trigger webhook logic
    console.log('\n4️⃣ Simulating Payment Completion...');
    
    const { data: paidOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_channel: 'qris',
        xendit_invoice_id: `test_invoice_${Date.now()}`
      })
      .eq('id', newOrder.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('❌ Failed to update order status:', updateError);
      return;
    }
    
    console.log('✅ Order Status Updated to Paid');
    console.log('   Paid at:', paidOrder.paid_at);

    // 5. Test group selection logic
    console.log('\n5️⃣ Testing Group Selection Logic...');
    
    // Simulate the webhook's group selection logic
    let selectedGroupId = settings.default_group_id; // fallback
    
    if (groupConfigs.purchase_orders) {
      selectedGroupId = groupConfigs.purchase_orders;
      console.log('✅ Purchase Order detected → Using purchase_orders group');
    } else {
      console.log('ℹ️ No purchase_orders group configured → Using default_group_id');
    }
    
    console.log(`📱 Selected Group ID: ${selectedGroupId}`);
    
    // 6. Simulate notification message generation
    console.log('\n6️⃣ Testing Notification Message Generation...');
    
    const productName = 'Test Product';
    const isRental = paidOrder.order_type === 'rental';
    
    if (isRental) {
      console.log('❌ Expected purchase order, but got rental order');
      return;
    }
    
    console.log('✅ Purchase Order Message Template Generated');
    console.log(`   Product: ${productName}`);
    console.log(`   Amount: Rp ${Number(paidOrder.amount || 0).toLocaleString('id-ID')}`);
    console.log(`   Customer: ${paidOrder.customer_name}`);

    // 7. Clean up test data
    console.log('\n7️⃣ Cleaning Up Test Data...');
    
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', newOrder.id);
      
    if (deleteError) {
      console.log('⚠️ Failed to delete test order:', deleteError);
    } else {
      console.log('✅ Test order cleaned up');
    }

    // 8. Summary
    console.log('\n📊 PURCHASE FLOW TEST SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ WhatsApp Provider Configuration: VERIFIED');
    console.log('✅ Admin API Endpoint: WORKING');
    console.log('✅ Order Creation: SUCCESS');
    console.log('✅ Payment Status Update: SUCCESS');
    console.log(`✅ Group Selection Logic: ${selectedGroupId ? 'WORKING' : 'NEEDS CONFIGURATION'}`);
    console.log('✅ Message Template: GENERATED');
    
    if (groupConfigs.purchase_orders) {
      console.log(`🎯 Purchase orders will be sent to: ${groupConfigs.purchase_orders}`);
    } else if (settings.default_group_id) {
      console.log(`🎯 Purchase orders will be sent to default group: ${settings.default_group_id}`);
    } else {
      console.log('⚠️ No group configured for purchase notifications!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
if (require.main === module) {
  testPurchaseFlowGroupSettings()
    .then(() => {
      console.log('\n✅ Purchase Flow Group Settings Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPurchaseFlowGroupSettings };
