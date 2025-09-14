# Tokenization Rollout Summary

Status: Phase 1 (Core utilities + Footer + Admin Header integrated)

## ✅ Implemented
- Added global surface & typography helpers: `.surface-glass-*`, `.heading-brand`, spacing stacks, clusters.
- Mapped CSS variable tokens into Tailwind via `theme.extend.colors.ds`.
- Refactored: `ModernFooter`, `AdminHeaderNew`, `DashboardLayout` to begin using token classes.
- Removed legacy `Footer.tsx`.

## 🎯 Goals
Unify styling across admin & public layers using design tokens (colors, spacing, radius, depth) to reduce Tailwind ad-hoc utility sprawl and improve consistency and theming readiness.

## 🧩 New Utility Classes (Highlights)
Surfaces:
- `surface-glass-xs|sm|md|lg`
- `surface-accent`, `surface-accent-fade`, `surface-accent-ring`

Typography / Headings:
- `heading-brand`, `heading-section`, `heading-micro`

Spacing abstractions:
- `stack-sm|md|lg` – vertical rhythm
- `cluster-sm|md|lg` – flexible horizontal groups

Semantic helpers:
- `text-accent`, `bg-accent-soft`, `ring-accent`, `elevation-*`

## 🛠 Tailwind Mapping
Added `ds` color namespace for variable-driven tokens:
```js
colors: { ds: { pink: 'var(--primary-pink)', 'pink-light': 'var(--primary-pink-light)', 'pink-dark': 'var(--primary-pink-dark)', 'pink-secondary': 'var(--secondary-pink)', 'pink-accent': 'var(--accent-pink)', text: 'var(--text-primary)', 'text-secondary': 'var(--text-secondary)', 'text-tertiary': 'var(--text-tertiary)', bg: 'var(--bg-primary)', 'bg-secondary': 'var(--bg-secondary)', 'bg-tertiary': 'var(--bg-tertiary)' } }
```

## 📌 Next Recommended Steps (Phase 2)
1. Replace repeated `bg-black/..` + blur combos in admin cards with `surface-glass-*`.
2. Standardize metrics/stat cards using a shared `AdminStatCard` with tokens.
3. Migrate product CRUD forms to use `.form-group`, `.form-label`, `.form-input` classes fully (already defined).
4. Extract button variants from scattered Tailwind into tokenized classes where not using `IOSButton`.
5. Introduce light mode toggle (tokens already variable-based – requires alt palette).
6. Add animation utility usage for entrance transitions (`animate-fade-in`, `animate-slide-up`).
7. Create Storybook or MDX preview referencing token classes (optional).

## 🧪 Verification
- Production build succeeded post-refactor.
- No unresolved imports after footer removal.
- Bundle diff minimal (< +1KB JS, +0.4KB CSS gzipped) – acceptable.

## 🚀 Rollout Guidance
Refactor progressively: each touched file should move at least 1–2 hardcoded visual utilities to token classes until coverage reaches ~80%.

## 🛡 Guardrails
- Avoid mixing raw arbitrary Tailwind colors with token surfaces unless experimental.
- Prefer adding a new token utility instead of duplicating long class strings.
- Keep new utilities generic (no product-specific semantics).

---
Maintainer: Tokenization Phase 1 complete. Proceed to Phase 2 when ready.

---

## 🚧 Phase 2 Progress (In Flight)

### ✅ Completed This Phase
- Introduced unified form token utilities: `.form-field`, `.form-label`, `.form-control`, `.form-hint`, state variants (`.success|.warning|.error`).
- Refactored `ProductDetailsForm.tsx` to remove long Tailwind chains in favor of semantic form classes (improved readability & consistency).
- Added light mode theme scaffold via `:root.light { ... }` variable overrides (background tiers, text palette, adjusted pink ramp, softened shadows, surface adjustments).
- Added accessibility improvements: each form control now has an `id` paired with its `<label htmlFor>`.

### 🧪 Immediate Impact
- Reduced per-input class noise from ~12–14 utilities to a single `form-control` token class.
- Enables rapid adoption in remaining forms (`BannerForm`, `FlashSaleForm`, `RentalOptionsForm`).
- Light mode can now be enabled with a single: `document.documentElement.classList.add('light')` (future toggle component pending).

### 🔜 Short-Term Next Steps
1. Migrate remaining admin forms to the new form utilities.
2. Replace custom toggle implementations with `.toggle` + `.toggle.active` token class pattern or abstract component.
3. Sunset legacy `.form-group` vs `.form-field` duplication (align naming – currently `.form-field` preferred; keep `.form-group` for backward compatibility until fully removed).
4. Create a `FORM_TOKENS_GUIDE.md` (optional) if more complex patterns emerge (validation groups, fieldsets, inline compound controls).
5. Add a simple light/dark theme toggle control in admin header for QA.

