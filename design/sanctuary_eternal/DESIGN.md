---
name: Sanctuary Eternal
colors:
  surface: '#16130e'
  surface-dim: '#16130e'
  surface-bright: '#3d3933'
  surface-container-lowest: '#110e09'
  surface-container-low: '#1e1b16'
  surface-container: '#231f1a'
  surface-container-high: '#2d2924'
  surface-container-highest: '#38342e'
  on-surface: '#e9e1d8'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e9e1d8'
  inverse-on-surface: '#34302a'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#76a4ff'
  on-tertiary-container: '#00387e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#16130e'
  on-background: '#e9e1d8'
  surface-variant: '#38342e'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The brand personality is a sophisticated evolution of dark fantasy—shifting from dusty gothic relics to a high-fidelity "Neo-Ethereal" aesthetic. It targets a modern gaming audience that values clarity and premium feel without losing the atmospheric weight of a dungeon crawler. 

The design style is **Dark-UI Glassmorphism**. It utilizes deep charcoal foundations, vibrant status accents, and ethereal semi-transparent layers. The emotional response should be one of "Powerful Mystery"—clean, technical, and performant, yet undeniably rooted in a legendary high-fantasy setting.

## Colors
The palette is anchored in a deep charcoal (`#0e0e0e`) to ensure maximum contrast for status effects and gold accents. 

- **Primary Gold:** Used for high-level progression, legendary rarity, and primary calls to action.
- **Vibrant Accents:** Health uses a visceral red gradient; Mana uses a deep, glowing blue. 
- **Surfaces:** Utilize varying levels of transparency rather than flat grays to maintain depth.
- **Gradients:** Use subtle radial gradients for background depth (e.g., a faint #1a1a1a glow behind active UI clusters) and linear gradients for progress bars.

## Typography
The typography system creates a "Modern Epic" feel. 

- **Headlines:** Epilogue is used for impact. It must always have tighter tracking (letter-spacing) than default to feel "armored" and intentional. Use bold or extra-bold weights for hierarchy.
- **Body & Technical:** Geist provides a developer-friendly, precise feel for stats, item descriptions, and dialogue. Its high legibility handles dense information without visual clutter.
- **Labels:** Use uppercase for labels and small buttons to differentiate metadata from body text.

## Layout & Spacing
This design system uses a **Fluid Grid** with generous whitespace to prevent the "claustrophobic" feel of traditional fantasy UIs.

- **Rhythm:** An 8px base grid governs all components, but 16px (md) and 24px (lg) are the primary increments for internal padding to maintain a premium, airy feel.
- **Breakpoints:**
    - Mobile: Single column, 16px margins.
    - Tablet: 8-column grid, 24px margins.
    - Desktop: 12-column grid, 48px margins, maximum content width of 1440px.
- **Contextual Spacing:** Overlays and modals should use `xl` padding (40px) to feel distinct from the background layer.

## Elevation & Depth
Depth is established through **Glassmorphism** and light-based hierarchy rather than physical shadows.

- **Layers:** Use `backdrop-filter: blur(12px)` for all primary containers (Inventory, Modals, Menus).
- **Outlines:** Every elevated surface must have a 1px inner border of `#ffffff10`. This creates a "etched glass" look that separates elements from the dark background.
- **Atmospheric Glow:** Active or rare elements emit a soft, localized outer glow (`box-shadow: 0 0 20px rgba(197, 160, 89, 0.2)`) instead of hard drop shadows.
- **Z-Axis:** Use three tiers:
    1. **Base:** `#0e0e0e`
    2. **Surface:** Surface Glass + 1px border.
    3. **Overlay:** Surface Glass (higher opacity) + Bloom Glow.

## Shapes
The shape language is contemporary and smooth. We avoid the jagged, sharp edges of traditional gothic design in favor of high-end consumer tech aesthetics.

- **Default (md):** 0.5rem (8px) for small interactive elements like inputs and tags.
- **Large (lg):** 1rem (16px) for buttons and list items.
- **Extra Large (xl):** 1.5rem (24px) for cards and primary navigation containers.
- **Full:** Use pill-shapes only for status badges (e.g., "Online", "Rare").

## Components
- **Buttons:** Primary buttons use a gold gradient background with black text. Secondary buttons use the 1px white-alpha border with a subtle glass background. Hover states trigger a soft gold outer glow.
- **Cards:** Use `rounded-xl` corners and `backdrop-blur`. Headers within cards should be separated by a 1px divider that fades out at the edges.
- **Status Bars:** Health and Mana bars should have a subtle "liquid" shine overlay and a 1px border. The background of the bar should be a darker, desaturated version of the accent color.
- **Input Fields:** Minimalist design—darker than the surface layer, using the 1px white-alpha border. On focus, the border transitions to Gold (`#c5a059`) with a 4px soft glow.
- **Chips/Badges:** Small, high-contrast elements using `Geist` bold. Use secondary colors for rarity (Purple for Epic, Orange for Legendary).
- **Tooltips:** High blur, dark background, 1px gold top-border for "Legendary" items to provide immediate visual feedback of value.