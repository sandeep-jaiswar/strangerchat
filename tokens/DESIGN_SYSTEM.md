# 🎨 Apple-Inspired Design System

> A comprehensive design token system following Apple's Human Interface Guidelines - emphasizing **Clarity**, **Deference**, and **Depth**.

## 🎯 Design Principles

### 1. **Clarity**

- Text is legible at every size
- Icons are precise and lucid
- Adornments are subtle and appropriate
- Functionality is paramount

### 2. **Deference**

- Fluid motion and crisp interface help people understand and interact with content
- Content fills the entire screen while UI doesn't compete with it
- Translucency and blurring hint at more content

### 3. **Depth**

- Visual layers and realistic motion convey hierarchy
- Touch and discoverability heighten delight
- Transitions provide a sense of orientation

---

## 🎨 Color System

### Primary Brand Colors

- **Primary Blue**: `#0071e3` - Apple's signature blue, used for primary actions and links
- **Secondary Gray**: `#86868b` - Sophisticated neutral for secondary elements

### System Colors (Light & Dark Mode)

- **Background Layers**: Primary, Secondary, Tertiary, Elevated
- **Label Hierarchy**: Primary (100%), Secondary (60%), Tertiary (30%), Quaternary (18%)
- **Fill Levels**: For buttons, controls, and interactive elements

### Accent Colors

Vibrant, precise colors for status and categorization:

- 🔵 Blue (`#007aff`) - Default system color
- 🟢 Green (`#34c759`) - Success, growth
- 🟣 Purple (`#af52de`) - Creative, premium
- 🟠 Orange (`#ff9500`) - Warnings, highlights
- 🔴 Red (`#ff3b30`) - Errors, alerts
- 🐦 Teal (`#5ac8fa`) - Communication
- 🟡 Yellow (`#ffcc00`) - Attention
- 🌸 Pink (`#ff2d55`) - Love, favorites

### Semantic Colors

- ✅ **Success**: `#34c759` with light/dark variants
- ❌ **Error**: `#ff3b30` with light/dark variants
- ⚠️ **Warning**: `#ff9500` with light/dark variants
- ℹ️ **Info**: `#007aff` with light/dark variants

---

## ✍️ Typography

### Font Families

- **Sans**: SF Pro Display/Text (system fallback to -apple-system)
- **Mono**: SF Mono (for code)
- **Rounded**: SF Pro Rounded (for friendly UI)

### Type Scale

Following iOS text styles:

| Style       | Size | Usage                      |
| ----------- | ---- | -------------------------- |
| Caption 2   | 11px | Smallest utility text      |
| Caption 1   | 12px | Timestamps, metadata       |
| Footnote    | 13px | Secondary descriptions     |
| Subheadline | 15px | Secondary text             |
| Body        | 17px | Primary content (default)  |
| Callout     | 16px | Emphasized content         |
| Headline    | 17px | Section headers (semibold) |
| Title 3     | 20px | Card titles                |
| Title 2     | 22px | Screen titles              |
| Title 1     | 28px | Primary screen titles      |
| Large Title | 34px | Navigation bars            |
| Display     | 40px | Hero sections              |

### Font Weights

- Ultralight (100), Thin (200), Light (300)
- Regular (400), Medium (500), Semibold (600)
- Bold (700), Heavy (800), Black (900)

---

## 📏 Spacing System

Based on 4px base unit for perfect alignment:

- **2px** (0.5) - Hairline spacing
- **4px** (1) - Minimum spacing
- **8px** (2) - Small spacing
- **12px** (3) - Base spacing
- **16px** (4) - Standard spacing
- **20px** (5) - Medium spacing
- **24px** (6) - Large spacing
- **32px** (8) - Section spacing
- **48px** (12) - Major section spacing

---

## 🔲 Border Radius

### Standard Radii

- **xs** (4px) - Subtle rounding
- **sm** (6px) - Buttons, small cards
- **md** (8px) - Default for most elements
- **lg** (12px) - Larger cards
- **xl** (16px) - Modals, sheets
- **2xl** (20px) - Prominent elements
- **full** - Pills, avatars

### Continuous Curve Radii

iOS-style smooth, continuous curves:

- **sm** (8px), **md** (14px), **lg** (20px), **xl** (28px), **2xl** (40px)

---

## 🌑 Shadows & Elevation

### Standard Shadows

- **xs, sm** - Minimal elevation (buttons, inputs)
- **md, lg** - Medium elevation (cards, dropdowns)
- **xl, 2xl** - High elevation (modals, sheets)

### Soft Shadows (Apple-style)

Gentle, natural shadows for depth:

- **soft-sm**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **soft-md**: `0 4px 16px rgba(0, 0, 0, 0.12)`
- **soft-lg**: `0 8px 32px rgba(0, 0, 0, 0.16)`
- **soft-xl**: `0 16px 64px rgba(0, 0, 0, 0.2)`

