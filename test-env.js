// Test Environment Variables for Local Development
// Run: node test-env.js

console.log('🔍 Testing Environment Variables...\n');

// Test required environment variables
const requiredVars = [
  'XENDIT_SECRET_KEY',
  'SUPABASE_URL', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allValid = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allValid = false;
  }
});

console.log('\n📋 Summary:');
if (allValid) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Your local development environment should work for payment testing.');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('📝 Please create a .env.local file with the missing variables.');
  console.log('📖 See LOCAL_DEVELOPMENT_SETUP.md for detailed instructions.');
}

console.log('\n🔗 Next Steps:');
console.log('1. Get your Xendit development keys from https://dashboard.xendit.co/');
console.log('2. Create .env.local file with real values');
console.log('3. Restart your development server: npm start');
console.log('4. Test rental payment flow');
