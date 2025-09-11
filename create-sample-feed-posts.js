const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vudampnwunnpiwyajxrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZGFtcG53dW5ucGl3eWFqeHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Nzk2NDQsImV4cCI6MjA1MzI1NTY0NH0.eL3MYYwjsq8XrT_K8ILlkbjBYrjGxe8WJwLlYvFdRlc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const samplePosts = [
  {
    content: `Check out this amazing website: https://www.example.com 
Also follow me on social media @username and use #tech for more updates!
Contact me at john@example.com or call +62 812-3456-7890`,
    author_name: 'Tech Enthusiast',
    media: null
  },
  {
    content: `Looking for great deals? Visit https://shop.example.com
Price starting from Rp. 150,000 only!
WhatsApp us at +62 821 1234 5678 for more info #sale #discount`,
    author_name: 'Online Store',
    media: null
  },
  {
    content: `New product launch! 🚀
Check our website: https://newproduct.example.com
Email: support@company.com
Follow @company_official for updates
#newlaunch #innovation #technology`,
    author_name: 'Product Team',
    media: null
  },
  {
    content: `Weekend special price Rp 99,000 for premium package!
More info: https://weekend-deals.example.com
Call +62-21-1234567 or mention @customerservice
#weekendspecial #deals`,
    author_name: 'Sales Team',
    media: null
  },
  {
    content: `Join our community at https://community.example.com
Email questions to hello@community.com
Phone support: +62 811 222 333
Tag your friends @friend1 @friend2 with #joinus`,
    author_name: 'Community Manager',
    media: null
  }
];

async function insertSamplePosts() {
  console.log('Inserting sample posts with linkable content...');
  
  try {
    for (const post of samplePosts) {
      const { data, error } = await supabase
        .from('feed_posts')
        .insert([{
          content: post.content,
          author_name: post.author_name,
          media: post.media,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error inserting post:', error);
      } else {
        console.log(`✅ Inserted post by ${post.author_name}`);
      }
    }
    
    console.log('\n🎉 Sample posts inserted successfully!');
    console.log('These posts contain various types of linkable content:');
    console.log('- URLs (https://...)');
    console.log('- Email addresses');  
    console.log('- Phone numbers');
    console.log('- Hashtags (#tag)');
    console.log('- Mentions (@username)');
    console.log('- Price formatting (Rp ...)');
    
  } catch (error) {
    console.error('Failed to insert sample posts:', error);
  }
}

// Run the script
insertSamplePosts().then(() => {
  console.log('Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
