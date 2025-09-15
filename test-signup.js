// Test signup functionality
async function testSignup() {
  try {
    console.log('Testing signup...');
    
    const testData = {
      phone: '+6282242417799',
      password: 'testpass123'
    };
    
    const response = await fetch('/api/auth?action=signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      return data;
    } else {
      console.log('❌ Signup failed:', data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Signup error:', error);
    return null;
  }
}

// Run the test
testSignup();
