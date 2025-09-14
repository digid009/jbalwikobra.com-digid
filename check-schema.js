// Check products schema
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xeithuvgldzxnggxadri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ');

async function checkProductsSchema() {
  try {
    console.log('🔍 Checking products table schema...');
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✅ Available columns in products table:');
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]).sort());
      } else {
        console.log('No data in products table to check schema');
        
        // Try to get table info another way
        const { data: products, error: err } = await supabase.from('products').select().range(0, 0);
        if (!err) {
          console.log('Schema check via empty result worked');
        }
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

checkProductsSchema();
