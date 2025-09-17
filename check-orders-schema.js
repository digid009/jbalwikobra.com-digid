// Check orders table schema
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xeithuvgldzxnggxadri.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8'
);

async function checkOrdersSchema() {
  try {
    console.log('🔍 Checking orders table schema...');
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Available columns in orders table:');
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]).sort());
        console.log('\n📊 Sample order data:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('📋 No data in orders table');
      }
    }
    
    console.log('\n🔍 Checking payments table schema...');
    const { data: paymentData, error: paymentError } = await supabase.from('payments').select('*').limit(1);
    if (paymentError) {
      console.error('❌ Payments Error:', paymentError);
    } else {
      console.log('✅ Available columns in payments table:');
      if (paymentData && paymentData.length > 0) {
        console.log(Object.keys(paymentData[0]).sort());
        console.log('\n💳 Sample payment data:');
        console.log(JSON.stringify(paymentData[0], null, 2));
      } else {
        console.log('📋 No data in payments table');
      }
    }
    
  } catch (e) {
    console.error('❌ Error:', e);
  }
}

checkOrdersSchema();
