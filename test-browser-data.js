const puppeteer = require('puppeteer');

async function testWebsiteWithBrowser() {
  console.log('🌐 Testing www.jbalwikobra.com with Browser Automation');
  console.log('=' .repeat(60));
  
  let browser;
  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Test Homepage
    console.log('\n📍 Testing Homepage...');
    await page.goto('https://www.jbalwikobra.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for products
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.product-card, [data-testid="product"], .product-item');
      const products = [];
      
      productElements.forEach(element => {
        const nameElement = element.querySelector('h3, .product-title, .product-name');
        const priceElement = element.querySelector('.price, .product-price');
        
        if (nameElement) {
          products.push({
            name: nameElement.textContent.trim(),
            price: priceElement ? priceElement.textContent.trim() : 'No price',
            hasImage: !!element.querySelector('img')
          });
        }
      });
      
      return products;
    });
    
    console.log(`📦 Found ${products.length} products on homepage`);
    if (products.length > 0) {
      console.log('🎮 Sample products:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price}`);
      });
    }
    
    // Check for loading states or errors
    const pageContent = await page.content();
    const hasLoadingElements = await page.evaluate(() => {
      return document.querySelectorAll('.loading, .skeleton, .spinner').length > 0;
    });
    
    const hasErrors = pageContent.includes('error') || pageContent.includes('Error') || 
                     pageContent.includes('failed') || pageContent.includes('Failed');
    
    console.log(`⏳ Loading states: ${hasLoadingElements ? 'Present' : 'None'}`);
    console.log(`❌ Errors detected: ${hasErrors ? 'Yes' : 'No'}`);
    
    // Test Products Page
    console.log('\n📍 Testing Products Page...');
    await page.goto('https://www.jbalwikobra.com/products', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const allProducts = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.product-card, [data-testid="product"], .product-item');
      return productElements.length;
    });
    
    console.log(`📦 Found ${allProducts} products on products page`);
    
    // Check for specific gaming products
    const gamingProducts = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      const gamingKeywords = ['free fire', 'mobile legend', 'pubg', 'genshin', 'valorant'];
      return gamingKeywords.filter(keyword => text.includes(keyword));
    });
    
    console.log(`🎮 Gaming products detected: ${gamingProducts.join(', ') || 'None'}`);
    
    // Test console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload to catch console errors
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    console.log(`🔍 Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:');
      consoleErrors.slice(0, 3).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 100)}...`);
      });
    }
    
    // Test network requests
    const networkRequests = [];
    page.on('response', response => {
      if (response.url().includes('api/') || response.url().includes('supabase')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    // Trigger some interactions to test API calls
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    console.log(`🌐 API requests detected: ${networkRequests.length}`);
    if (networkRequests.length > 0) {
      console.log('📡 API calls:');
      networkRequests.slice(0, 5).forEach((req, index) => {
        const status = req.ok ? '✅' : '❌';
        console.log(`   ${status} ${req.status} - ${req.url.substring(0, 60)}...`);
      });
    }
    
    // Summary
    console.log('\n📊 BROWSER TEST SUMMARY');
    console.log('=' .repeat(40));
    console.log(`🏠 Homepage products: ${products.length}`);
    console.log(`📦 Products page items: ${allProducts}`);
    console.log(`🎮 Gaming content: ${gamingProducts.length > 0 ? 'Found' : 'Missing'}`);
    console.log(`⏳ Loading states: ${hasLoadingElements ? 'Active' : 'Complete'}`);
    console.log(`❌ Console errors: ${consoleErrors.length}`);
    console.log(`📡 API requests: ${networkRequests.length}`);
    
    // Final assessment
    const isDataLoaded = products.length > 0 || allProducts > 0;
    const hasGameContent = gamingProducts.length > 0;
    const noMajorErrors = consoleErrors.length < 5;
    
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log(`📊 Data Loading: ${isDataLoaded ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🎮 Gaming Content: ${hasGameContent ? '✅ FOUND' : '⚠️ LIMITED'}`);
    console.log(`🔧 Technical Health: ${noMajorErrors ? '✅ GOOD' : '⚠️ ISSUES'}`);
    
    if (isDataLoaded && hasGameContent && noMajorErrors) {
      console.log('\n🎉 OVERALL STATUS: EXCELLENT - Website is working properly with real data!');
    } else if (isDataLoaded) {
      console.log('\n✅ OVERALL STATUS: GOOD - Website is loading data but may need content updates');
    } else {
      console.log('\n❌ OVERALL STATUS: NEEDS ATTENTION - Data loading issues detected');
    }
    
  } catch (error) {
    console.log(`❌ Browser test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
const fs = require('fs');
const path = require('path');

const puppeteerPath = path.join(__dirname, 'node_modules', 'puppeteer');
if (!fs.existsSync(puppeteerPath)) {
  console.log('⚠️ Puppeteer not installed. Installing...');
  console.log('Run: npm install puppeteer --save-dev');
  console.log('');
  console.log('🔄 Alternative: Manual browser testing');
  console.log('1. Open https://www.jbalwikobra.com in your browser');
  console.log('2. Check if products are loading');
  console.log('3. Open Developer Tools and check for errors');
  console.log('4. Navigate to different pages and verify data');
} else {
  testWebsiteWithBrowser().catch(console.error);
}