### 📂 Reference Snippet
```tsx
<div className="form-field">
	<label htmlFor="price" className="form-label required">Price</label>
	<input id="price" className="form-control" placeholder="Rp 1.000.000" />
	<p className="form-hint">Nominal dalam Rupiah</p>
</div>
```

### 🎯 Target Coverage
Aim for ≥80% of form fields across admin using `form-control` before expanding to advanced patterns (chips, rich text, multi-input groups).

### 🛡 Guardrails (Phase 2 additions)
- Avoid partial migration inside a single form—prefer converting entire file to prevent style drift.
- For selects requiring custom arrow: keep wrapper `relative` + embed arrow icon; do not override padding manually (already reserved by token spacing).
- Use `.form-control.error` + `.form-hint.error` instead of ad-hoc red border utilities.

### 📊 Metrics To Track (Optional)
- Lines removed vs added per migrated form (expect net reduction).
- Avg. class name length reduction (qualitative readability metric).

---

### 🔄 Phase 2 Incremental Update (Forms + Toggles)

New Additions:
- Migrated `BannerForm`, `FlashSaleForm`, `RentalOptionsForm` to token form utilities (`form-control`, `form-label`, `form-field`).
- Created reusable `Toggle` component (`src/components/ui/Toggle.tsx`).
- Added `ThemeToggle` to admin header enabling runtime light/dark theme switch.
- Added deprecation banner to legacy `MetricCard` (to be removed after full migration).

Benefits:
- Reduced repetitive per-input Tailwind chains by ~70-85% in migrated forms.
- Established consistent toggle semantics (ARIA role="switch").
- Theming path validated (live switching via classList).

Next Targets:
- Remove `MetricCard` after confirming no remaining references.
- Consider token class for discount type selection cards (currently still uses manual gradient utilities).
- Add visual focus state utility `.focus-ring-accent` (future improvement) to replace repeated focus styles.

Risk Notes:
- Ensure any future date/time inputs preserve `form-control` padding; avoid inline overrides.
- Light mode QA pass needed on complex gradient surfaces.

Removal Plan for Deprecated Assets:
1. Search for `MetricCard` imports → migrate to `AdminStatCard`.
2. Delete file and update docs (Phase 2 cleanup section).

---

## ➕ Phase 2 Expansion: Global Spacing, Font & Layout Utilities

To "mengglobalisasi ukuran font, layout, spacing, gap dan margin" a new utility layer was added to `global-design-system.css` (end of file) mapping directly to existing tokens (no new hard‑coded values):

### Added Utility Categories
1. Gap utilities: `gap-xs|sm|md|lg|xl|2xl`
2. Directional padding: `pt-* pb-* pl-* pr-*` + axis shorthands: `px-* py-*`
3. Directional margin: `mt-* mb-* ml-* mr-*` + axis shorthands: `mx-* my-*`
4. Generic font sizes: `fs-xs|sm|base|lg|xl|2xl|3xl|4xl`
5. Layout width helpers: `layout-narrow` (≤620px), `layout-content` (≤960px), `layout-wide` (≤1280px), `layout-fluid` (full width). Responsive variants started for large screens (`lg:layout-content`, `lg:layout-wide`).

### Rationale
- Eliminates ad-hoc Tailwind spacing combos (`mt-6 mb-8 px-4`) by providing semantic, token-driven alternatives that remain stable if the underlying scale shifts.
- Aligns spacing and gap usage across flex & grid without reintroducing raw numeric values.
- Font size generics allow quick sizing when semantic heading classes (`heading-*`) are not appropriate (micro UI text, inline metrics, badges) while still referencing the central typography scale.
- Layout helpers standardize content width breakpoints and reduce one-off `max-w-*` plus centering boilerplate.

### Example Migrations
| Before (Tailwind) | After (Token Utilities) |
| ----------------- | ----------------------- |
| `grid gap-6 px-4 py-8 max-w-3xl mx-auto` | `grid gap-lg px-md py-xl layout-content` |
| `flex space-x-4` | `cluster-sm` (if wrap) or `flex gap-sm` (using new gap utility) |
| `mt-10 mb-6` | `mt-xl mb-lg` |
| `text-sm md:text-base` | `fs-sm md:fs-base` |

