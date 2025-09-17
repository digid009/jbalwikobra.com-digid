// Insert sample payment data to test the connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Sample payment data from the attachment
const samplePayments = [
  {
    xendit_id: 'qr_2462a5d7-22c1-4468-a0bd-55f17b147ae8',
    external_id: 'order_1758079852639_xyz3evagn',
    payment_method: 'qris',
    amount: 3500000,
    currency: 'IDR',
    status: 'ACTIVE',
    description: null,
    payment_data: {
      qr_url: '00020101021226650013CO.XENDIT.WWW01189360084800000054690215MTp47ZSspWsSQxG0303UME51370014ID.CO.QRIS.WWW0215ID2025426752668520450995303360540735000005802ID5923PT ALWI KOBRA INDONESIA6006Bekasi61051715162290525oZQ5Zisyqc0JzsmasUcpZ50eC6304B55C',
      qr_string: '00020101021226650013CO.XENDIT.WWW01189360084800000054690215MTp47ZSspWsSQxG0303UME51370014ID.CO.QRIS.WWW0215ID2025426752668520450995303360540735000005802ID5923PT ALWI KOBRA INDONESIA6006Bekasi61051715162290525oZQ5Zisyqc0JzsmasUcpZ50eC6304B55C'
    },
    expiry_date: null,
    created_at: '2025-09-17T03:31:16.284+00:00',
    updated_at: '2025-09-17T03:31:16.874749+00:00'
  },
  {
    xendit_id: 'qr_ea76cc0f-bb4b-498c-bd1b-e5d3c923d14c',
    external_id: 'order_1758081238796_rtzh7vmh6',
    payment_method: 'qris',
    amount: 2000000,
    currency: 'IDR',
    status: 'ACTIVE',
    description: null,
    payment_data: {
      qr_url: '00020101021226650013CO.XENDIT.WWW01189360084800000054690215MTp47ZSspWsSQxG0303UME51370014ID.CO.QRIS.WWW0215ID2025426752668520450995303360540720000005802ID5923PT ALWI KOBRA INDONESIA6006Bekasi61051715162290525kFbi0w4wtTlpjLhBpzKjlyzvi63049C99',
      qr_string: '00020101021226650013CO.XENDIT.WWW01189360084800000054690215MTp47ZSspWsSQxG0303UME51370014ID.CO.QRIS.WWW0215ID2025426752668520450995303360540720000005802ID5923PT ALWI KOBRA INDONESIA6006Bekasi61051715162290525kFbi0w4wtTlpjLhBpzKjlyzvi63049C99'
    },
    expiry_date: null,
    created_at: '2025-09-17T03:54:21.336+00:00',
    updated_at: '2025-09-17T03:54:21.97489+00:00'
  },
  {
    xendit_id: 'pr-65f16d9d-96ec-4580-ab09-31d414f1b481',
    external_id: 'order_1758082847100_wzncq17j0',
    payment_method: 'bni',
    amount: 50000000,
    currency: 'IDR',
    status: 'PENDING',
    description: null,
    payment_data: {
      bank_code: 'BNI'
    },
    expiry_date: null,
    created_at: '2025-09-17T04:20:49.462+00:00',
    updated_at: '2025-09-17T04:20:49.594386+00:00'
  }
];

async function insertSamplePayments() {
  try {
    console.log('🔧 Inserting sample payment data...\n');

    for (const payment of samplePayments) {
      console.log(`💳 Inserting payment: ${payment.external_id}`);
      
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select();

      if (error) {
        console.error(`❌ Error inserting ${payment.external_id}:`, error.message);
      } else {
        console.log(`✅ Successfully inserted ${payment.external_id}`);
      }
    }

    console.log('\n🎯 Testing connection after insertion...');
    
    // Test the connection
    const { data: orders } = await supabase
      .from('orders')
      .select('client_external_id')
      .not('client_external_id', 'is', null)
      .limit(5);

    const externalIds = orders?.map(o => o.client_external_id) || [];
    
    const { data: payments } = await supabase
      .from('payments')
      .select('external_id, payment_method, status')
      .in('external_id', externalIds);

    console.log(`\n📊 Connection test results:`);
    console.log(`   Orders with external_id: ${externalIds.length}`);
    console.log(`   Matching payments: ${payments?.length || 0}`);

    if (payments && payments.length > 0) {
      console.log('\n✅ Sample payments connected successfully!');
      payments.forEach(p => {
        console.log(`   🔗 ${p.external_id} → ${p.payment_method} (${p.status})`);
      });
    } else {
      console.log('\n⚠️  No connections found. External IDs might not match existing orders.');
    }

  } catch (error) {
    console.error('❌ Failed to insert sample payments:', error);
  }
}

// Create matching orders for the sample payments
async function createMatchingOrders() {
  try {
    console.log('📦 Creating matching orders for sample payments...\n');

    const sampleOrders = [
      {
        id: '12345678-1234-1234-1234-123456789abc',
        client_external_id: 'order_1758079852639_xyz3evagn',
        customer_name: 'Test Customer QRIS',
        customer_email: 'test.qris@example.com',
        customer_phone: '+628123456789',
        order_type: 'purchase',
        amount: 3500000,
        status: 'pending',
        payment_method: 'xendit',
        created_at: new Date().toISOString()
      },
      {
        id: '12345678-1234-1234-1234-123456789abd',
        client_external_id: 'order_1758081238796_rtzh7vmh6',
        customer_name: 'Test Customer QRIS 2',
        customer_email: 'test.qris2@example.com',
        customer_phone: '+628123456790',
        order_type: 'purchase',
        amount: 2000000,
        status: 'pending',
        payment_method: 'xendit',
        created_at: new Date().toISOString()
      },
      {
        id: '12345678-1234-1234-1234-123456789abe',
        client_external_id: 'order_1758082847100_wzncq17j0',
        customer_name: 'Test Customer BNI',
        customer_email: 'test.bni@example.com',
        customer_phone: '+628123456791',
        order_type: 'purchase',
        amount: 50000000,
        status: 'pending',
        payment_method: 'xendit',
        created_at: new Date().toISOString()
      }
    ];

    for (const order of sampleOrders) {
      console.log(`📦 Creating order: ${order.client_external_id}`);
      
      const { error } = await supabase
        .from('orders')
        .insert(order);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Order ${order.client_external_id} already exists`);
        } else {
          console.error(`❌ Error creating ${order.client_external_id}:`, error.message);
        }
      } else {
        console.log(`✅ Successfully created ${order.client_external_id}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to create sample orders:', error);
  }
}

async function main() {
  console.log('🚀 Setting up test data for Orders ↔ Payments connection\n');
  
  await createMatchingOrders();
  console.log('\n' + '='.repeat(50) + '\n');
  await insertSamplePayments();
  
  console.log('\n🏁 Setup completed. You can now test the admin panel!');
  console.log('💡 Run the React app and check the Orders section to see the payment data.');
}

main().then(() => process.exit(0));
