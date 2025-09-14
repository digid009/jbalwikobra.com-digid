// Simple test untuk mengecek endpoint yang tersedia
const axios = require('axios');

async function testBasicEndpoints() {
  console.log('🔍 Testing basic endpoints...\n');
  
  const endpoints = [
    '/',
    '/api/health',
    '/api/admin',
    '/api/admin?action=dashboard',
    '/api/admin?action=products',
    '/api/diagnostics'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: http://localhost:3000${endpoint}`);
      const response = await axios.get(`http://localhost:3000${endpoint}`, {
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // Accept any status < 500
        }
      });
      
      console.log(`   ✅ ${response.status} - ${response.statusText}`);
      if (response.data && typeof response.data === 'object') {
        const keys = Object.keys(response.data);
        console.log(`   📄 Data keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    }
    console.log('');
  }
}

testBasicEndpoints().catch(console.error);
