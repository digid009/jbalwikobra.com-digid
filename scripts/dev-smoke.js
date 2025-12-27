const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.TEST_URL || 'http://127.0.0.1:3007';
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=390,844'
    ]
  });
  const page = await browser.newPage();
  const consoleMessages = [];
  const requests = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), failure: req.failure() });
  });
  page.on('requestfinished', (req) => {
    requests.push({ url: req.url(), method: req.method() });
  });

  try {
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile Safari/605.1.15');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Give app time to hydrate and render
    await page.waitForTimeout(2000);

    // Evaluate header and bottom nav positions before and after scroll
    const result = await page.evaluate(() => {
      function getInfo() {
        const header = document.querySelector('header');
        const bottomNav = document.querySelector('.mobile-bottom-nav-fixed') || document.querySelector('nav[role="navigation"], nav');
        const headerRect = header ? header.getBoundingClientRect() : null;
        const bottomRect = bottomNav ? bottomNav.getBoundingClientRect() : null;

        const headerStyle = header ? window.getComputedStyle(header) : null;
        const bottomStyle = bottomNav ? window.getComputedStyle(bottomNav) : null;

        return {
          header: header ? {
            position: headerStyle.position,
            top: headerRect.top,
            bottom: headerRect.bottom,
            height: headerRect.height,
            zIndex: headerStyle.zIndex
          } : null,
          bottomNav: bottomNav ? {
            position: bottomStyle.position,
            top: bottomRect.top,
            bottom: bottomRect.bottom,
            height: bottomRect.height,
            zIndex: bottomStyle.zIndex
          } : null,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          scrollY: window.scrollY
        };
      }

      const before = getInfo();
      window.scrollTo({ top: 1200, behavior: 'instant' });
      return { before, after: getInfo() };
    });

    const checks = [];

    if (result.before.header && result.after.header) {
      const headerFixed = result.before.header.position === 'fixed' && Math.abs(result.after.header.top - 0) < 2;
      checks.push({ name: 'Header fixed at top', pass: headerFixed, details: result.after.header });
    } else {
      checks.push({ name: 'Header present', pass: false, details: result });
    }

    if (result.before.bottomNav && result.after.bottomNav) {
      const bottomFixed = result.before.bottomNav.position === 'fixed' && Math.abs(result.after.bottomNav.bottom - result.after.viewport.h) < 4;
      checks.push({ name: 'Bottom nav fixed at bottom', pass: bottomFixed, details: result.after.bottomNav });
    } else {
      checks.push({ name: 'Bottom nav present', pass: false, details: result });
    }

    // Output results
    console.log('=== MOBILE LAYOUT CHECKS ===');
    for (const c of checks) {
      console.log(`${c.pass ? 'PASS' : 'FAIL'} - ${c.name}`);
      if (!c.pass) console.log('Details:', c.details);
    }

    // Summarize console errors
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warns = consoleMessages.filter(m => m.type === 'warning');
    console.log('\n=== BROWSER CONSOLE ===');
    console.log(`Errors: ${errors.length}, Warnings: ${warns.length}, Total: ${consoleMessages.length}`);
    if (errors.length) {
      errors.slice(0, 10).forEach((e, i) => console.log(`#${i+1} ERROR:`, e.text));
    }

    // Network failures summary
    console.log('\n=== NETWORK FAILURES ===');
    console.log(`Failed requests: ${failedRequests.length}`);
    failedRequests.slice(0, 10).forEach((r, i) => console.log(`#${i+1} FAIL:`, r.url, r.failure && r.failure.errorText));

  } catch (e) {
    console.error('Smoke test failed:', e.message);
  } finally {
    await browser.close();
  }
})();
