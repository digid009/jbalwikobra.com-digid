// Quick test script to check admin API endpoints
console.log('🧪 Testing admin API endpoints...');

// Simulate admin login
const testSessionToken = 'test-token-123';
localStorage.setItem('session_token', testSessionToken);

// Test fetching settings
async function testGetSettings() {
  try {
    console.log('📥 Testing GET settings...');
    const response = await fetch('/api/admin?action=settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSessionToken}`
      }
    });
    
    console.log('📊 Response status:', response.status);
    const result = await response.json();
    console.log('📊 Response data:', result);
  } catch (error) {
    console.error('❌ GET settings error:', error);
  }
}

// Test updating settings
async function testUpdateSettings() {
  try {
    console.log('📤 Testing POST settings...');
    const response = await fetch('/api/admin?action=update-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSessionToken}`
      },
      body: JSON.stringify({
        hero_button_url: 'https://example.com/test-button'
      })
    });
    
    console.log('📊 Response status:', response.status);
    const result = await response.json();
    console.log('📊 Response data:', result);
  } catch (error) {
    console.error('❌ POST settings error:', error);
  }
}

// Run tests
testGetSettings();
testUpdateSettings();

console.log('✅ Test script loaded. Check console for results.');
