// Setup Storage Policies menggunakan Supabase Management API
const https = require('https');

const SUPABASE_PROJECT_REF = 'xeithuvgldzxnggxadri';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

// Kita akan menggunakan direct SQL execution
async function executeSQL(sql) {
  console.log('📝 Executing SQL:', sql);
  
  // Method 1: Try with PostgREST endpoint
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ'
      },
      body: JSON.stringify({ sql_query: sql })
    });
    
    const result = await response.text();
    console.log('📊 Result:', result);
    
    return response.ok;
  } catch (error) {
    console.error('❌ SQL execution failed:', error.message);
    return false;
  }
}

async function setupWithDifferentMethods() {
  console.log('🔧 Trying different methods to setup storage policies...\n');
  
  // Method 1: Direct bucket policy setup
  console.log('Method 1: Setting bucket to public...');
  
  // This is often the simplest solution - make the bucket public
  const publicBucketSQL = `
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'product-images';
  `;
  
  await executeSQL(publicBucketSQL);
  
  // Method 2: Create minimal RLS policies
  console.log('\nMethod 2: Creating minimal RLS policies...');
  
  const policies = [
    // Allow all operations on product-images bucket
    `CREATE POLICY "product_images_policy" ON storage.objects
     FOR ALL USING (bucket_id = 'product-images');`
  ];
  
  for (const policy of policies) {
    await executeSQL(policy);
  }
  
  // Method 3: Disable RLS entirely for storage.objects (if needed)
  console.log('\nMethod 3: Alternative - disable RLS for testing...');
  console.log('⚠️ WARNING: This makes storage completely public!');
  
  const disableRLS = `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`;
  // await executeSQL(disableRLS); // Commented out for safety
  
  console.log('\n📋 Manual Dashboard Method (Recommended):');
  console.log('1. Go to: https://supabase.com/dashboard/project/xeithuvgldzxnggxadri/storage/policies');
  console.log('2. Click "New Policy"');
  console.log('3. Use "Get started quickly" template');
  console.log('4. Select "Allow public access" or "Allow authenticated access"');
  console.log('5. Select bucket: product-images');
  console.log('6. Select operations: INSERT, SELECT');
  console.log('7. Click "Save Policy"');
}

// Test if we can create a simple storage policy via SQL
async function createSimplePolicy() {
  console.log('🎯 Creating simple policy via SQL...\n');
  
  // Try to create the most basic policy
  const basicPolicy = `
    CREATE POLICY IF NOT EXISTS "allow_all_product_images" 
    ON storage.objects 
    FOR ALL 
    TO public 
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
  `;
  
  const success = await executeSQL(basicPolicy);
  
  if (success) {
    console.log('✅ Simple policy created successfully!');
  } else {
    console.log('❌ Failed to create policy via SQL');
  }
  
  return success;
}

// Alternative: Create SQL file that user can run manually
function createManualSQLFile() {
  const fs = require('fs');
  
  const sqlContent = `-- Manual Storage Policies Setup
-- Copy and paste this entire content to Supabase SQL Editor
-- Or run: psql -h your-host -U postgres -d postgres -f manual-storage-setup.sql

-- Method 1: Make bucket public (Simplest)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- Method 2: Create comprehensive RLS policies
CREATE POLICY IF NOT EXISTS "product_images_select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

-- Verify policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND qual LIKE '%product-images%'
ORDER BY policyname;

-- Test query (should return bucket info)
SELECT * FROM storage.buckets WHERE id = 'product-images';
`;

  fs.writeFileSync('manual-storage-setup.sql', sqlContent);
  console.log('📁 Created manual-storage-setup.sql');
  console.log('📋 To use:');
  console.log('1. Open Supabase Dashboard → SQL Editor');
  console.log('2. Copy content from manual-storage-setup.sql');
  console.log('3. Paste and run in SQL Editor');
  console.log('4. Test upload: node test-upload-flow.js');
}

async function main() {
  console.log('🚀 Auto Storage Policy Setup\n');
  
  // Try automatic methods first
  const success = await createSimplePolicy();
  
  if (!success) {
    await setupWithDifferentMethods();
  }
  
  // Always create manual backup file
  createManualSQLFile();
  
  console.log('\n🧪 Testing current state...');
  
  // Test upload after attempts
  const { execSync } = require('child_process');
  try {
    const result = execSync('node test-upload-flow.js', { encoding: 'utf8' });
    console.log(result);
  } catch (error) {
    console.log('❌ Upload test still failing - manual setup required');
  }
}

main();