### Colored Shadows

For emphasis on primary actions:

- Primary (blue), Success (green), Error (red), Warning (orange)

---

## 🎭 Material & Glassmorphism

### Material Backgrounds

Translucent layers that reveal content beneath:

- **Ultra Thin**: 30% opacity
- **Thin**: 50% opacity
- **Regular**: 70% opacity (default)
- **Thick**: 85% opacity

### Blur Effects

- **sm** (4px) - Subtle blur
- **md** (8px) - Standard blur
- **lg** (16px) - Heavy blur
- **xl** (24px) - Ultra blur

---

## ⚡ Animation & Motion

### Duration

- **instant** (0ms) - Immediate changes
- **fast** (150ms) - Micro-interactions
- **base** (250ms) - Standard transitions
- **slow** (350ms) - Complex animations
- **slower** (500ms) - Page transitions

### Easing Functions

#### Apple Spring Curves

- **gentle**: `cubic-bezier(0.16, 1, 0.3, 1)` - Smooth, natural
- **smooth**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` - Balanced
- **snappy**: `cubic-bezier(0.34, 1.56, 0.64, 1)` - Energetic bounce

#### iOS Curves

- **default**: `cubic-bezier(0.25, 0.1, 0.25, 1)`
- **decelerate**: `cubic-bezier(0, 0, 0.2, 1)`
- **accelerate**: `cubic-bezier(0.4, 0, 1, 1)`

---

## 🧩 Component Tokens

### Buttons

- **Heights**: 32px (sm), 44px (md - iOS touch target), 56px (lg)
- **Padding**: Horizontal spacing for comfortable tapping
- **Border Radius**: Continuous curve (md)

### Input Fields

- **Height**: 44px (iOS standard touch target)
- **Padding**: 16px horizontal, 12px vertical
- **Border**: 1px with focus states

### Cards

- **Padding**: 16px (sm), 24px (md), 32px (lg)
- **Radius**: 14px (continuous curve)
- **Shadow**: soft-md for subtle elevation

### Modals

- **Width**: 320px (sm), 448px (md), 576px (lg), 768px (xl)
- **Padding**: 24px
- **Radius**: 20px (continuous curve)
- **Backdrop**: Material with blur

### Avatars

- **Sizes**: 24px, 32px, 40px, 48px, 64px, 80px
- **Border Radius**: full (circular)
- **Border**: Optional 2px white border with shadow

---

## ♿ Accessibility

### Touch Targets

- **Minimum size**: 44px × 44px (iOS HIG requirement)
- **Recommended**: 48px × 48px for comfortable tapping

### Focus States

- **Ring Width**: 3px
- **Ring Offset**: 2px
- **Ring Color**: Primary blue with 60% opacity
- **Animation**: Smooth transition

### Reduced Motion

- **Duration**: Near-instant (0.01ms)
- **Easing**: Linear
- Respects `prefers-reduced-motion` media query

### Color Contrast

- **AA Standard**: 4.5:1 for normal text
- **AAA Standard**: 7:1 for normal text
- All color combinations meet WCAG 2.1 requirements

---

## 📱 Responsive Breakpoints

- **xs** (375px) - iPhone SE, small phones
- **sm** (640px) - Large phones, small tablets
- **md** (768px) - iPad portrait
- **lg** (1024px) - iPad landscape, laptops
- **xl** (1280px) - Desktop
- **2xl** (1536px) - Large desktop
- **3xl** (1920px) - Ultra-wide displays

---

## 🎨 Usage Examples

### Creating a Primary Button

```typescript
import { colors, components, radii, shadows } from "./tokens/design-tokens"

const button = {
  backgroundColor: colors.primary.DEFAULT,
  color: colors.primary.foreground,
  height: components.button.height.md,
  padding: components.button.padding.md,
  borderRadius: radii.continuous.md,
  boxShadow: shadows.colored.primary,
}
```

### Glassmorphism Card

```typescript
import { colors, blur, radii, shadows } from "./tokens/design-tokens"

const glassCard = {
  backgroundColor: colors.material.regular,
  backdropFilter: `blur(${blur.lg})`,
  borderRadius: radii.continuous.lg,
  boxShadow: shadows.soft.lg,
}
```

### Smooth Transition

```typescript
import { animation } from "./tokens/design-tokens"

const element = {
  transition: animation.transition.spring,
  transitionDuration: animation.duration.base,
}
```

---

## 🚀 Next Steps

1. **Component Library**: Build React components using these tokens
2. **Theme Provider**: Create light/dark mode switching
3. **Storybook**: Document all components with variants
4. **Tailwind Integration**: Extend Tailwind config with tokens
5. **Testing**: Ensure WCAG compliance and cross-browser support

---

**Built with ❤️ following Apple's Human Interface Guidelines**
