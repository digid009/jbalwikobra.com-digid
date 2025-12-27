/**
 * Scroll utilities for navigation and pagination
 */

export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

export const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior,
      block: 'start'
    });
  }
};

/**
 * Utility function to scroll to pagination content area
 * Looks for common content containers like tabs, products grid, or feed content
 */
export const scrollToPaginationContent = (behavior: ScrollBehavior = 'smooth'): void => {
  // Try multiple selectors in order of preference
  const selectors = [
    '#content-tabs',        // For pages with tabs like FeedPage
    '.products-grid',       // For products pages
    '.content-section',     // For general content sections
    '.feed-content',        // For feed content
    '.admin-content',       // For admin pages
    '[data-content="main"]', // For pages with data attributes
    'main',                 // HTML5 main element
    '.space-y-6:not(.mb-8)', // Common content wrapper pattern
    '.bg-black\\/40.backdrop-blur-xl.rounded-2xl', // Tab navigation container
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Get the position accounting for any sticky headers
      const rect = element.getBoundingClientRect();
      const offsetTop = window.pageYOffset + rect.top - 80; // 80px offset for headers
      
      window.scrollTo({
        top: offsetTop,
        behavior
      });
      return;
    }
  }

  // If no content area found, scroll to a reasonable position (not completely top)
  window.scrollTo({
    top: 100, // Small offset from top
    behavior
  });
};

// For handling pagination changes with scroll to content area
export const handlePaginationChange = (page: number, onPageChange: (page: number) => void) => {
  onPageChange(page);
  scrollToPaginationContent();
};

// For handling filter changes that should reset to content area
export const handleFilterChangeWithScroll = (
  filterKey: string, 
  value: any, 
  onFilterChange: (key: string, value: any) => void
) => {
  onFilterChange(filterKey, value);
  scrollToPaginationContent();
};
