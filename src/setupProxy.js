const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_SUPABASE_URL,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // 1. Remove /api prefix
        const newPath = path.replace('/api', '');
        
        // 2. Handle special auth routes
        if (newPath.startsWith('/auth')) {
          // e.g., /api/auth/check -> /auth/v1/user
          return newPath.replace('/auth/check', '/auth/v1/user');
        }
        
        // 3. Handle specific routes for banner and feed with proper table names
        // Dari hasil pengecekan, kita tahu tabel-tabel yang benar
        if (newPath === '/banner') {
          console.log('[Proxy] Banner rewrite: /api/banner -> /rest/v1/banners');
          return '/rest/v1/banners';
        }
        
        if (newPath === '/posts' || newPath === '/feed') {
          console.log('[Proxy] Feed rewrite: /api/posts or /api/feed -> /rest/v1/feed_posts');
          return '/rest/v1/feed_posts';
        }
        
        // Tambahan untuk produk
        if (newPath === '/products') {
          console.log('[Proxy] Products rewrite: /api/products -> /rest/v1/products');
          return '/rest/v1/products';
        }

        // 4. Handle standard Supabase REST routes
        // e.g., /api/banner -> /rest/v1/banner
        console.log(`[Proxy] Default rewrite: /api${newPath} -> /rest/v1${newPath}`);
        return `/rest/v1${newPath}`;
      },
      onProxyReq: (proxyReq, req, res) => {
        // Supabase requires an API key for all requests
        proxyReq.setHeader('apikey', process.env.REACT_APP_SUPABASE_ANON_KEY);
        proxyReq.setHeader('Authorization', `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`);
        console.log(`[Proxy] Rewriting ${req.url} to ${proxyReq.path}`);
      },
      headers: {
        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      logLevel: 'debug',
    })
  );
};