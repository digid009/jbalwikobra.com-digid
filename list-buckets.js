// List available storage buckets
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xeithuvgldzxnggxadri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ');

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Available buckets:');
    data?.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  }
}
listBuckets();
