// Dev-only mock endpoints for CRA dev server
// This allows testing Admin WhatsApp Settings locally without Vercel serverless
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // In development, register mock endpoints for /api/admin-whatsapp
  if (process.env.NODE_ENV !== 'production') {
    // In-memory mock provider
    const provider = {
      id: 'dev-mock',
      name: 'dev-mock',
      display_name: 'Dev Mock Provider',
      settings: { default_group_id: 'DEV-GROUP-ID' },
    };

    app.get('/api/admin-whatsapp', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(provider));
    });

    const handleWrite = (req, res) => {
      let buf = '';
      req.on('data', (chunk) => (buf += chunk));
      req.on('end', () => {
        try {
          const body = buf ? JSON.parse(buf) : {};
          if (body && typeof body === 'object') {
            const { default_group_id, settings } = body;
            if (default_group_id !== undefined) {
              provider.settings.default_group_id = default_group_id || null;
            }
            if (settings && typeof settings === 'object') {
              Object.assign(provider.settings, settings);
            }
          }
        } catch {}
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ success: true, provider, dev: true }));
      });
    };

    app.post('/api/admin-whatsapp', handleWrite);
    app.put('/api/admin-whatsapp', handleWrite);

    // Mock list groups endpoint for local dev
    app.get('/api/admin-whatsapp-groups', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({
        dev: true,
        groups: [
          { id: '120363421819020887@g.us', name: 'ORDERAN WEBSITE' },
          { id: '120363421819020999@g.us', name: 'OPS SUPPORT' },
          { id: '120363421819021234@g.us', name: 'MARKETING' }
        ]
      }));
    });

    // Minimal mock for webhook test send used by AdminWhatsAppSettings
    app.post('/api/xendit/webhook', (req, res) => {
      if (req.url.includes('testGroupSend')) {
        let buf = '';
        req.on('data', (chunk) => (buf += chunk));
        req.on('end', () => {
          let body = {};
          try { body = buf ? JSON.parse(buf) : {}; } catch {}
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify({ success: true, dev: true, echo: body }));
        });
      } else {
        res.status(204).end();
      }
    });
  }

  // Attach Supabase REST proxy if env is configured
  if (process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: process.env.REACT_APP_SUPABASE_URL,
        changeOrigin: true,
        // Skip proxy for Xendit API calls - let them be handled by local Vercel functions or mocks
        skip: function (req) {
          return req.url.startsWith('/api/xendit');
        },
        pathRewrite: (path) => {
          // 1. Remove /api prefix
          const newPath = path.replace('/api', '');

          // 2. Handle special auth routes
          if (newPath.startsWith('/auth')) {
            // e.g., /api/auth/check -> /auth/v1/user
            return newPath.replace('/auth/check', '/auth/v1/user');
          }

          // 3. Handle specific routes for banner and feed with proper table names
          if (newPath === '/banner') {
            console.log('[Proxy] Banner rewrite: /api/banner -> /rest/v1/banners');
            return '/rest/v1/banners';
          }

          if (newPath === '/posts' || newPath === '/feed') {
            console.log('[Proxy] Feed rewrite: /api/posts or /api/feed -> /rest/v1/feed_posts');
            return '/rest/v1/feed_posts';
          }

          // Products
          if (newPath === '/products') {
            console.log('[Proxy] Products rewrite: /api/products -> /rest/v1/products');
            return '/rest/v1/products';
          }

          // 4. Handle standard Supabase REST routes
          console.log(`[Proxy] Default rewrite: /api${newPath} -> /rest/v1${newPath}`);
          return `/rest/v1${newPath}`;
        },
        onProxyReq: (proxyReq, req) => {
          // Supabase requires an API key for all requests
          proxyReq.setHeader('apikey', process.env.REACT_APP_SUPABASE_ANON_KEY);
          proxyReq.setHeader('Authorization', `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`);
          console.log(`[Proxy] Rewriting ${req.url} to ${proxyReq.path}`);
        },
        headers: {
          apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        logLevel: 'debug',
      })
    );
  } else {
    console.warn('[Proxy] REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY not set - Supabase proxy disabled');
  }
};