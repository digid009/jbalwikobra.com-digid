# Design System Global - iOS/Android Standards

Design system yang telah dibuat mengikuti standar iOS Human Interface Guidelines dan Material Design principles, dengan pendekatan mobile-first untuk halaman publik dan tablet-first untuk halaman admin.

## 📁 Struktur Files

```
src/styles/
├── global-design-system.css    # Design system utama dengan design tokens
├── admin-design-system.css     # Styles khusus admin (tablet-first)
├── public-pages.css             # Styles khusus halaman publik (mobile-first)
├── bottom-navigation.css        # Bottom navigation dengan minimize horizontal
└── bottom-navigation.js         # JavaScript controller untuk bottom nav
```

## 🎨 Design Tokens

### Warna (Pink Theme + Dark Background)
```css
--primary-pink: #ff1744
--primary-pink-light: #ff5983
--primary-pink-dark: #c4001d
--secondary-pink: #f50057
--accent-pink: #ff4081

--bg-primary: #000000
--bg-secondary: #0d0d0d
--bg-tertiary: #1a1a1a
--bg-gradient: linear-gradient(135deg, #000000 0%, #1a0a1a 50%, #0d0d0d 100%)
```

### Typography (iOS System)
```css
--font-size-xs: 12px    /* iOS Caption 2 */
--font-size-sm: 14px    /* iOS Caption 1 */
--font-size-base: 16px  /* iOS Body */
--font-size-lg: 18px    /* iOS Callout */
--font-size-xl: 20px    /* iOS Title 3 */
--font-size-xxl: 24px   /* iOS Title 2 */
--font-size-3xl: 28px   /* iOS Title 1 */
--font-size-4xl: 34px   /* iOS Large Title */
```

### Spacing (iOS/Android Standard)
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
```

## 📱 Breakpoints (iOS/Android Device Sizes)

```css
/* Mobile */
320px  /* iPhone SE, small Android */
375px  /* iPhone 12/13 Mini */
390px  /* iPhone 12/13/14 */
428px  /* iPhone 12/13/14 Plus */

/* Tablet */
768px  /* iPad Mini, Android tablets */
820px  /* iPad Air */
1024px /* iPad Pro 11" */
1194px /* iPad Pro 12.9" */

/* Desktop */
1280px /* Desktop */
1536px /* Large desktop */
```

## 🏗️ Layout System

### Mobile-First (Halaman Publik)
```html
<div class="public-layout">
  <header class="public-header">
    <div class="public-header-container">
      <a href="/" class="public-logo">Logo</a>
      <button class="mobile-menu-btn">☰</button>
    </div>
  </header>
  
  <main class="public-main">
    <!-- Konten halaman -->
  </main>
  
  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <!-- Navigation items -->
  </nav>
</div>
```

### Tablet-First (Halaman Admin)
```html
<div class="admin-layout">
  <aside class="admin-sidebar">
    <!-- Sidebar navigation -->
  </aside>
  
  <header class="admin-header">
    <!-- Header content -->
  </header>
  
  <main class="admin-main">
    <!-- Main content -->
  </main>
</div>
```

## 🧩 Component System

### Buttons (iOS/Android Style)
```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Ghost Action</button>

<!-- Button Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Cards (Glass Morphism)
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Forms (iOS/Android Style)
```html
<div class="form-group">
  <label class="form-label">Label Text</label>
  <input type="text" class="form-input" placeholder="Placeholder text">
</div>
```

## 🧭 Bottom Navigation

### HTML Structure
```html
<nav class="bottom-nav">
  <div class="bottom-nav-handle"></div>
  <div class="bottom-nav-container">
    <!-- Optional FAB -->
    <button class="bottom-nav-fab">+</button>
    
    <ul class="bottom-nav-items">
      <li class="bottom-nav-item">
        <a href="/" class="bottom-nav-link active">
          <div class="bottom-nav-icon">🏠</div>
          <span class="bottom-nav-label">Home</span>
          <div class="bottom-nav-badge">3</div>
        </a>
      </li>
      <li class="bottom-nav-item">
        <a href="/products" class="bottom-nav-link">
          <div class="bottom-nav-icon">🛍️</div>
          <span class="bottom-nav-label">Products</span>
        </a>
      </li>
      <!-- More items... -->
    </ul>
  </div>
</nav>
```

