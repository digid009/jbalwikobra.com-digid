// Setup storage policies menggunakan Supabase API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xeithuvgldzxnggxadri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ';

// Try to use service role if available from environment
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStoragePolicies() {
  console.log('🔧 Setting up Storage Policies via API...\n');
  
  try {
    // Method 1: Try direct SQL execution
    console.log('1. Attempting to execute SQL policies...');
    
    const policies = [
      // Drop existing policies first (if any)
      `DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated management" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;`,
      
      // Create new policies
      `CREATE POLICY "Allow public read access" ON storage.objects
       FOR SELECT USING (bucket_id = 'product-images');`,
      
      `CREATE POLICY "Allow public uploads" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'product-images');`,
      
      `CREATE POLICY "Allow authenticated management" ON storage.objects
       FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Allow authenticated deletes" ON storage.objects
       FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');`
    ];
    
    for (let i = 0; i < policies.length; i++) {
      const sql = policies[i];
      console.log(`   Executing policy ${i + 1}/${policies.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.log(`   ❌ Policy ${i + 1} failed:`, error.message);
        } else {
          console.log(`   ✅ Policy ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`   ❌ Policy ${i + 1} error:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ SQL execution method failed:', error.message);
  }
  
  // Method 2: Try using REST API directly
  console.log('\n2. Attempting via REST API...');
  
  try {
    // Check if we can create policies via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_storage_policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        bucket_name: 'product-images',
        policy_name: 'Allow public uploads',
        operation: 'INSERT',
        expression: "bucket_id = 'product-images'"
      })
    });
    
    if (response.ok) {
      console.log('✅ REST API method successful');
    } else {
      console.log('❌ REST API method failed:', response.status, await response.text());
    }
    
  } catch (error) {
    console.error('❌ REST API method error:', error.message);
  }
  
  console.log('\n📋 Manual Setup Required');
  console.log('Since automatic setup failed, please do manual setup:');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select project: Database-JBAlwikobra');
  console.log('3. Go to Storage → Policies');
  console.log('4. Click "New Policy"');
  console.log('5. Add these policies one by one:');
  console.log('');
  console.log('   Policy 1: Allow public read');
  console.log('   - Policy Name: Allow public read access');
  console.log('   - Allowed Operations: SELECT');
  console.log('   - Target Roles: public');
  console.log('   - USING expression: bucket_id = \'product-images\'');
  console.log('');
  console.log('   Policy 2: Allow public upload');
  console.log('   - Policy Name: Allow public uploads');
  console.log('   - Allowed Operations: INSERT');
  console.log('   - Target Roles: public');
  console.log('   - WITH CHECK expression: bucket_id = \'product-images\'');
  console.log('');
  console.log('Or copy-paste SQL from storage-policies.sql to SQL Editor');
}

async function testPoliciesSetup() {
  console.log('\n🧪 Testing if policies are already set up...\n');
  
  // Test upload to see if policies work
  const testData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // Mock JPEG header
  const testFileName = `test-policy-${Date.now()}.jpg`;
  
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`test/${testFileName}`, testData, {
        contentType: 'image/jpeg'
      });
    
    if (error) {
      if (error.message.includes('row-level security')) {
        console.log('❌ Policies not set up yet - RLS blocking upload');
        console.log('💡 Need to setup storage policies');
        return false;
      } else {
        console.log('❌ Other upload error:', error.message);
        return false;
      }
    } else {
      console.log('✅ Upload successful - policies are working!');
      console.log(`📁 Test file: ${data.path}`);
      
      // Cleanup
      await supabase.storage
        .from('product-images')
        .remove([data.path])
        .catch(() => {});
      
      return true;
    }
  } catch (err) {
    console.log('❌ Test error:', err.message);
    return false;
  }
}

async function main() {
  // First test if policies are already working
  const policiesWork = await testPoliciesSetup();
  
  if (!policiesWork) {
    await setupStoragePolicies();
  } else {
    console.log('\n🎉 Storage policies are already working correctly!');
    console.log('✅ Upload functionality should work in admin panel');
  }
}

main();
