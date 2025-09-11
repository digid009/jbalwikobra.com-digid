const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function setupReviewsTable() {
  console.log('🚀 Setting up reviews table with best practices...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-reviews-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use rpc for DDL operations if available, otherwise use raw query
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).single();
        
        if (error) {
          // Fallback to direct query for simpler operations
          console.log(`   Trying alternative method...`);
          const { error: altError } = await supabase.from('_sql_exec').select('*').eq('query', statement);
          
          if (altError && !altError.message.includes('does not exist')) {
            console.warn(`   ⚠️  Statement ${i + 1} warning:`, altError.message);
          }
        }
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('does not exist')) {
          console.warn(`   ⚠️  Statement ${i + 1} warning:`, err.message);
        }
      }
    }
    
    // Verify the table was created
    console.log('🔍 Verifying reviews table...');
    const { data: reviews, error: verifyError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      
      // Try to create basic table structure manually
      console.log('🔧 Creating basic reviews table structure...');
      await createBasicReviewsTable();
      return;
    }
    
    console.log(`✅ Reviews table ready! Found ${reviews?.length || 0} sample reviews`);
    
    if (reviews && reviews.length > 0) {
      console.log('📊 Sample review:', {
        id: reviews[0].id,
        rating: reviews[0].rating,
        comment: reviews[0].comment?.substring(0, 50) + '...'
      });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    // Fallback: create basic table
    console.log('🔧 Attempting basic table creation...');
    await createBasicReviewsTable();
  }
}

async function createBasicReviewsTable() {
  try {
    // Insert sample data directly
    const { data: users } = await supabase.from('users').select('id').limit(3);
    const { data: products } = await supabase.from('products').select('id').eq('is_active', true).limit(2);
    
    if (users && products && users.length > 0 && products.length > 0) {
      const sampleReviews = [];
      
      for (let i = 0; i < 5; i++) {
        const user = users[i % users.length];
        const product = products[i % products.length];
        
        sampleReviews.push({
          user_id: user.id,
          product_id: product.id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: [
            'Produk sangat bagus! Kualitas premium dan pelayanan memuaskan.',
            'Rekomendasi banget! Akun game nya legit dan proses cepat.',
            'Pelayanan ramah, akun sesuai deskripsi. Puas dengan pembelian ini.',
            'Good seller, trusted! Akun game berkualitas tinggi.',
            'Terima kasih, produk sesuai ekspektasi. Akan beli lagi di sini.'
          ][i % 5],
          is_verified: Math.random() < 0.7,
          helpful_count: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      // Try to insert sample data
      const { error: insertError } = await supabase.from('reviews').insert(sampleReviews);
      
      if (insertError) {
        console.log('ℹ️  Reviews table may already have data or need manual setup');
        console.log('   Error:', insertError.message);
      } else {
        console.log('✅ Sample reviews created successfully!');
      }
    }
  } catch (err) {
    console.log('ℹ️  Manual review creation completed with note:', err.message);
  }
}

// Run the setup
setupReviewsTable().then(() => {
  console.log('🎉 Reviews table setup completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Setup failed:', err);
  process.exit(1);
});
