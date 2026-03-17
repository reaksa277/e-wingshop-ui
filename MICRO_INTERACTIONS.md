# E-Wingshop Micro-Interactions & UI Components

## Overview
This document describes all micro-interactions and reusable UI components implemented for the E-Wingshop e-commerce application.

---

## 🎨 Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `brand` | `#1a6b2f` | Primary brand green |
| `brand-dark` | `#0d3d1a` | Hover states, dark accents |
| `brand-mid` | `#2d9c4a` | Mid-tone green |
| `brand-light` | `#dcf5e4` | Light backgrounds |
| `brand-pale` | `#f0faf3` | Subtle backgrounds |
| `cream` | `#faf8f4` | Page background |
| `amber` | `#f59e0b` | Accents, ratings, countdown |

### Typography
- **Display**: Playfair Display (headings, product names)
- **Sans**: DM Sans (body text, UI elements)

### Shadows
- `shadow-card`: `0 2px 12px rgba(0,0,0,.07)` - Default card elevation
- `shadow-hover`: `0 8px 32px rgba(0,0,0,.12)` - Hover elevation
- `shadow-green`: `0 8px 24px rgba(26,107,47,.25)` - Brand-colored shadow

---

## ⚡ Micro-Interactions

### 1. Product Card Hover
```
Effect: Lift + shadow increase + border flash
CSS: hover-lift, product-card class
Transform: translateY(-4px) on hover
```

### 2. Add to Cart Button
```
Effect: Scale bounce → Icon swaps to checkmark for 1.5s
Hook: useAddToCart()
Animation: animate-check, active:scale-[0.98]
```

### 3. Wishlist Heart
```
Effect: Fill animation + scale pop
Hook: useWishlist()
Animation: heartPop 0.4s
```

### 4. Countdown Timer
```
Effect: Live update every 50ms, seconds digit pulses
Hook: useCountdownFromHours()
Animation: digitPulse on even seconds
```

### 5. Promo Code Apply
```
Effect: Shake on invalid, green tick on valid
Hook: usePromoCode()
Animation: animate-shake, animate-scale-in
```

### 6. Category Pill
```
Effect: Active state slides in with background fill
Component: CategoryPill
Transition: transform 0.3s ease-out
```

### 7. Cart Badge
```
Effect: Bounces when item added
Animation: cartBounce 0.6s
```

### 8. Stock Bar
```
Effect: Animated fill on page load, color changes based on stock level
Hook: useStockAnimation()
Colors: Green (>50%), Amber (20-50%), Red (<20%)
```

### 9. Page Load Stagger
```
Effect: Sections fade up with staggered delay
Hook: usePageLoadAnimation()
Delay: 100ms per section
```

### 10. Search Bar Focus
```
Effect: Width expands 45% → 55%, border turns brand color
Component: SearchBar
Transition: width 0.3s, border-color 0.2s
```

---

## 🧩 Reusable Components

### UI Components

| Component | File | Description |
|-----------|------|-------------|
| `AddToCartButton` | `components/ui/AddToCartButton.tsx` | Button with add-to-cart animation |
| `WishlistButton` | `components/ui/WishlistButton.tsx` | Heart button with fill animation |
| `PromoCodeInput` | `components/ui/PromoCodeInput.tsx` | Input with validation feedback |
| `CategoryPill` | `components/ui/CategoryPill.tsx` | Filter pill with slide animation |
| `CategoryPills` | `components/ui/CategoryPill.tsx` | Container for multiple pills |
| `StockBar` | `components/ui/StockBar.tsx` | Animated stock level indicator |
| `CountdownTimer` | `components/ui/CountdownTimer.tsx` | Live countdown with pulsing digits |
| `PageSection` | `components/ui/PageSection.tsx` | Section with staggered fade-in |
| `StaggeredContainer` | `components/ui/PageSection.tsx` | Container for staggered children |
| `SearchBar` | `components/ui/SearchBar.tsx` | Expanding search with animated button |

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `components/Header.tsx` | Header with announcement bar & countdown |
| `Navbar` | `components/layout/Navbar.tsx` | 3-row navigation with utilities |
| `HeroBanner` | `components/customer/HeroBanner.tsx` | Carousel hero with 5 slides |
| `CategoryGrid` | `components/customer/CategoryGrid.tsx` | Horizontal category scroll |
| `ProductCard` | `components/ProductCard.tsx` | Product card with hover effects |
| `FilterSidebar` | `components/products/FilterSidebar.tsx` | Product filters accordion |
| `ProductsToolbar` | `components/products/ProductsToolbar.tsx` | Sort + view toggle toolbar |
| `Pagination` | `components/products/Pagination.tsx` | Numbered pagination |

