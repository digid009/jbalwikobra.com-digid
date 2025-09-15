// Smart preloader that only preloads resources when they will be used soon
export class SmartPreloader {
  private static preloadedResources = new Set<string>();
  
  // Preload with usage tracking
  static preload(href: string, as: string, options: {
    crossorigin?: string;
    timeout?: number; // Auto-remove if not used within this time (ms)
  } = {}) {
    if (typeof document === 'undefined') return;
    if (this.preloadedResources.has(href)) return;
    
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (options.crossorigin) link.crossOrigin = options.crossorigin;
    
    // Track usage
    let used = false;
    const originalOnLoad = link.onload;
    link.onload = (e) => {
      used = true;
      this.preloadedResources.add(href);
      if (originalOnLoad) originalOnLoad.call(link, e);
    };
    
    // Auto-cleanup if not used within timeout
    const timeout = options.timeout || 10000; // 10 seconds default
    setTimeout(() => {
      if (!used && link.parentNode) {
        console.debug('Removing unused preload:', href);
        link.remove();
      }
    }, timeout);
    
    document.head.appendChild(link);
  }
  
  // Preload route-specific resources only when navigating
  static preloadForRoute(route: string) {
    const routeResources: Record<string, Array<{href: string, as: string}>> = {
      '/products': [
        { href: '/api/products?limit=10', as: 'fetch' }
      ],
      '/flash-sales': [
        { href: '/api/flash-sales', as: 'fetch' }
      ]
    };
    
    const resources = routeResources[route];
    if (resources) {
      resources.forEach(resource => {
        this.preload(resource.href, resource.as, { timeout: 5000 });
      });
    }
  }
  
  // Clean up all unused preloads
  static cleanup() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !this.preloadedResources.has(href)) {
        link.remove();
        console.debug('Cleaned up unused preload:', href);
      }
    });
  }
}
