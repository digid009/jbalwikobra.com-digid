#!/usr/bin/env node
/**
 * Script to verify and fix admin status for admin@jbalwikobra.com
 * 
 * This script:
 * 1. Checks if admin@jbalwikobra.com exists in the database
 * 2. Shows current is_admin status
 * 3. Updates is_admin to true if needed
 * 4. Verifies the update
 * 
 * Usage:
 *   ADMIN_EMAIL=admin@example.com node scripts/fix-admin-status.js
 */

const { createClient } = require('@supabase/supabase-js');

async function main() {
  // Use service role key for admin operations
  // Priority: SUPABASE_URL > REACT_APP_SUPABASE_URL (for dev convenience)
  // Priority: SUPABASE_SERVICE_ROLE_KEY > SUPABASE_SERVICE_KEY
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !serviceKey) {
    console.error('[fix-admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.error('[fix-admin] Please set these environment variables and try again');
    process.exit(2);
  }

  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const adminEmail = 'admin@jbalwikobra.com';
  const log = (...args) => console.log('[fix-admin]', ...args);

  try {
    log('Checking connectivity...');
    const { error: pingErr } = await supabase.from('users').select('id').limit(1);
    if (pingErr) throw pingErr;
    log('Connectivity OK');

    // Check if admin user exists
    log(`Looking for user with email: ${adminEmail}`);
    const { data: users, error: selectErr } = await supabase
      .from('users')
      .select('id, email, name, is_admin, phone, created_at')
      .eq('email', adminEmail);

    if (selectErr) {
      throw selectErr;
    }

    if (!users || users.length === 0) {
      log('❌ Admin user not found in database!');
      log('Please create a user account with email:', adminEmail);
      process.exit(1);
    }

    const user = users[0];
    log('✅ Found user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      phone: user.phone
    });

    // Check if already admin
    if (user.is_admin === true) {
      log('✅ User is already set as admin. No changes needed.');
      log('');
      log('If you\'re still having issues accessing admin panel:');
      log('1. Try logging out and logging back in');
      log('2. Clear browser localStorage');
      log('3. Check browser console for any errors');
      return;
    }

    // Update to admin
    log('⚙️  Setting is_admin = true for', adminEmail);
    const { data: updated, error: updateErr } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('email', adminEmail)
      .select();

    if (updateErr) {
      throw updateErr;
    }

    log('✅ Successfully updated user to admin!');
    log('Updated user:', updated[0]);
    log('');
    log('✅ Fix complete! Please:');
    log('1. Log out from the application');
    log('2. Clear browser cache/localStorage');
    log('3. Log back in with', adminEmail);
    log('4. You should now have admin access');

  } catch (e) {
    console.error('[fix-admin] FAILED:', {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    });
    process.exit(1);
  }
}

main();
