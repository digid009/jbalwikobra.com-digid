const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('Missing environment variables');
  console.log('URL:', url ? 'Present' : 'Missing');
  console.log('Key:', key ? 'Present' : 'Missing');
  process.exit(1);
}

const client = createClient(url, key);

async function checkSchema() {
  console.log('\n=== DATABASE SCHEMA DETECTION ===');
  
  // Check products table
  console.log('\n--- PRODUCTS TABLE ---');
  try {
    const { data, error, count } = await client
      .from('products')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('Products error:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('Products count:', count);
      if (data && data[0]) {
        console.log('Available columns:', Object.keys(data[0]).sort());
        console.log('Sample row:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('No product data found');
      }
    }
  } catch (e) {
    console.log('Products fetch failed:', e.message);
  }
  
  // Check orders table
  console.log('\n--- ORDERS TABLE ---');
  try {
    const { data, error, count } = await client
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('Orders error:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('Orders count:', count);
      if (data && data[0]) {
        console.log('Available columns:', Object.keys(data[0]).sort());
        console.log('Sample row:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('No order data found');
      }
    }
  } catch (e) {
    console.log('Orders fetch failed:', e.message);
  }

  // Check users table
  console.log('\n--- USERS TABLE ---');
  try {
    const { data, error, count } = await client
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('Users error:', error.message);
    } else {
      console.log('Users count:', count);
      if (data && data[0]) {
        console.log('Available columns:', Object.keys(data[0]).sort());
      } else {
        console.log('No user data found');
      }
    }
  } catch (e) {
    console.log('Users fetch failed:', e.message);
  }
}

checkSchema().then(() => process.exit(0));
