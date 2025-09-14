# Public Pages Refactor Mapping (Legacy → Design System)

Consistent global theme: black backgrounds, pink accent, semantic text tokens.

## Utility Targets
- Replace `text-gray-400|300|200|500` → `.text-secondary` (400/300) or `.text-tertiary` (500) or `.text-faint` (very low emphasis)
- Replace `text-white/70|80|60|50` → choose emphasis: 80 -> `.text-secondary`, 70/60 -> `.text-tertiary`, 50 -> `.text-faint`
- Replace `bg-white/5|10` cards → `.interactive-card` (adds hover + border) or `.bg-glass` (static) depending on context
- Replace `hover:bg-white/10` on cards → `.interactive-card` hover already handled
- Replace `border-white/10|20|30` → `.border-subtle` (10–15) or existing border on `.interactive-card`
- Replace `bg-zinc-800|900/50|60` skeleton/loading blocks → `.placeholder-skeleton` or `.bg-surface-alt`
- Replace gradient dark grays: prefer pure black + existing radial/gradient wrappers already used or keep if purposeful background effect.

## Page Mapping
### HomePage / HomePage.refactored
- Card shells: swap `bg-zinc-900/50 border-zinc-800` → `.interactive-card`
- Skeleton loaders: `bg-zinc-800` → `.placeholder-skeleton`
- Buttons with `bg-zinc-800 hover:bg-zinc-700` → convert to btn-secondary or custom `interactive-card` with padding + role=button

### FeedPage
- Text grays for metadata (`text-gray-400|300`) → `.text-tertiary` / `.text-secondary`
- Rating stars fallback `text-gray-300` → `.text-secondary`
- Stats blocks backgrounds `bg-black/40` stay (acceptable) but unify inner subtle borders to `.border-subtle`

### FlashSalesPage
- Inactive tab buttons: `bg-zinc-900/60 text-zinc-300 border-zinc-800` → `interactive-card` minimal style or custom class using `.bg-surface-alt text-secondary border-subtle`

### OrderHistoryPage
- Empty state container: ensure uses `.interactive-card` / `.text-tertiary` for secondary lines
- Order metadata `text-gray-400|300|200` → map emphasis tiers

### SellPage
- Form labels `text-gray-300` → `.text-secondary`
- Supporting descriptions `text-gray-400` → `.text-tertiary`
- Step number `text-black` (inside colored badge) → allow inverse if on light badge else `.text-inverse`

### NotFoundPage (DONE)
- Quick action links simplified to `.interactive-card`

### ComingSoonPage (DONE)
- Action button (secondary) now `.interactive-card`
- Feature cards migrated

### WishlistPage (DONE)
- All gray text tokens migrated

## Refactor Order (Incremental Commits)
1. HomePage (high visibility)
2. FeedPage (multiple gray variants)
3. FlashSalesPage
4. OrderHistoryPage
5. SellPage

## Accessibility Notes
- Ensure color contrast: `.text-tertiary` (~#666) on pure black passes AA for >= 14px normal text; adjust to brighten if needed.
- Maintain focus states: interactive-card inherits default focus outline? Add `:focus-visible { outline: 2px solid var(--primary-pink); outline-offset: 2px; }` enhancement if not present.

## Deferred
- Potential removal of remaining inline gradients if they clash with uniform aesthetic (out of scope for current pass).

Status: Wishlist, NotFound, ComingSoon completed; proceeding with HomePage next.
