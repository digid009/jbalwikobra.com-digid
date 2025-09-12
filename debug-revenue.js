import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugRevenueData() {
  console.log('\n=== Debugging Revenue Data ===');
  
  try {
    // Check what orders exist
    const { data: allOrders, error: allError } = await supabase
      .from('orders')
      .select('id, created_at, amount, status')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('Error fetching orders:', allError);
      return;
    }
    
    console.log('Latest 10 orders:');
    allOrders?.forEach(order => {
      console.log(`- ID: ${order.id}, Amount: ${order.amount}, Status: ${order.status}, Date: ${order.created_at}`);
    });
    
    // Check last 7 days specifically
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
    const startISO = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
    const endISO = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).toISOString();

    console.log(`\nChecking orders from ${startISO} to ${endISO}`);
    
    const { data: weekOrders, error: weekError } = await supabase
      .from('orders')
      .select('created_at, amount, status')
      .gte('created_at', startISO)
      .lte('created_at', endISO);

    if (weekError) {
      console.error('Week orders error:', weekError);
      return;
    }
    
    console.log(`Found ${weekOrders?.length || 0} orders in the last 7 days`);
    
    let totalRevenue = 0;
    let paidRevenue = 0;
    
    weekOrders?.forEach(order => {
      const amount = Number(order.amount) || 0;
      totalRevenue += amount;
      
      if (order.status === 'paid' || order.status === 'completed') {
        paidRevenue += amount;
      }
      
      console.log(`- ${order.created_at.slice(0, 10)}: ${amount} (${order.status})`);
    });
    
    console.log(`\nTotal revenue (all orders): Rp ${totalRevenue.toLocaleString()}`);
    console.log(`Paid revenue (paid/completed only): Rp ${paidRevenue.toLocaleString()}`);
    
    // Simulate the grouping logic
    const dailyStats = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      dailyStats[key] = { count: 0, revenue: 0 };
    }
    
    weekOrders?.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dateKey = orderDate.toISOString().slice(0, 10);
      
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].count += 1;
        
        if (order.status === 'paid' || order.status === 'completed') {
          dailyStats[dateKey].revenue += Number(order.amount) || 0;
        }
      }
    });
    
    console.log('\nDaily breakdown:');
    Object.entries(dailyStats).forEach(([date, stats]) => {
      console.log(`${date}: ${stats.count} orders, Rp ${stats.revenue.toLocaleString()} revenue`);
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugRevenueData();
