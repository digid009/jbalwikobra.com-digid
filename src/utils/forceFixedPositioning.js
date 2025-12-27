// Force fixed positioning for mobile navigation - AGGRESSIVE VERSION
export const forceFixedPositioning = () => {
  // Only run on mobile devices
  if (window.innerWidth > 768) return;
  
  const aggressiveFixPositioning = () => {
    // Create CSS style if it doesn't exist
    let styleEl = document.getElementById('aggressive-mobile-fix');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'aggressive-mobile-fix';
      styleEl.innerHTML = `
        /* AGGRESSIVE MOBILE NAVIGATION FIXES */
        @media screen and (max-width: 768px) {
          header, header[data-fixed="header"], .force-fixed-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 99999 !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            will-change: transform !important;
            backface-visibility: hidden !important;
            -webkit-backface-visibility: hidden !important;
          }
          
          [data-fixed="bottom-nav"], .mobile-bottom-nav-fixed, .force-fixed-bottom {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 99998 !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            will-change: transform !important;
            backface-visibility: hidden !important;
            -webkit-backface-visibility: hidden !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Fix header with inline styles (highest priority)
    const headers = document.querySelectorAll('header, [data-fixed="header"]');
    headers.forEach(header => {
      if (header) {
        header.style.setProperty('position', 'fixed', 'important');
        header.style.setProperty('top', '0', 'important');
        header.style.setProperty('left', '0', 'important');
        header.style.setProperty('right', '0', 'important');
        header.style.setProperty('width', '100%', 'important');
        header.style.setProperty('z-index', '99999', 'important');
        header.style.setProperty('transform', 'translateZ(0)', 'important');
        header.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
        header.style.setProperty('will-change', 'transform', 'important');
        header.style.setProperty('backface-visibility', 'hidden', 'important');
        header.style.setProperty('-webkit-backface-visibility', 'hidden', 'important');
      }
    });
    
    // Fix bottom navigation with inline styles (highest priority)
    const bottomNavs = document.querySelectorAll('[data-fixed="bottom-nav"], .mobile-bottom-nav-fixed, .force-fixed-bottom');
    bottomNavs.forEach(bottomNav => {
      if (bottomNav) {
        bottomNav.style.setProperty('position', 'fixed', 'important');
        bottomNav.style.setProperty('bottom', '0', 'important');
        bottomNav.style.setProperty('left', '0', 'important');
        bottomNav.style.setProperty('right', '0', 'important');
        bottomNav.style.setProperty('width', '100%', 'important');
        bottomNav.style.setProperty('z-index', '99998', 'important');
        bottomNav.style.setProperty('transform', 'translateZ(0)', 'important');
        bottomNav.style.setProperty('-webkit-transform', 'translateZ(0)', 'important');
        bottomNav.style.setProperty('will-change', 'transform', 'important');
        bottomNav.style.setProperty('backface-visibility', 'hidden', 'important');
        bottomNav.style.setProperty('-webkit-backface-visibility', 'hidden', 'important');
      }
    });
  };
  
  // Apply fixes immediately and repeatedly
  aggressiveFixPositioning();
  
  // Fix on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aggressiveFixPositioning);
  }
  
  // Fix on window load
  window.addEventListener('load', aggressiveFixPositioning);
  
  // Fix on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(aggressiveFixPositioning, 50);
  });
  
  // Fix on scroll (for stubborn mobile browsers)
  let scrolling = false;
  window.addEventListener('scroll', () => {
    if (!scrolling) {
      scrolling = true;
      requestAnimationFrame(() => {
        aggressiveFixPositioning();
        scrolling = false;
      });
    }
  }, { passive: true });
  
  // Fix with mutation observer to catch dynamic changes
  if ('MutationObserver' in window) {
    const observer = new MutationObserver(() => {
      aggressiveFixPositioning();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
  
  // Continuous checking for persistent browsers
  setInterval(aggressiveFixPositioning, 1000);
};

// Auto-initialize
if (typeof window !== 'undefined') {
  forceFixedPositioning();
}