### JavaScript API
```javascript
// Auto-initialize
const bottomNav = new BottomNavigation('.bottom-nav');

// Manual control
bottomNav.minimize();           // Minimize vertical
bottomNav.expand();             // Expand vertical
bottomNav.toggleMinimize();     // Toggle minimize
bottomNav.minimizeHorizontal(); // Minimize horizontal
bottomNav.expandHorizontal();   // Expand horizontal

// Badge management
bottomNav.addBadge('[href="/"]', 5);    // Add badge dengan count
bottomNav.removeBadge('[href="/"]');     // Remove badge

// Active item management
bottomNav.updateActiveItem('/products'); // Set active berdasarkan href

// Events
bottomNav.nav.addEventListener('bottomNavMinimize', () => {
  console.log('Navigation minimized');
});

bottomNav.nav.addEventListener('bottomNavNavigate', (e) => {
  console.log('Active item:', e.detail.activeItem);
});
```

## 🎨 Typography Classes

```html
<h1 class="typography-large-title">Large Title</h1>
<h2 class="typography-title-1">Title 1</h2>
<h3 class="typography-title-2">Title 2</h3>
<h4 class="typography-title-3">Title 3</h4>
<p class="typography-body">Body text</p>
<p class="typography-callout">Callout text</p>
<small class="typography-caption-1">Caption</small>
```

## 🎯 Grid System

```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Container -->
<div class="container">
  <div class="grid grid-cols-2">
    <!-- Content -->
  </div>
</div>
```

## 🎭 Animation Classes

```html
<!-- Predefined Animations -->
<div class="animate-slide-up">Slide up animation</div>
<div class="animate-slide-down">Slide down animation</div>
<div class="animate-fade-in">Fade in animation</div>
<div class="animate-pulse">Pulse animation</div>
<div class="animate-bounce">Bounce animation</div>
```

## 🔧 Utility Classes

### Flexbox
```html
<div class="flex items-center justify-between">
  <span>Left content</span>
  <span>Right content</span>
</div>
```

### Spacing
```html
<div class="p-md m-lg">Padding medium, margin large</div>
<div class="mx-auto">Centered horizontally</div>
```

### Display
```html
<div class="hidden md:block">Hidden on mobile, visible on tablet+</div>
<div class="mobile-only">Visible only on mobile</div>
```

## 🚀 Features

### ✅ Mobile-First Approach
- Dimulai dari 320px (iPhone SE)
- Progressive enhancement ke tablet dan desktop
- Touch-friendly interactions (min 44px touch targets)

### ✅ Tablet-First Admin
- Admin interface dimulai dari 768px
- Complex data tables dan forms
- Sidebar navigation yang collapsible

### ✅ iOS/Android Standards
- Typography mengikuti iOS Human Interface Guidelines
- Spacing dan sizing mengikuti Material Design
- Native-like animations dan transitions
- Safe area support untuk iOS

### ✅ Bottom Navigation
- Minimize vertical (swipe down atau click handle)
- Minimize horizontal (double tap atau swipe)
- Keyboard navigation support
- Haptic feedback
- Auto-hide pada scroll
- Persistent state di localStorage

### ✅ Accessibility
- ARIA labels dan roles
- Keyboard navigation
- Focus indicators yang jelas
- Screen reader friendly
- Reduced motion support
- High contrast support

### ✅ Performance
- CSS custom properties untuk theming
- Backdrop-filter untuk glass effects
- GPU-accelerated animations
- Minimal DOM manipulation
- Lazy loading support

## 📝 Cara Menggunakan

1. **Import CSS files sesuai kebutuhan:**
```html
<!-- Wajib: Design system utama -->
<link rel="stylesheet" href="/src/styles/global-design-system.css">

<!-- Untuk halaman publik -->
<link rel="stylesheet" href="/src/styles/public-pages.css">
<link rel="stylesheet" href="/src/styles/bottom-navigation.css">

<!-- Untuk halaman admin -->
<link rel="stylesheet" href="/src/styles/admin-design-system.css">
```

2. **Import JavaScript untuk bottom navigation:**
```html
<script src="/src/styles/bottom-navigation.js"></script>
```

3. **Gunakan design tokens dan utility classes:**
```css
.custom-component {
  background: var(--bg-gradient);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}
```

## 🎨 Customization

Design system ini menggunakan CSS custom properties yang bisa di-override:

```css
:root {
  /* Override warna tema */
  --primary-pink: #e91e63;  /* Material Pink */
  --secondary-pink: #ad1457; /* Material Pink Dark */
  
  /* Override spacing */
  --spacing-md: 20px;  /* Default: 16px */
  
  /* Override border radius */
  --radius-md: 8px;   /* Default: 12px */
}
```

## 🧪 Browser Support

- **iOS Safari:** 12+
- **Android Chrome:** 80+
- **Chrome:** 80+
- **Firefox:** 75+
- **Safari:** 12+
- **Edge:** 80+

## 🔮 Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Right-to-left (RTL) support
- [ ] More animation presets
- [ ] Component documentation dengan Storybook
- [ ] CSS-in-JS version untuk React
- [ ] Figma design tokens export
