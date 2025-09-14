// Test storage service dan upload gambar
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = 'product-images';

async function testStorageService() {
  console.log('🔍 Testing storage service for image upload issues...\n');
  
  try {
    // 1. Test bucket exists dan permissions
    console.log('📂 Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    
    console.log('✅ Available buckets:');
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const productImagesBucket = buckets?.find(b => b.name === BUCKET);
    if (!productImagesBucket) {
      console.error(`❌ Bucket '${BUCKET}' not found!`);
      console.log('💡 This is likely the main issue with image uploads');
      return;
    }
    
    console.log(`✅ Bucket '${BUCKET}' found and is ${productImagesBucket.public ? 'public' : 'private'}`);
    console.log('');

    // 2. Test bucket contents
    console.log('📁 Testing bucket contents...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list('products', { limit: 5 });
    
    if (listError) {
      console.error('❌ Error listing files in bucket:', listError);
      console.error('❌ Error code:', listError.error || listError.message);
      console.log('💡 This indicates permission issues with storage bucket');
    } else {
      console.log(`✅ Successfully listed files in ${BUCKET}/products`);
      console.log(`📄 Found ${files?.length || 0} files`);
      if (files && files.length > 0) {
        files.slice(0, 3).forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
        });
      }
    }
    console.log('');

    // 3. Test upload permissions (simulate)
    console.log('🧪 Testing upload permissions...');
    
    // Create a minimal test file (1x1 transparent PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    // Convert data URL to blob
    const response = await fetch(testImageData);
    const blob = await response.blob();
    
    const testFileName = `test-upload-${Date.now()}.png`;
    const testPath = `products/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(testPath, blob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.error('❌ Error code:', uploadError.error || uploadError.message);
      
      if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
        console.log('💡 This is a permissions issue - RLS policies need to be configured');
      }
      if (uploadError.message?.includes('bucket')) {
        console.log('💡 This is a bucket configuration issue');
      }
    } else {
      console.log('✅ Upload test successful!');
      console.log(`📤 Uploaded: ${uploadData?.path}`);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([testPath]);
      
      if (!deleteError) {
        console.log('🧹 Test file cleaned up');
      }
    }
    console.log('');

    // 4. Test public URL generation
    console.log('🌐 Testing public URL generation...');
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl('products/test.jpg');
    
    console.log('✅ Public URL generated:', publicUrlData.publicUrl);
    console.log('');

    // 5. Check environment variables
    console.log('🔧 Checking environment configuration...');
    console.log('Environment variables status:');
    console.log(`   - REACT_APP_SUPABASE_URL: ${process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - REACT_APP_SUPABASE_ANON_KEY: ${process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - REACT_APP_SUPABASE_STORAGE_BUCKET: ${process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'Not set (using default)'}`);

  } catch (error) {
    console.error('💥 Unexpected error during storage tests:', error);
  }
}

testStorageService();
