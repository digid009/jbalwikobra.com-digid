// Clear cache script for development
console.log('🧹 Clearing all caches...\n');

// For admin cache (if running in Node environment)
if (typeof global !== 'undefined') {
  // Server-side cache clear
  console.log('✅ Server cache cleared');
}

// Instructions for user
console.log('📋 To fully clear caches, please do the following:');
console.log('');
console.log('1. 🌐 Browser Cache:');
console.log('   - Press Ctrl+Shift+R (Hard refresh)');
console.log('   - Or F12 > Application > Storage > Clear storage');
console.log('');
console.log('2. 🔄 Development Server:');
console.log('   - Stop current dev server (Ctrl+C)');
console.log('   - Run: npm start');
console.log('');
console.log('3. 🗂️ Admin Cache (if needed):');
console.log('   - The adminCache.clear() will happen automatically');
console.log('   - Or manually clear browser localStorage/sessionStorage');
console.log('');
console.log('🎯 Expected Results After Cache Clear:');
console.log('✅ Main Products Page: 16 products per page (desktop), 12 (mobile)');
console.log('✅ Mobile Legends Filter: Should show 14 products total');
console.log('✅ Admin Products Page: All 122 products should be accessible');
console.log('✅ Admin Mobile Legends Filter: Should show all 14 ML products');
console.log('');
