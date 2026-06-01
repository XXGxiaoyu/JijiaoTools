---
name: Core Extension
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 16px
  stack-gap: 12px
  element-gap: 8px
  popup-width: 360px
  popup-max-height: 580px
---

## Brand & Style

This design system is built for high-utility browser extensions that require immediate clarity and professional trust. The brand personality is efficient, reliable, and unobtrusive, acting as a functional tool rather than a distraction. 

The design style follows **Modern Minimalism** with a focus on functional high-contrast. It prioritizes rapid information scanning through generous whitespace and a restricted, purposeful color palette. The aesthetic is "utility-first," ensuring that the interface feels like a native extension of the browser environment while maintaining a distinct, premium finish through precise alignment and crisp execution.

## Colors

The palette is anchored by a vibrant **Action Blue** (#2563EB) used exclusively for primary interactions, progress indicators, and active states. This ensures that interactive elements are instantly recognizable against the **Crisp White** (#FFFFFF) background.

- **Primary**: Used for CTA buttons, toggles (on), and links.
- **Secondary/Surface**: A soft slate-tinted grey used for secondary buttons, input backgrounds, and subtle grouping containers.
- **Neutral/Text**: A deep navy-black for maximum legibility in typography.
- **Stroke/Border**: A light grey (#E2E8F0) used for structural definition without adding visual noise.

## Typography

The design system utilizes **Inter** for all text roles to ensure maximum readability at small scales common in popup interfaces. 

- **Headlines**: Used sparingly for view titles and critical section headers. Bold weights and tight letter spacing create a sense of structure.
- **Body**: Set at 14px for general content to maintain accessibility within the limited real estate of a browser popup.
- **Labels**: Used for buttons, form headers, and navigation items. These utilize medium or semi-bold weights to differentiate them from static content.
- **Micro-copy**: Captions and metadata use a reduced 11px or 12px size to maintain hierarchy without cluttering the view.

## Layout & Spacing

The layout is optimized for a standard **360px fixed-width** browser popup. It follows a vertical stack model, where components are layered logically from top to bottom.

- **Margins**: A consistent 16px safe area is maintained around the interior perimeter of the popup.
- **Rhythm**: Use an 8px base grid. Components should be separated by 12px (stack gap) or 8px (element gap) to ensure clear grouping.
- **Alignment**: All primary content is left-aligned to assist the "F-pattern" scanning of the user. Action buttons are typically pinned to the bottom or right-aligned within their specific containers.
- **Scrolling**: If content exceeds the max-height, only the body section scrolls; the header and footer (if present) remain fixed to provide constant context and access to primary actions.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. Because the interface is white-on-white, depth is critical for defining interaction boundaries.

- **Surface Levels**: The base layer is white. Secondary surfaces (like search bars or card backgrounds) use a subtle grey tint (#F8FAFC) to create a "recessed" feel.
- **Shadows**: Use a single, soft "Ambient Lift" for floating elements like dropdowns or tooltips. 
  - *Specs*: `0px 4px 12px rgba(15, 23, 42, 0.08)`.
- **Dividers**: Use 1px solid lines (#F1F5F9) to separate distinct functional areas (e.g., separating the header from the main content). Avoid heavy shadows on static cards to keep the UI flat and modern.

## Shapes

The design system employs a **Rounded** corner strategy (0.5rem / 8px) to soften the technical nature of the extension and make it feel more integrated with modern browser UI (like Chrome or Arc).

- **Buttons & Inputs**: Use 8px (0.5rem) corner radius.
- **Large Containers/Cards**: Use 12px or 16px (1rem) corner radius for a more modern, friendly appearance.
- **Indicators/Badges**: Use pill-shaped (full rounding) for status indicators or notification counts to distinguish them from interactive buttons.

## Components

- **Buttons**:
  - **Primary**: Solid Blue (#2563EB) with White text. 8px radius.
  - **Secondary**: Light Grey background (#F1F5F9) with Navy text.
  - **Icon-only**: Transparent background with 8px radius hover state in Light Grey.
- **Input Fields**: 1px border (#E2E8F0), 8px radius, 12px horizontal padding. Focus state uses a 2px blue ring.
- **Toggle/Switch**: Pill-shaped track. When 'on', use the Primary Blue. The 'thumb' should always be white with a subtle drop shadow.
- **Cards**: Use a 1px border (#F1F5F9) or a very light background tint rather than a shadow to define card boundaries.
- **Lists**: Items should have a minimum height of 40px for touch/click targets. Use a subtle grey hover state (#F8FAFC).
- **Empty States**: Use centered, 12px body text in a muted grey (#64748B) with a simplified monochrome icon.