### Usage Guidance
- Prefer stacks (`stack-*`) for vertical rhythm inside forms/sections; use directional margin only for one-off adjustments.
- Use `layout-*` on top-level wrappers inside pages; avoid mixing multiple layout classes on the same element.
- Keep semantic heading classes (`heading-brand`, etc.) for titles; use `fs-*` for non-heading typographic sizing.
- When refactoring, replace both gap & padding numbers in one pass to avoid half-migrated hybrid patterns.

### Future Considerations
- Negative spacing utilities intentionally omitted (encourage layout refactor instead of offsets).
- Potential addition: `.focus-ring-accent` + accessible outline tokens.
- Could generate responsive directional spacing variants if real use-cases emerge (currently avoided for bundle size/clarity).

### QA Checklist (Complete)
- Visual regression: cards & forms unaffected (new classes opt-in only).
- Token reference integrity: all new classes rely on existing `--spacing-*` / `--font-size-*` variables.
- Naming consistency: kebab-case, mirrors existing token naming patterns.

---

## 📱 Responsive Variant Additions
Curated `md:` and `lg:` responsive utilities were introduced (not a full matrix to avoid CSS bloat):

Included:
- `md:gap-sm|md|lg|xl`, `lg:gap-sm|md|lg|xl`
- `md:fs-sm|base|lg|xl|2xl`, `lg:fs-base|lg|xl|2xl|3xl|4xl`
- Spacing (curated): `md:mt-0|sm|md|lg`, `md:mb-0|sm|md|lg`, axis padding `md:px-sm|md|lg`, `md:py-sm|md|lg` (mirrored for `lg:`)
- Layout helpers already support `lg:layout-content`, `lg:layout-wide`

Rationale:
- Focus on the 90% cases (tuning grid density & typography at breakpoints) without shipping a Tailwind-sized duplicate layer.
- Extend only when a concrete repeating need appears.

Example:
`<div class="gap-md md:gap-lg lg:gap-xl fs-base md:fs-lg lg:fs-xl px-md md:px-lg">`

---
## 🎨 New Utility Set: Surface Tints & Badges
Added subtle accent background helpers and circular badge primitives for consistent icon / status visuals:

Surface tints (gradient + border, token friendly):
- `surface-tint-pink | -emerald | -blue | -amber | -red | -gray`

Badge primitives:
- `badge-circle` (+ size modifiers: `.sm`, `.lg`)
- `badge-ring` (adds inner ring overlay)

Usage Examples:
```jsx
<div className="surface-tint-pink p-md rounded-xl">Accent Section</div>
<div className="badge-circle surface-tint-emerald"><Icon /></div>
<div className="badge-circle lg surface-tint-pink badge-ring"><Loader /></div>
```

Adoption:
- Integrated into `AdminProductsManagement` (loading & empty states + toast visuals) replacing bespoke gradient blobs.
- Reduces repeated long gradient utility strings and aligns with token theming.

---
## 🧮 Filter / Search / Dropdown System
Introduced a cohesive set of utilities to standardize filter panels and data input clusters (Products page migrated):

Utilities:
- `filter-panel` (container w/ blurred gradient + pink frame)
- `filter-panel-header` + `filter-title` + `filter-toggle-badge`
- `filter-content` (vertical spacing scaffold)
- `fields-grid` (auto responsive: 1 / 2 / 4 columns)
- `input-icon-left` (wrap; place svg with class `icon`)
- `select-control` (compact select variant aligned with `form-control` styling)
- `chip`, `chip-clear` (status/result pills)
- `filter-actions` (cluster layout)

Example:
```jsx
<div className="filter-panel">
	<div className="filter-panel-header">
		<span className="filter-title">Filters</span>
		<button className="filter-toggle-badge">Show</button>
	</div>
	<div className="filter-content">
		<div className="input-icon-left">
			<Search className="icon" />
			<input className="form-control" placeholder="Search..." />
		</div>
		<div className="fields-grid">
			<div className="form-field">
				<label className="form-label fs-xs text-secondary">Status</label>
				<select className="select-control">...</select>
			</div>
			{/* more fields */}
		</div>
		<div className="filter-actions">
			<button className="chip-clear">Clear</button>
			<div className="chip">42 Results</div>
		</div>
	</div>
</div>
```

Design Notes:
- Pink retained as primary accent (gradient header & badges) aligning with brand.
- Layout responsive without ad-hoc `gap-*` overrides.
- Replaces prior ad-hoc gradient + spacing duplication in product filters.

Next Targets:
- Apply same pattern to Notifications & Orders filters.
- Introduce optional `filter-bar-inline` for compact top-of-table variant.

