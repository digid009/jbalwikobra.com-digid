#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testMobileFirst() {
  console.log('🧪 TESTING MOBILE-FIRST IMPLEMENTATION');
  console.log('=====================================\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('📱 MOBILE VIEWPORT (375x667)');
    console.log('=============================');
    
    // Check if page loaded
    const title = await page.title();
    console.log(`✅ Page Title: ${title}`);
    
    // Check for header
    const header = await page.$('header');
    if (header) {
      const headerStyles = await page.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          top: styles.top,
          zIndex: styles.zIndex,
          width: styles.width
        };
      }, header);
      console.log(`✅ Header found - Position: ${headerStyles.position}, Z-Index: ${headerStyles.zIndex}`);
    } else {
      console.log('❌ Header not found');
    }
    
    // Check for mobile bottom nav
    const mobileNav = await page.$('[class*="mobile-bottom-nav"]');
    if (mobileNav) {
      const navStyles = await page.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          bottom: styles.bottom,
          zIndex: styles.zIndex
        };
      }, mobileNav);
      console.log(`✅ Mobile Nav found - Position: ${navStyles.position}, Z-Index: ${navStyles.zIndex}`);
    } else {
      console.log('❌ Mobile Bottom Nav not found');
    }
    
    // Check for iOS classes
    const iosContainer = await page.$('.ios-container');
    console.log(iosContainer ? '✅ iOS Container found' : '❌ iOS Container not found');
    
    // Check for console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000); // Wait for any async loading
    
    if (logs.length > 0) {
      console.log('\n❌ CONSOLE ERRORS:');
      logs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('\n✅ No console errors detected');
    }
    
    // Test desktop viewport
    await page.setViewport({ width: 1200, height: 800 });
    await page.reload({ waitUntil: 'networkidle2' });
    
    console.log('\n💻 DESKTOP VIEWPORT (1200x800)');
    console.log('===============================');
    
    // Check responsive behavior
    const footer = await page.$('footer');
    if (footer) {
      const footerDisplay = await page.evaluate((el) => {
        return window.getComputedStyle(el).display;
      }, footer);
      console.log(`✅ Footer display on desktop: ${footerDisplay}`);
    }
    
    console.log('\n🎉 Mobile-first testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testMobileFirst().catch(console.error);
