// Local dev smoke test for port 3000
const fetch = require('node-fetch');

async function testLocal() {
  const url = 'http://localhost:3000';
  console.log('🔍 Testing local dev server:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    console.log('Status:', res.status, res.statusText);
    const html = await res.text();
    console.log('HTML length:', html.length);

    const cssMatch = html.match(/static\/css\/[^"]+\.css/);
    const jsMatch = html.match(/static\/js\/[^"]+\.js/);

    if (cssMatch) {
      const cssUrl = `${url}/${cssMatch[0]}`;
      const cssRes = await fetch(cssUrl);
      const css = await cssRes.text();
      console.log('CSS length:', css.length);
      const checks = {
        'Fixed header CSS': /position:\s*fixed/.test(css) && /header/.test(css),
        'Bottom nav fixed CSS': /mobile-bottom-nav-fixed/.test(css) || /bottom:\s*0/.test(css),
        'Hardware acceleration': /translate3d\(0, 0, 0\)/.test(css),
        'Mobile spacing': /padding-top/.test(css) && /padding-bottom/.test(css),
      };
      console.log('\n🔧 Mobile CSS checks:');
      for (const [k, v] of Object.entries(checks)) console.log(v ? `✅ ${k}` : `❌ ${k}`);
    }

    if (jsMatch) {
      const jsUrl = `${url}/${jsMatch[0]}`;
      const jsRes = await fetch(jsUrl);
      console.log('JS status:', jsRes.status);
    }

    console.log('\n🔗 Probing key app routes (client-rendered):');
    const routes = ['/', '/feed', '/products', '/sell', '/profile'];
    for (const path of routes) {
      try {
        const r = await fetch(`${url}${path}`, { redirect: 'manual' });
        console.log(`${path}:`, r.status);
      } catch (e) {
        console.log(`${path}: error ${e.message}`);
      }
    }

    console.log('\n📡 Checking typical dev API proxies (optional)');
    const apis = ['/api/auth/check', '/api/banner', '/api/feed'];
    for (const api of apis) {
      try {
        const r = await fetch(`${url}${api}`);
        console.log(`${api}: ${r.status}`);
      } catch (e) {
        console.log(`${api}: error ${e.message}`);
      }
    }
  } catch (e) {
    console.log('❌ Local test failed:', e.message);
  }
}

if (require.main === module) testLocal();
