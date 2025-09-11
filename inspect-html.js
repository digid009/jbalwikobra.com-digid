// 🔍 DETAILED HTML INSPECTION TEST
const fetch = require('node-fetch');

async function inspectHTML() {
  console.log('🔍 DETAILED HTML INSPECTION');
  console.log('=' .repeat(40));

  try {
    const response = await fetch('https://www.jbalwikobra.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 Mobile Inspector' }
    });
    
    const html = await response.text();
    
    console.log('📄 HTML Size:', html.length, 'bytes');
    console.log('📅 Response Headers:');
    console.log('  Cache-Control:', response.headers.get('cache-control'));
    console.log('  Last-Modified:', response.headers.get('last-modified'));
    console.log('  ETag:', response.headers.get('etag'));
    
    // Look for header section
    console.log('\n📌 HEADER ANALYSIS:');
    const headerMatch = html.match(/<header[^>]*>/i);
    if (headerMatch) {
      console.log('✅ Header found:', headerMatch[0]);
    } else {
      console.log('❌ No header element found');
    }
    
    // Look for specific classes
    console.log('\n🔍 CLASS ANALYSIS:');
    const fixedClasses = html.match(/class="[^"]*fixed[^"]*"/g) || [];
    console.log(`Fixed classes found: ${fixedClasses.length}`);
    fixedClasses.slice(0, 3).forEach((cls, i) => {
      console.log(`  ${i + 1}. ${cls}`);
    });
    
    // Look for mobile nav
    console.log('\n📱 MOBILE NAV ANALYSIS:');
    const mobileNavMatch = html.match(/md:hidden[^>]*>/);
    if (mobileNavMatch) {
      console.log('✅ Mobile nav found:', mobileNavMatch[0]);
    } else {
      console.log('❌ No mobile nav found');
    }
    
    // Look for inline styles
    console.log('\n🎨 INLINE STYLE ANALYSIS:');
    const inlineStyles = html.match(/style="[^"]*position[^"]*"/g) || [];
    console.log(`Inline position styles: ${inlineStyles.length}`);
    inlineStyles.forEach((style, i) => {
      console.log(`  ${i + 1}. ${style}`);
    });
    
    // Check for our specific changes
    console.log('\n🔧 SPECIFIC CHANGES CHECK:');
    console.log('w-full class:', html.includes('w-full') ? '✅ Found' : '❌ Missing');
    console.log('z-50 class:', html.includes('z-50') ? '✅ Found' : '❌ Missing');
    console.log('z-[100] class:', html.includes('z-[100]') ? '✅ Found' : '❌ Missing');
    console.log('position: fixed style:', html.includes('position: fixed') ? '✅ Found' : '❌ Missing');
    
    // Extract head section for CSS analysis
    console.log('\n📄 CSS FILES:');
    const cssMatches = html.match(/<link[^>]*\.css[^>]*>/g) || [];
    console.log(`CSS files found: ${cssMatches.length}`);
    cssMatches.forEach((css, i) => {
      console.log(`  ${i + 1}. ${css}`);
    });
    
  } catch (error) {
    console.log(`❌ Inspection Failed: ${error.message}`);
  }
}

// Run the inspection
if (require.main === module) {
  inspectHTML().catch(console.error);
}

module.exports = inspectHTML;
