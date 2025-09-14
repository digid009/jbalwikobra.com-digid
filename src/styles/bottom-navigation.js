/* ========================================
   BOTTOM NAVIGATION JAVASCRIPT CONTROLLER
   iOS/Android Style Interactive Navigation
======================================== */

class BottomNavigation {
  constructor(selector = '.bottom-nav') {
    this.nav = document.querySelector(selector);
    this.handle = this.nav?.querySelector('.bottom-nav-handle');
    this.isMinimized = false;
    this.isHorizontalMinimized = false;
    this.swipeStartY = 0;
    this.swipeStartX = 0;
    this.currentY = 0;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    if (!this.nav) return;
    
    this.bindEvents();
    this.setupSwipeGestures();
    this.setupAutoHide();
    this.setupAccessibility();
    
    // Initialize state
    this.updateState();
  }
  
  bindEvents() {
    // Handle click untuk minimize/expand
    if (this.handle) {
      this.handle.addEventListener('click', () => this.toggleMinimize());
    }
    
    // Double tap untuk horizontal minimize
    let tapCount = 0;
    this.nav.addEventListener('click', (e) => {
      tapCount++;
      if (tapCount === 1) {
        setTimeout(() => {
          if (tapCount === 2) {
            this.toggleHorizontalMinimize();
          }
          tapCount = 0;
        }, 300);
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Resize handler
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupSwipeGestures() {
    // Touch events untuk swipe gestures
    this.nav.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.nav.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.nav.addEventListener('touchend', () => this.handleTouchEnd(), { passive: false });
    
    // Mouse events untuk desktop testing
    this.nav.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => this.handleMouseUp());
  }
  
  setupAutoHide() {
    let hideTimeout;
    let lastScrollY = window.scrollY;
    
    // Auto-hide saat scroll down
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Hide saat scroll down, show saat scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        this.hide();
      } else if (currentScrollY < lastScrollY) {
        this.show();
      }
      
      lastScrollY = currentScrollY;
      
      // Auto-minimize setelah tidak aktif
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        if (!this.isMinimized && currentScrollY > 200) {
          this.minimize();
        }
      }, 3000);
    });
    
    // Show on user interaction
    ['mousemove', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, () => {
        this.show();
        clearTimeout(hideTimeout);
      });
    });
  }
  
  setupAccessibility() {
    // ARIA labels
    this.nav.setAttribute('role', 'navigation');
    this.nav.setAttribute('aria-label', 'Bottom navigation');
    
    if (this.handle) {
      this.handle.setAttribute('role', 'button');
      this.handle.setAttribute('aria-label', 'Toggle navigation minimize');
      this.handle.setAttribute('tabindex', '0');
    }
    
    // Navigation items
    const navItems = this.nav.querySelectorAll('.bottom-nav-link');
    navItems.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      
      // Add aria-current for active item
      if (item.classList.contains('active')) {
        item.setAttribute('aria-current', 'page');
      }
    });
  }
  
  handleTouchStart(e) {
    this.swipeStartY = e.touches[0].clientY;
    this.swipeStartX = e.touches[0].clientX;
    this.isDragging = true;
    this.nav.classList.add('swiping');
  }
  
  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - this.swipeStartY;
    const deltaX = currentX - this.swipeStartX;
    
    // Vertikal swipe untuk minimize/expand
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 50 && !this.isMinimized) {
        this.minimize();
      } else if (deltaY < -50 && this.isMinimized) {
        this.expand();
      }
    }
    
    // Horizontal swipe untuk horizontal minimize
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
      this.toggleHorizontalMinimize();
    }
  }
  
  handleTouchEnd() {
    this.isDragging = false;
    this.nav.classList.remove('swiping');
  }
  
  handleMouseDown(e) {
    this.swipeStartY = e.clientY;
    this.swipeStartX = e.clientX;
    this.isDragging = true;
    this.nav.classList.add('swiping');
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const deltaY = e.clientY - this.swipeStartY;
    const deltaX = e.clientX - this.swipeStartX;
    
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0 && !this.isMinimized) {
        this.minimize();
      } else if (deltaY < 0 && this.isMinimized) {
        this.expand();
      }
    }
  }
  
  handleMouseUp() {
    this.isDragging = false;
    this.nav.classList.remove('swiping');
  }
  
  handleKeyboard(e) {
    // ESC untuk toggle minimize
    if (e.key === 'Escape') {
      this.toggleMinimize();
    }
    
    // Ctrl+M untuk horizontal minimize
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      this.toggleHorizontalMinimize();
    }
    
    // Arrow keys untuk navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      this.navigateWithKeyboard(e.key === 'ArrowRight' ? 1 : -1);
    }
  }
  
  handleResize() {
    // Hide horizontal minimize pada desktop
    if (window.innerWidth >= 1024) {
      this.nav.style.display = 'none';
    } else {
      this.nav.style.display = '';
      
      // Reset states pada mobile
      if (window.innerWidth < 768) {
        this.isHorizontalMinimized = false;
        this.nav.classList.remove('horizontal-minimized');
      }
    }
  }
  
  toggleMinimize() {
    if (this.isMinimized) {
      this.expand();
    } else {
      this.minimize();
    }
  }
  
  minimize() {
    this.isMinimized = true;
    this.nav.classList.add('minimized');
    this.nav.setAttribute('data-state', 'minimizing');
    
    // Update ARIA
    if (this.handle) {
      this.handle.setAttribute('aria-label', 'Expand navigation');
    }
    
    // Haptic feedback (jika didukung)
    this.triggerHapticFeedback('light');
    
    this.updateState();
    this.dispatchEvent('minimize');
  }
  
  expand() {
    this.isMinimized = false;
    this.nav.classList.remove('minimized');
    this.nav.setAttribute('data-state', 'expanding');
    
    // Update ARIA
    if (this.handle) {
      this.handle.setAttribute('aria-label', 'Minimize navigation');
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('light');
    
    this.updateState();
    this.dispatchEvent('expand');
  }
  
  toggleHorizontalMinimize() {
    if (window.innerWidth >= 1024) return; // Tidak di desktop
    
    if (this.isHorizontalMinimized) {
      this.expandHorizontal();
    } else {
      this.minimizeHorizontal();
    }
  }
  
  minimizeHorizontal() {
    this.isHorizontalMinimized = true;
    this.nav.classList.add('horizontal-minimized');
    
    // Haptic feedback
    this.triggerHapticFeedback('medium');
    
    this.updateState();
    this.dispatchEvent('horizontalMinimize');
  }
  
  expandHorizontal() {
    this.isHorizontalMinimized = false;
    this.nav.classList.remove('horizontal-minimized');
    
    // Haptic feedback
    this.triggerHapticFeedback('medium');
    
    this.updateState();
    this.dispatchEvent('horizontalExpand');
  }
  
  hide() {
    this.nav.style.transform = 'translateY(100%)';
    this.dispatchEvent('hide');
  }
  
  show() {
    this.nav.style.transform = '';
    this.dispatchEvent('show');
  }
  
  navigateWithKeyboard(direction) {
    const activeItem = this.nav.querySelector('.bottom-nav-link.active');
    const allItems = [...this.nav.querySelectorAll('.bottom-nav-link')];
    const currentIndex = allItems.indexOf(activeItem);
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = allItems.length - 1;
    if (newIndex >= allItems.length) newIndex = 0;
    
    // Focus dan activate item baru
    allItems[newIndex].focus();
    this.setActiveItem(allItems[newIndex]);
  }
  
  setActiveItem(item) {
    // Remove active dari semua item
    this.nav.querySelectorAll('.bottom-nav-link').forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
    
    // Set active pada item baru
    item.classList.add('active');
    item.setAttribute('aria-current', 'page');
    
    // Haptic feedback
    this.triggerHapticFeedback('light');
    
    this.dispatchEvent('navigate', { activeItem: item });
  }
  
  triggerHapticFeedback(intensity = 'light') {
    // iOS Haptic Feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [10, 10, 10],
        heavy: [20, 10, 20]
      };
      navigator.vibrate(patterns[intensity] || patterns.light);
    }
    
    // Web Vibration API
    if ('vibrate' in navigator) {
      const durations = {
        light: 10,
        medium: 25,
        heavy: 50
      };
      navigator.vibrate(durations[intensity] || durations.light);
    }
  }
  
  updateState() {
    // Save state ke localStorage
    const state = {
      isMinimized: this.isMinimized,
      isHorizontalMinimized: this.isHorizontalMinimized
    };
    localStorage.setItem('bottomNavState', JSON.stringify(state));
  }
  
  loadState() {
    try {
      const savedState = localStorage.getItem('bottomNavState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        if (state.isMinimized) {
          this.minimize();
        }
        
        if (state.isHorizontalMinimized && window.innerWidth < 1024) {
          this.minimizeHorizontal();
        }
      }
    } catch (error) {
      console.warn('Error loading bottom nav state:', error);
    }
  }
  
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(`bottomNav${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
      detail,
      bubbles: true
    });
    this.nav.dispatchEvent(event);
  }
  
  // Public API methods
  addBadge(itemSelector, count) {
    const item = this.nav.querySelector(itemSelector);
    if (!item) return;
    
    let badge = item.querySelector('.bottom-nav-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'bottom-nav-badge';
      item.appendChild(badge);
    }
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count.toString();
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  
  removeBadge(itemSelector) {
    const item = this.nav.querySelector(itemSelector);
    const badge = item?.querySelector('.bottom-nav-badge');
    if (badge) {
      badge.remove();
    }
  }
  
  updateActiveItem(href) {
    const targetItem = this.nav.querySelector(`[href="${href}"]`);
    if (targetItem) {
      this.setActiveItem(targetItem);
    }
  }
}

// Auto-initialize saat DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  const bottomNav = new BottomNavigation();
  
  // Load saved state
  bottomNav.loadState();
  
  // Expose ke global untuk debugging
  window.bottomNav = bottomNav;
  
  // Example event listeners
  bottomNav.nav?.addEventListener('bottomNavMinimize', () => {
    console.log('Bottom navigation minimized');
  });
  
  bottomNav.nav?.addEventListener('bottomNavNavigate', (e) => {
    console.log('Navigation changed:', e.detail.activeItem);
  });
});

// Export untuk module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BottomNavigation;
}
