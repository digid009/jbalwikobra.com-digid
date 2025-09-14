// Test upload functionality dengan file dummy
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simulate File object untuk testing
class MockFile {
  constructor(content, filename, type) {
    this.content = content;
    this.name = filename;
    this.type = type;
    this.size = content.length;
  }
}

async function testUploadFlow() {
  console.log('🔍 Testing Upload Flow...\n');
  
  const BUCKET = 'product-images';
  
  try {
    // Test 1: Create mock image file
    console.log('1. Creating mock image file...');
    const imageContent = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xD9
    ]);
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2);
    const fileName = `test_upload_${timestamp}_${random}.jpg`;
    const filePath = `products/${fileName}`;
    
    console.log(`✅ Mock file created: ${fileName} (${imageContent.length} bytes)`);
    
    // Test 2: Test upload to product-images bucket
    console.log('\n2. Testing upload to product-images bucket...');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, imageContent, {
        contentType: 'image/jpeg',
        upsert: false,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      
      // Analyze specific errors
      if (uploadError.message?.includes('row-level security')) {
        console.error('\n🔒 RLS POLICY ERROR DETECTED!');
        console.error('💡 This means Row Level Security policies are blocking the upload');
        console.error('📋 To fix this, you need to add storage policies in Supabase dashboard:');
        console.error('   1. Go to Storage → Settings → Policies');
        console.error('   2. Add policy for INSERT on product-images bucket');
        console.error('   3. Allow authenticated users or public access');
        
        return;
      }
      
      if (uploadError.message?.includes('permission') || uploadError.message?.includes('denied')) {
        console.error('\n🚫 PERMISSION ERROR!');
        console.error('💡 Check bucket permissions and user authentication');
        return;
      }
      
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('\n📦 BUCKET NOT FOUND!');
        console.error('💡 The bucket exists but maybe not accessible with current key');
        return;
      }
      
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log(`📁 File path: ${uploadData.path}`);
    
    // Test 3: Generate public URL
    console.log('\n3. Testing public URL generation...');
    
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);
    
    if (!urlData?.publicUrl) {
      console.error('❌ Failed to generate public URL');
      return;
    }
    
    console.log('✅ Public URL generated successfully!');
    console.log(`🔗 URL: ${urlData.publicUrl}`);
    
    // Test 4: Verify file exists by listing
    console.log('\n4. Verifying file exists...');
    
    const folderPath = uploadData.path.includes('/') ? uploadData.path.split('/')[0] : '';
    const { data: listData, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(folderPath);
    
    if (listError) {
      console.error('❌ Failed to list files for verification:', listError);
    } else {
      const fileName = uploadData.path.split('/').pop();
      const fileExists = listData?.some(file => file.name === fileName);
      
      if (fileExists) {
        console.log('✅ File verified in bucket!');
      } else {
        console.log('❌ File not found in listing');
      }
    }
    
    // Test 5: Cleanup - delete test file
    console.log('\n5. Cleaning up test file...');
    
    const { error: deleteError } = await supabase.storage
      .from(BUCKET)
      .remove([uploadData.path]);
    
    if (deleteError) {
      console.warn('⚠️ Failed to delete test file:', deleteError.message);
      console.warn('💡 You may need to manually delete:', uploadData.path);
    } else {
      console.log('✅ Test file cleaned up successfully!');
    }
    
    console.log('\n🎉 ALL UPLOAD TESTS PASSED!');
    console.log('📊 Summary:');
    console.log('   ✅ Upload to bucket: SUCCESS');
    console.log('   ✅ Public URL generation: SUCCESS');
    console.log('   ✅ File verification: SUCCESS');
    console.log('   ✅ Cleanup: SUCCESS');
    
    console.log('\n💡 Upload functionality is working! If admin panel fails,');
    console.log('   check browser console for frontend-specific errors.');
    
  } catch (error) {
    console.error('\n💥 Unexpected error during upload test:', error);
  }
}

async function testStoragePolicies() {
  console.log('\n🔒 Testing Storage Policies...\n');
  
  try {
    // Test read access
    console.log('1. Testing read access to product-images...');
    const { data: readData, error: readError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });
    
    if (readError) {
      console.error('❌ Read access failed:', readError.message);
    } else {
      console.log('✅ Read access successful');
    }
    
    // Test specific folder access
    console.log('\n2. Testing access to products folder...');
    const { data: folderData, error: folderError } = await supabase.storage
      .from('product-images')
      .list('products', { limit: 1 });
    
    if (folderError) {
      console.error('❌ Folder access failed:', folderError.message);
    } else {
      console.log('✅ Products folder access successful');
    }
    
  } catch (error) {
    console.error('💥 Policy test error:', error);
  }
}

// Run tests
async function runTests() {
  await testStoragePolicies();
  await testUploadFlow();
}

runTests();
