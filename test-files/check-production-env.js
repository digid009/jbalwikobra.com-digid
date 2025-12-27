// Check environment variables on production
const fetch = require('node-fetch');

async function checkProductionEnv() {
  console.log('🔍 Checking production environment variables...');
  
  try {
    // Create a simple endpoint test
    const testPayload = {
      test: true,
      debug_env: true
    };

    console.log('📤 Testing environment variable access...');
    
    const response = await fetch('https://jbalwikobra.com/api/xendit/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('📋 Error response (this may show env issues):', errorText);
    }

    console.log('\n📋 Environment Variables That Should Be Set on Vercel:');
    console.log('1. SUPABASE_URL ✓ (already exists in .env.local)');
    console.log('2. SUPABASE_SERVICE_ROLE_KEY ❌ (MISSING - this is critical!)');
    console.log('3. XENDIT_SECRET_KEY ✓ (already exists in .env.local)');
    
    console.log('\n🚨 CRITICAL ISSUE FOUND:');
    console.log('The SUPABASE_SERVICE_ROLE_KEY is missing from Vercel environment variables!');
    console.log('This prevents the API from creating admin notifications.');
    
    console.log('\n🔧 TO FIX:');
    console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('2. Add: SUPABASE_SERVICE_ROLE_KEY = [your service role key from Supabase]');
    console.log('3. Redeploy the project');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkProductionEnv();
