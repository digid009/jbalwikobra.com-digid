// Test direct database access to see what's actually stored
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://agiubmkgglwmfjhizcph.supabase.co';
// Using the service role key that should be in the API
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnaXVibWtnZ2x3bWZqaGl6Y3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNDczNzc4NywiZXhwIjoyMDIwMzEzNzg3fQ.sP6GnC8_PF5L5UZLp4lOdw2L4gY3JfkGd2jdHgJl8eI';

const external_id = 'test-payment-1759060590371';
const xendit_id = '68d92299278fb8951416dabf';

async function checkDatabase() {
  console.log('🔍 DIRECT DATABASE CHECK');
  console.log('=========================');
  console.log('External ID:', external_id);
  console.log('Xendit ID:', xendit_id);
  console.log('');

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check payments table
    console.log('1️⃣ Checking payments table...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', external_id);

    if (paymentsError) {
      console.error('❌ Payments query error:', paymentsError);
    } else {
      console.log('📋 Payments found:', payments?.length || 0);
      if (payments && payments.length > 0) {
        payments.forEach((payment, index) => {
          console.log(`\n💳 Payment ${index + 1}:`);
          console.log('  ID:', payment.id);
          console.log('  Xendit ID:', payment.xendit_id);
          console.log('  Payment Method:', payment.payment_method);
          console.log('  Status:', payment.status);
          console.log('  Amount:', payment.amount);
          console.log('  Created:', payment.created_at);
          console.log('  Payment Data Keys:', Object.keys(payment.payment_data || {}));
          console.log('  Payment Data:', JSON.stringify(payment.payment_data, null, 2));
        });
      } else {
        console.log('❌ No payments found in database');
      }
    }

    // Check fixed_virtual_accounts table
    console.log('\n2️⃣ Checking fixed_virtual_accounts table...');
    const { data: vas, error: vasError } = await supabase
      .from('fixed_virtual_accounts')
      .select('*')
      .eq('external_id', external_id);

    if (vasError) {
      console.error('❌ VA query error:', vasError);
    } else {
      console.log('📋 Fixed VAs found:', vas?.length || 0);
      if (vas && vas.length > 0) {
        vas.forEach((va, index) => {
          console.log(`\n🏦 VA ${index + 1}:`);
          console.log('  ID:', va.id);
          console.log('  Account Number:', va.account_number);
          console.log('  Bank Code:', va.bank_code);
          console.log('  Name:', va.name);
          console.log('  Status:', va.status);
          console.log('  Created:', va.created_at);
        });
      } else {
        console.log('❌ No VAs found in database');
      }
    }

  } catch (error) {
    console.error('❌ Database test error:', error);
  }
}

checkDatabase();