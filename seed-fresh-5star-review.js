/**
 * Seed: Drop current reviews and insert a new 5-star review in Bahasa
 * Uses actual paid order if available.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Prefer service role for seeding to bypass RLS for bulk ops (safe in backend scripts only)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !(SERVICE_KEY || ANON_KEY)) {
  console.error('Missing Supabase credentials. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_KEY || ANON_KEY
);

async function run() {
  console.log('🔄 Dropping existing reviews...');
  // Danger: delete all reviews
  // Delete all rows (requires service role). Using a safe non-null filter on primary key.
  let { error: delErr } = await supabase.from('reviews').delete().not('id', 'is', null);
  if (delErr) {
    console.error('Failed to delete reviews (likely RLS). Ensure SUPABASE_SERVICE_ROLE_KEY is set. Error:', delErr.message);
  } else {
    console.log('✅ All reviews deleted');
  }

  console.log('🔍 Finding a paid order to base the review on...');
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id,user_id,product_id,status,created_at')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (orderErr || !order) {
    console.warn('⚠️ No paid order found. Seeding a generic review.');
  }

  const userId = order?.user_id || null;
  const productId = order?.product_id || null;

  console.log('✍️ Inserting a new 5-star review (Bahasa)...');
  const { error: insertErr } = await supabase.from('reviews').insert([
    {
      user_id: userId,
      product_id: productId,
      rating: 5,
      comment:
        'Mantap banget! Proses pembelian cepat, barang sesuai deskripsi, dan adminnya responsif. Recommended pokoknya, bakal repeat order! Terima kasih banyak 🙏',
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  if (insertErr) {
    console.error('❌ Failed to insert review (check RLS/keys):', insertErr.message);
  } else {
    console.log('✅ 5-star review seeded successfully');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
