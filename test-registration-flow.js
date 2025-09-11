const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration API Flow...\n');

  const baseUrl = 'http://localhost:3000'; // Local development
  const testPhone = '+6281234567890'; // Test phone number
  
  try {
    // Step 1: Test signup
    console.log('1️⃣  Testing signup...');
    const signupResponse = await fetch(`${baseUrl}/api/auth?action=signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
    
    if (!signupData.success) {
      console.error('❌ Signup failed:', signupData.error);
      return;
    }
    
    const userId = signupData.user_id;
    console.log('✅ Signup successful, user_id:', userId);
    
    // Step 2: Get verification code from database (since WhatsApp is disabled)
    console.log('\n2️⃣  Getting verification code from database...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: verification } = await supabase
      .from('phone_verifications')
      .select('verification_code')
      .eq('user_id', userId)
      .eq('is_used', false)
      .single();
      
    if (!verification) {
      console.error('❌ No verification code found');
      return;
    }
    
    const verificationCode = verification.verification_code;
    console.log('✅ Verification code found:', verificationCode);
    
    // Step 3: Test phone verification
    console.log('\n3️⃣  Testing phone verification...');
    const verifyResponse = await fetch(`${baseUrl}/api/auth?action=verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId, 
        verification_code: verificationCode 
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verify response:', verifyData);
    
    if (!verifyData.success) {
      console.error('❌ Phone verification failed:', verifyData.error);
      return;
    }
    
    const sessionToken = verifyData.session_token;
    console.log('✅ Phone verification successful, session:', sessionToken);
    
    // Step 4: Test complete profile
    console.log('\n4️⃣  Testing complete profile...');
    const completeResponse = await fetch(`${baseUrl}/api/auth?action=complete-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      })
    });
    
    const completeData = await completeResponse.json();
    console.log('Complete profile response:', completeData);
    
    if (!completeData.success) {
      console.error('❌ Complete profile failed:', completeData.error);
      return;
    }
    
    console.log('✅ Profile completion successful!');
    
    // Step 5: Test login with new credentials
    console.log('\n5️⃣  Testing login with new credentials...');
    const loginResponse = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testPhone,
        password: 'TestPassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('\n🎉 Full registration flow completed successfully!');
    
    // Cleanup: Delete test user
    console.log('\n🧹 Cleaning up test user...');
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Check if we have a local server running
async function checkLocalServer() {
  try {
    const response = await fetch('http://localhost:3000/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const hasLocalServer = await checkLocalServer();
  
  if (!hasLocalServer) {
    console.log('❌ Local server not running. Please start with: npm start');
    return;
  }
  
  await testRegistrationFlow();
}

main().catch(console.error);
