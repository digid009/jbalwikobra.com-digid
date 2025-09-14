// Test storage bucket access dengan proper environment
const { createClient } = require('@supabase/supabase-js');

// Ambil dari environment yang sama seperti app
const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorageAccess() {
  console.log('🔍 Testing Storage Access...\n');
  
  try {
    // Test 1: List all buckets
    console.log('1. Testing bucket list access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Available buckets:');
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    // Test 2: Check product-images bucket specifically
    console.log('\n2. Testing product-images bucket access...');
    const productImagesBucket = buckets?.find(b => b.name === 'product-images');
    
    if (!productImagesBucket) {
      console.error('❌ product-images bucket not found!');
      return;
    }
    
    console.log('✅ product-images bucket found:', {
      name: productImagesBucket.name,
      public: productImagesBucket.public,
      id: productImagesBucket.id
    });
    
    // Test 3: List files in product-images bucket
    console.log('\n3. Testing file listing in product-images...');
    const { data: files, error: filesError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      console.error('   This might be a permissions issue or RLS policy');
      return;
    }
    
    console.log(`✅ Found ${files?.length || 0} items in product-images bucket`);
    files?.slice(0, 5).forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
    });
    
    // Test 4: Test public URL generation
    if (files && files.length > 0) {
      console.log('\n4. Testing public URL generation...');
      const testFile = files[0];
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(testFile.name);
      
      if (urlData?.publicUrl) {
        console.log('✅ Public URL generation works:');
        console.log(`   File: ${testFile.name}`);
        console.log(`   URL: ${urlData.publicUrl}`);
      } else {
        console.error('❌ Failed to generate public URL');
      }
    }
    
    // Test 5: Test upload permissions (create a small test file)
    console.log('\n5. Testing upload permissions...');
    
    // Create a small test file (simulated)
    const testData = new TextEncoder().encode('test upload content');
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(`test/${testFileName}`, testData, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.error('   Error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode
      });
      
      // Analyze error
      if (uploadError.message?.includes('row-level security')) {
        console.error('💡 This looks like a Row Level Security (RLS) policy issue');
        console.error('💡 Check storage policies in Supabase dashboard');
      }
      
      if (uploadError.message?.includes('permission')) {
        console.error('💡 This looks like a permissions issue');
        console.error('💡 Check bucket permissions and user access');
      }
      
    } else {
      console.log('✅ Upload test successful!');
      console.log(`   Uploaded: ${uploadData?.path}`);
      
      // Clean up test file
      await supabase.storage
        .from('product-images')
        .remove([uploadData?.path])
        .catch(() => {}); // Ignore cleanup errors
      
      console.log('✅ Test file cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testStorageAccess();