---

## 🪝 Custom Hooks

| Hook | File | Description |
|------|------|-------------|
| `useAddToCart` | `hooks/use-add-to-cart.ts` | Cart button state & animation |
| `useWishlist` | `hooks/use-wishlist.ts` | Wishlist toggle animation |
| `usePromoCode` | `hooks/use-promo-code.ts` | Promo validation logic |
| `useCountdown` | `hooks/use-countdown.ts` | Countdown timer logic |
| `useCountdownFromHours` | `hooks/use-countdown.ts` | Countdown from relative time |
| `useCategoryFilter` | `hooks/use-category-filter.ts` | Category filtering |
| `usePageLoadAnimation` | `hooks/use-page-load-animation.ts` | Staggered section loading |
| `useStockAnimation` | `hooks/use-stock-animation.ts` | Stock bar animation |

---

## 📱 Responsive Breakpoints

```css
/* Mobile (< 640px) */
- Single column layout
- Bottom tab bar navigation
- Full-width CTAs
- Hidden sidebar

/* Tablet (640-1024px) */
- 2-column product grid
- Condensed sidebar (bottom sheet)
- Compact navigation

/* Desktop (> 1024px) */
- Full layout with 260px sidebar
- 4-column product grid
- All features visible
```

---

## 🎬 Animation Classes

### Fade Animations
- `animate-fade-up` - Fade in + slide up
- `animate-fade-in` - Simple fade in
- `animate-scale-in` - Scale from 0.9 to 1
- `animate-slide-in-right` - Slide from right

### Effect Animations
- `animate-pulse-dot` - Pulsing opacity (infinite)
- `animate-bounce-short` - Quick bounce scale
- `animate-shake` - Horizontal shake (invalid state)
- `animate-check` - Checkmark pop in
- `animate-fill` - Width fill animation

### Stagger Delays
- `animate-stagger-1` through `animate-stagger-5`
- Delays: 0.1s, 0.2s, 0.3s, 0.4s, 0.5s

---

## 📋 Usage Examples

### Add to Cart Button
```tsx
import { AddToCartButton } from "@/components/ui/AddToCartButton";

<AddToCartButton 
  productId={product.id} 
  price={product.price} 
  quantity={1} 
/>
```

### Wishlist Button
```tsx
import { WishlistButton } from "@/components/ui/WishlistButton";

<WishlistButton 
  productId={product.id} 
  size="md" 
/>
```

### Countdown Timer
```tsx
import { CountdownTimer } from "@/components/ui/CountdownTimer";

<CountdownTimer hours={48} />
```

### Stock Bar
```tsx
import { StockBar } from "@/components/ui/StockBar";

<StockBar 
  currentStock={15} 
  maxStock={100} 
  showLabel={true} 
/>
```

### Page Sections with Stagger
```tsx
import { PageSection } from "@/components/ui/PageSection";

<PageSection index={0}>
  {/* Section content */}
</PageSection>
<PageSection index={1}>
  {/* Section content */}
</PageSection>
```

### Promo Code Input
```tsx
import { PromoCodeInput } from "@/components/ui/PromoCodeInput";

<PromoCodeInput 
  onApply={(code) => handleApply(code)} 
/>
```

### Category Pills
```tsx
import { CategoryPills } from "@/components/ui/CategoryPill";

<CategoryPills 
  categories={categories}
  activeCategory={active}
  onCategoryChange={setActive}
/>
```

---

## 🔧 Configuration

### tailwind.config.ts
All animations, colors, and shadows are configured in `tailwind.config.ts`.

### globals.css
Base styles and utility classes are defined in `app/globals.css`.

### Fonts
Configured in `app/layout.tsx`:
- Playfair Display (display)
- DM Sans (sans)

---

## 🎯 Performance Considerations

1. **CSS Animations**: All animations use CSS transforms and opacity for GPU acceleration
2. **Debounced Updates**: Countdown timer updates every 50ms (not every frame)
3. **Conditional Rendering**: Animations only run when components are visible
4. **Cleanup**: All hooks properly clean up intervals and timeouts on unmount
