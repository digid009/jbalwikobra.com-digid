// Quick fix script for dashboard data
console.log('🔧 DASHBOARD DATA FIX');
console.log('====================');

// Clear all caches
localStorage.clear();
sessionStorage.clear();

// Clear service worker cache if it exists
if ('serviceWorker' in navigator) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

console.log('✅ All caches cleared!');
console.log('💡 Now refresh the page (F5) to see correct data:');
console.log('   - Total Orders: 178');
console.log('   - Total Users: 47'); 
console.log('   - Total Products: 124');
console.log('   - Total Revenue: Rp 24,350,360');
console.log('   - Completed Orders: 20');
console.log('   - Pending Orders: 47');

// Force a hard reload
setTimeout(() => {
  location.reload(true);
}, 1000);