---
## 🔽 Enhanced Select / Dropdown System (New)
A refined `select-control` implementation improves visual consistency, accessibility, and theming for native `<select>` elements without requiring a custom React select component.

### Goals
- Remove inconsistent native browser styling (blue highlight / default arrow).
- Provide brand-aligned pink focus ring & hover states.
- Ensure size parity with text inputs via `control-h-*` tokens.
- Offer extensibility hooks for error, loading, compact, density variants.
- Maintain semantic, accessible native control (no ARIA re‑implementation).

### New / Updated Tokens
```
--select-bg
--select-bg-hover
--select-bg-active
--select-border
--select-border-hover
--select-border-focus
--select-radius
--select-arrow-size
--select-arrow-color
--select-focus-ring
--select-font-size
--select-font-weight
```

### Utility Classes
- `select-control` base styling (appearance reset + custom arrow + transitions)
- `focus-ring` generic accent focus utility (reusable beyond selects)
- Size: `select-control control-h-sm|md|lg` (aligns with input heights)
- State modifiers:
  - `.is-error` – tokenized error ring
  - `.is-compact` – reduced padding & font size
  - `.is-loading` – shimmer placeholder overlay

### Usage Example
```jsx
<label className="form-label fs-xs text-secondary" htmlFor="tier">Tier</label>
<select id="tier" className="select-control control-h-md">
  <option value="">All Tiers</option>
  <option value="gold">Gold</option>
  <option value="silver">Silver</option>
</select>
```

### Error Variant
```jsx
<select className="select-control control-h-md is-error" aria-invalid="true">
  <option value="">Select option</option>
</select>
<p className="form-hint error">Required field</p>
```

### Loading Skeleton
```jsx
<select className="select-control control-h-md is-loading" disabled />
```

### Compact Density
```jsx
<select className="select-control control-h-sm is-compact">
  <option>Mini</option>
</select>
```

### Implementation Notes
- Uses inline SVG data URI for arrow (pink stroke). Override arrow color by redefining `--select-arrow-color` and updating SVG if brand accent changes.
- Focus ring centralized (`--select-focus-ring`) enabling future reuse for buttons, inputs via `.focus-ring`.
- Native `<option>` styling is limited cross-browser; base colors provided; for fully custom menus consider a future `Listbox` component if requirements expand (multi-select, virtual scroll, grouped options, icons).

### Next Potential Enhancements
1. Add `.select-control.inline` variant for toolbar/compact filter bars.
2. Provide `.select-control.inverse` for usage on light / tinted surfaces.
3. Abstract a generic `.focus-ring-accent` alias (currently `focus-ring` serves this role).
4. Evaluate custom listbox only if advanced interactions (searchable, async, tags) become common.

Adoption Status: Implemented; pending propagation to Orders & Notifications filters.
---

## 📏 Control Height & Alignment Utilities
Added standardized height tokens to normalize vertical alignment between search input (taller) and compact select filters:

Variables: `--control-h-sm` (34px), `--control-h-md` (40px), `--control-h-field` (29.59px unified), `--control-h-lg` (alias → `--control-h-field` for backward compatibility)
Utilities: `control-h-sm`, `control-h-md`, `control-h-lg` (now maps to unified 29.59px). Legacy large height (52px) deprecated to tighten vertical density.
Helper: `align-center-inline` ensures children center vertically in a horizontal cluster.

Usage:
```jsx
<input className="form-control control-h-lg" /> <!-- renders 29.59px tall -->
<select className="select-control control-h-md" />
```

Rationale:
1. Prevent misalignment when differing intrinsic paddings cause text baselines to drift.
2. Unify all single-line fields (text, select, search) to precise 29.59px visual box for cleaner scan rhythm.
3. Reduce vertical waste inside dense admin modals & tables.
4. Provide backwards safety: existing `control-h-lg` usages automatically adopt new target without refactors.

Adoption: Implemented in Products filter panel (search = large height, selects = medium).

---

## ♻️ Component Removal: MetricCard
The deprecated `MetricCard` component has been fully removed after confirming no active imports remained (only a deprecation comment inside `MetricsGrid`). Replacement is `AdminStatCard` which is token-driven and smaller.

Benefits of Removal:
- Eliminates gradient + arbitrary class duplication.
- Reduces maintenance surface (complex conditional styling logic removed).
- Encourages consistent stat presentation and variant usage.

Next Cleanup Candidate (Future): search for any one-off gradient stat widgets outside metrics grid and normalize to `AdminStatCard` or a new variant if justified.

---
