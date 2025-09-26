// Dev-only mock endpoints for CRA dev server
// This allows testing Admin WhatsApp Settings locally without Vercel serverless
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // In development, register mock endpoints for /api/admin-whatsapp and /api/admin with real DB
  if (process.env.NODE_ENV !== 'production') {
    // Import Supabase client for real database operations in development
    let supabase = null;
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      console.log('🔧 setupProxy: Supabase config check', {
        url: supabaseUrl ? 'LOADED' : 'MISSING',
        key: supabaseServiceKey ? 'LOADED' : 'MISSING'
      });
      
      if (supabaseUrl && supabaseServiceKey) {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log('✅ setupProxy: Supabase client created successfully');
      } else {
        console.warn('⚠️ setupProxy: Missing Supabase configuration');
      }
    } catch (error) {
      console.error('❌ setupProxy: Failed to create Supabase client:', error.message);
    }

    // Real admin API endpoint with database operations
    app.get('/api/admin', async (req, res) => {
      console.log('🚀 setupProxy: GET /api/admin called with query:', req.query);
      const action = req.query.action;
      
      if (action === 'settings') {
        console.log('🔧 Dev Admin API: GET settings (real DB)');
        
        if (!supabase) {
          res.setHeader('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({ error: 'database_unavailable' }));
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('website_settings')
            .select('*')
            .single();
            
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Dev Admin API: Settings fetch error', error);
            res.setHeader('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({ error: 'fetch_failed', details: error.message }));
            return;
          }
          
          console.log('✅ Dev Admin API: Settings fetched from real DB', data ? 'Found data' : 'No data');
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify({ data: data || {} }));
        } catch (e) {
          console.error('❌ Dev Admin API: Settings fetch failed', e);
          res.setHeader('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({ error: 'settings_fetch_failed', message: e.message }));
        }
        return;
      }
      
      // Default response for other actions
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({ error: 'unsupported_action', action }));
    });

    app.post('/api/admin', async (req, res) => {
      console.log('🚀 setupProxy: POST /api/admin called with query:', req.query);
      const action = req.query.action;
      
      if (action === 'update-settings') {
        console.log('🔧 Dev Admin API: POST settings update (real DB)');
        
        if (!supabase) {
          res.setHeader('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({ error: 'database_unavailable' }));
          return;
        }
        
        let buf = '';
        req.on('data', (chunk) => (buf += chunk));
        req.on('end', async () => {
          try {
            const settingsData = buf ? JSON.parse(buf) : {};
            console.log('� Dev Admin API: Updating website settings', settingsData);
            
            // Get current settings first
            const { data: current } = await supabase
              .from('website_settings')
              .select('*')
              .single();
              
            if (current) {
              // Update existing settings
              const { data, error } = await supabase
                .from('website_settings')
                .update(settingsData)
                .eq('id', current.id)
                .select()
                .single();
                
              if (error) {
                console.error('❌ Dev Admin API: Settings update error', error);
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({ error: 'update_failed', details: error.message }));
                return;
              }
              
              console.log('✅ Dev Admin API: Settings updated successfully in real DB');
              res.setHeader('Content-Type', 'application/json');
              res.status(200).send(JSON.stringify({ success: true, data }));
            } else {
              // Create new settings record
              const { data, error } = await supabase
                .from('website_settings')
                .insert(settingsData)
                .select()
                .single();
                
              if (error) {
                console.error('❌ Dev Admin API: Settings insert error', error);
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({ error: 'insert_failed', details: error.message }));
                return;
              }
              
              console.log('✅ Dev Admin API: Settings created successfully in real DB');
              res.setHeader('Content-Type', 'application/json');
              res.status(200).send(JSON.stringify({ success: true, data }));
            }
          } catch (e) {
            console.error('❌ Dev Admin API: Settings operation failed', e);
            res.setHeader('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({ error: 'settings_operation_failed', message: e.message }));
          }
        });
        return;
      }
      
      // Default response for other actions
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify({ error: 'unsupported_action', action }));
    });

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
        // Skip proxy for Xendit and admin API calls - let them be handled by local Vercel functions or mocks
        skip: function (req) {
          const shouldSkip = req.url.startsWith('/api/xendit') || req.url.startsWith('/api/admin');
          console.log('🔍 Proxy skip check:', {
            url: req.url,
            shouldSkip: shouldSkip,
            startsWithAdmin: req.url.startsWith('/api/admin'),
            startsWithXendit: req.url.startsWith('/api/xendit')
          });
          return shouldSkip;
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