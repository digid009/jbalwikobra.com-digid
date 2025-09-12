const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dnalmdgdxyibmjxmezuz.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYWxtZGdkeHlpYm1qeG1lenV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NjM5NjcsImV4cCI6MjA1MzAzOTk2N30.SZJlSYvd8-kK_mMoL5-0nZKf3qfHHoNm16wVi_4PZQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticDataCheck() {
  try {
    console.log('🔍 Running Admin Data Diagnostic...\n');

    // Check orders data
    console.log('📋 ORDERS DATA:');
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Orders Error:', ordersError.message);
    } else {
      console.log(`✅ Total Orders: ${ordersCount}`);
      console.log('Sample orders:', orders?.map(o => ({
        id: o.id,
        customer_name: o.customer_name,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at
      })));
    }

    // Check users data
    console.log('\n👥 USERS DATA:');
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (usersError) {
      console.log('❌ Users Error:', usersError.message);
    } else {
      console.log(`✅ Total Users: ${usersCount}`);
      console.log('Sample users:', users?.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        created_at: u.created_at
      })));
    }

    // Check products data
    console.log('\n📦 PRODUCTS DATA:');
    const { data: products, error: productsError, count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .limit(3);
    
    if (productsError) {
      console.log('❌ Products Error:', productsError.message);
    } else {
      console.log(`✅ Active Products: ${productsCount}`);
      console.log('Sample products:', products?.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        is_active: p.is_active
      })));
    }

    // Check reviews data
    console.log('\n⭐ REVIEWS DATA:');
    const { data: reviews, error: reviewsError, count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (reviewsError) {
      console.log('❌ Reviews Error:', reviewsError.message);
    } else {
      console.log(`✅ Total Reviews: ${reviewsCount}`);
      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        console.log(`✅ Average Rating: ${avgRating.toFixed(1)}`);
        console.log('Sample reviews:', reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment?.substring(0, 50) + '...'
        })));
      }
    }

    // Check order statistics
    console.log('\n📊 ORDER STATISTICS:');
    const { data: orderStats } = await supabase
      .from('orders')
      .select('status, amount');
    
    if (orderStats) {
      const statusCounts = orderStats.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      const totalRevenue = orderStats.reduce((sum, order) => sum + (order.amount || 0), 0);
      
      console.log('✅ Status breakdown:', statusCounts);
      console.log(`✅ Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    }

    console.log('\n✅ Diagnostic Complete!');

  } catch (error) {
    console.error('❌ Diagnostic Error:', error);
  }
}

diagnosticDataCheck();
