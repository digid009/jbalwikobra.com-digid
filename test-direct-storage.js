// Test direct access ke bucket product-images
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickTest() {
  console.log('🔍 Testing direct bucket access...\n');
  
  // Test 1: Direct access to product-images
  console.log('1. Testing product-images bucket...');
  const { data: files1, error: error1 } = await supabase.storage
    .from('product-images')
    .list();
    
  if (error1) {
    console.log('❌ Error accessing product-images:', error1.message);
  } else {
    console.log(`✅ Success! Found ${files1?.length || 0} items in product-images`);
  }
  
  // Test 2: Try other common bucket names
  const testBuckets = ['products', 'images', 'uploads', 'public'];
  
  for (const bucketName of testBuckets) {
    console.log(`\n2. Testing ${bucketName} bucket...`);
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list();
      
    if (error) {
      console.log(`❌ ${bucketName}: ${error.message}`);
    } else {
      console.log(`✅ ${bucketName}: Found ${files?.length || 0} items`);
    }
  }
  
  // Test 3: List buckets with different method
  console.log('\n3. Alternative bucket listing...');
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const buckets = await response.json();
      console.log('✅ Alternative method success:');
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name}`);
      });
    } else {
      console.log(`❌ Alternative method failed: ${response.status}`);
    }
  } catch (err) {
    console.log('❌ Alternative method error:', err.message);
  }
}

quickTest();
