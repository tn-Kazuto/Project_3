# DESIGN.md — 5-Star Luxury Architectural Design System

## 1. Aesthetic Direction & Brand World
The interface embodies the refined aesthetic of a **European 5-Star Grand Palace Hotel residency**:
- **Tone:** Architectural, restrained, editorial, authoritative, warm.
- **Inspiration:** High-end gastronomy publications, bespoke Michelin culinary dossiers, classical typography, and crisp architectural grid alignments.
- **Anti-Patterns Ban (Hallmark & Impeccable Floor):**
  - **Zero generic SaaS gradients:** Never use neon blue-to-purple gradients.
  - **Zero pill/rounded containers:** Maintain strict square corners (`border-radius: 0px`).
  - **Zero box-shadows:** Rely exclusively on hairline rules (`1px solid var(--dp-color-rule)`) and tonal field shifts.
  - **Zero card-in-card nesting:** Keep cards clean and structural.
  - **Zero `transition: all`:** Explicitly declare transitions (`color`, `background-color`, `border-color`, `transform`, `opacity`).
  - **Zero loose `div` buttons:** All interactive controls are semantic `<button>` or `<a>`.

---

## 2. Core Color Tokens
```css
:root {
  --dp-color-ground: #f3eee4;        /* Warm Alabaster surface */
  --dp-color-ground-2: #e4dbcc;      /* Pale Taupe container panel */
  --dp-color-ink: #262321;           /* Deep Charcoal high-contrast text */
  --dp-color-ink-2: #5f5750;         /* Muted Espresso body typography */
  --dp-color-field: #262321;         /* Executive Charcoal background */
  --dp-color-field-deep: #302c29;    /* Deep obsidian card hover */
  --dp-color-field-line: #46403a;    /* Charcoal hairline border */
  --dp-color-on-field: #f3eee4;      /* Alabaster text on dark field */
  --dp-color-on-field-2: #c6bdb0;    /* Muted gold text on dark field */
  --dp-color-panel: #e4dbcc;         /* Inner panel fill */
  --dp-color-panel-line: #c6b89f;    /* Distinct panel border */
  --dp-color-accent: #b69355;        /* Antique Fine Gold accent */
  --dp-color-accent-text: #76591f;   /* Bronze Gold readable label */
  --dp-color-accent-light: #d2b071;  /* Light Gold highlight */
  --dp-color-rule: #d5cab8;          /* Champagne Hairline divider */
}
```

---

## 3. Typography & Hierarchy
- **Display & Headings:** `EB Garamond` (Serif). Line height 1.05 – 1.2. Weights: 500, 600.
- **Body & UI Controls:** `Instrument Sans` (Sans-serif). Line height 1.55. Line length < 80 characters.
- **Label Tracking:** 0.14em – 0.16em uppercase with `font-size: 0.75rem` for architectural meta tags.
- **Structural Devices:** Architectural Roman numerals (`I.`, `II.`, `III.`, `IV.`, `V.`) for sequence marking.

---

## 4. The Four Mandatory UI States
1. **Loading State:**
   - Shimmer skeleton loader (`CulinarySkeleton.jsx`) styled with warm Alabaster and Pale Taupe gradients.
   - Never use raw default Bootstrap spinning wheels.
2. **Empty State:**
   - Editorial empty state (`EmptyState.jsx`) featuring curated culinary quotes from Chef James Thew and active Call-to-Action buttons.
3. **Error State:**
   - Courteous culinary concierge alerts with distinct explanation and accessible retry triggers.
4. **Success State:**
   - Clean feedback banners and self-dismissing toasts styled with Antique Gold borders.

---

## 5. Accessibility & Motion Standards (WCAG 2.1 AA)
- **Skip to Content:** Immediate keyboard anchor jumping straight to `<main id="main-content">`.
- **Focus Rings:** Mandatory `:focus-visible` with 2px Antique Gold outline and 2px offset.
- **Micro-Interactions:** Subtle 150ms ease transitions on interactive elements.
- **Reduced Motion:** Automatic fallback to instantaneous transitions when `prefers-reduced-motion: reduce` is active.
- **Print Dossier:** High-fidelity print styles formatted as an executive culinary recipe card.
