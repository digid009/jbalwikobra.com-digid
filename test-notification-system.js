import { supabase } from './src/services/supabase.js';

console.log('🔧 Testing notification system fix...');

async function testNotificationSystem() {
  try {
    // Test database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('notifications')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test if RPC functions exist
    const { data: rpcTest, error: rpcError } = await supabase
      .rpc('get_unread_notification_count', { u_id: '00000000-0000-0000-0000-000000000000' });
    
    if (rpcError) {
      console.warn('⚠️ RPC functions might not exist yet:', rpcError.message);
      console.log('Run the migration SQL to fix this.');
    } else {
      console.log('✅ RPC functions are working');
    }
    
    // Test notification_reads table
    const { data: readsTest, error: readsError } = await supabase
      .from('notification_reads')
      .select('count', { count: 'exact', head: true });
    
    if (readsError) {
      console.warn('⚠️ notification_reads table might not exist:', readsError.message);
    } else {
      console.log('✅ notification_reads table exists');
    }
    
    console.log('\n📋 Summary:');
    console.log('- Database connection: ✅');
    console.log('- Notifications table:', connectionError ? '❌' : '✅');
    console.log('- Notification reads table:', readsError ? '❌' : '✅'); 
    console.log('- RPC functions:', rpcError ? '❌' : '✅');
    
    if (rpcError || readsError) {
      console.log('\n🔧 To fix the issues, run the migration:');
      console.log('1. Copy content from: fix-notifications-schema.sql');
      console.log('2. Run it in your Supabase Dashboard > SQL Editor');
      console.log('3. Or use: npm run db:migrate (if configured)');
    } else {
      console.log('\n🎉 Notification system should work correctly now!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNotificationSystem();
