# Product CRUD Modal Redesign - TODO

## ✅ Completed Tasks
- [x] Analyzed current implementation
- [x] Studied design system from ModernFooter
- [x] Created implementation plan
- [x] Remove Flash Sales Column from ProductsTable
  - [x] Remove "Flash" column header
  - [x] Remove flash sales cell rendering
  - [x] Update table colspan for empty state
  - [x] Remove flash sales related logic

## 🔄 In Progress Tasks
- [ ] Redesign ProductDetailsForm Layout

## 📋 Pending Tasks

### 2. Redesign ProductDetailsForm Layout
- [ ] Change from 2-column to 5-column layout for top row
- [ ] Implement horizontal layout matching the image
- [ ] Update field arrangement: Product Name, Description, Game Title, Tier, Account Level
- [ ] Add Price and Original Price in second row
- [ ] Apply modern design system from footer
- [ ] Ensure responsive behavior

### 3. Redesign ProductImagesUpload Component
- [ ] Create 15-slot image grid layout (3x5 grid)
- [ ] Add upload indicator with cloud icon
- [ ] Implement modern glass morphism design
- [ ] Add image counter (0/15)
- [ ] Ensure drag & drop functionality

### 4. Redesign RentalOptionsForm Component
- [ ] Implement availability toggle matching image design
- [ ] Create rental pricing grid with Qty, Type, Prices columns
- [ ] Add multiple rental option rows
- [ ] Apply consistent design system
- [ ] Improve spacing and layout

### 5. Update ProductCrudModal Layout
- [ ] Optimize modal width and spacing
- [ ] Ensure all components work together
- [ ] Test form submission functionality
- [ ] Verify responsive behavior

### 6. Testing & Verification
- [ ] Test modal opening/closing
- [ ] Test form validation
- [ ] Test image upload functionality
- [ ] Test rental options functionality
- [ ] Verify flash sales column removal
- [ ] Test responsive design on mobile

## 🎯 Design System Guidelines
- Use glass morphism: `bg-white/5 backdrop-blur-sm border border-white/20`
- Gradient accents: `bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10`
- Hover effects: `hover:border-pink-500/30 transition-all duration-300`
- Modern corners: `rounded-xl`, `rounded-2xl`
- Consistent spacing and typography
- Pink/fuchsia color scheme for accents
