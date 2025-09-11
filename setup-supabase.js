#!/usr/bin/env node

/**
 * Supabase Setup Helper
 * This script helps you configure Supabase credentials properly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupSupabase() {
  console.log('🔧 Supabase Configuration Setup');
  console.log('==================================\n');
  
  console.log('Please get your Supabase credentials from:');
  console.log('https://supabase.com/dashboard → Your Project → Settings → API\n');
  
  try {
    // Get credentials from user
    const projectUrl = await question('📍 Enter your Supabase Project URL (https://xxx.supabase.co): ');
    const anonKey = await question('🔑 Enter your Supabase Anon Key: ');
    const serviceKey = await question('🔐 Enter your Supabase Service Role Key: ');
    
    // Validate inputs
    if (!projectUrl.includes('supabase.co')) {
      console.log('❌ Invalid Project URL format');
      process.exit(1);
    }
    
    if (!anonKey.startsWith('eyJ') || !serviceKey.startsWith('eyJ')) {
      console.log('❌ Invalid key format (should start with eyJ)');
      process.exit(1);
    }
    
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add Supabase variables
    const updates = {
      'REACT_APP_SUPABASE_URL': projectUrl,
      'REACT_APP_SUPABASE_ANON_KEY': anonKey,
      'SUPABASE_URL': projectUrl,
      'SUPABASE_SERVICE_ROLE_KEY': serviceKey
    };
    
    // Update existing variables or add new ones
    let newEnvContent = envContent;
    
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      
      if (newEnvContent.match(regex)) {
        // Update existing
        newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
        console.log(`✅ Updated ${key}`);
      } else {
        // Add new
        newEnvContent += `\n${key}=${value}`;
        console.log(`✅ Added ${key}`);
      }
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, newEnvContent);
    console.log('\n🎉 .env file updated successfully!');
    
    // Test connection
    console.log('\n🔍 Testing connection...');
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(projectUrl, anonKey);
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Connection test result:', error.message);
      if (error.message.includes('not found')) {
        console.log('💡 This might be normal if your database tables aren\'t set up yet');
      }
    } else {
      console.log('✅ Connection test successful!');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Update the same values in Vercel environment variables');
    console.log('2. Redeploy your Vercel application');
    console.log('3. Run: node test-supabase-connection.js');
    console.log('4. Check if your production site shows real data');
    
    console.log('\n🔗 Vercel Dashboard:');
    console.log('https://vercel.com/digitalindo/jbalwikobra-com-digid/settings/environment-variables');
    
  } catch (error) {
    console.log('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupSupabase();
