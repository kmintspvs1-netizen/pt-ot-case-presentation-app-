# Design System Strategy: The Methodical Flow

This design system is engineered to transform task management from a chore into a high-performance ritual. By leveraging the psychological triggers of "Professional Blues" and "Soft Teals," we create an environment that feels both authoritative and refreshing. This document serves as the blueprint for building interfaces that don't just display data, but orchestrate focus.

---

### 1. Creative North Star: "The Fluid Architect"
The design system is built on the concept of **The Fluid Architect**. Unlike traditional productivity tools that feel like rigid spreadsheets, this system treats the UI as an evolving workspace. We move away from the "grid-of-boxes" mentality toward an editorial, layered experience. 

**The Aesthetic Soul:**
*   **Intentional Asymmetry:** Use white space as a structural element, not just a gap. Hero sections and task headers should feel like magazine layouts.
*   **Breathing Room:** We prioritize high-contrast typography scales and generous padding to reduce cognitive load.
*   **The Progress Glow:** Teal isn't just a color; it’s a beacon of momentum.

---

### 2. Colors & Surface Philosophy

Our palette is grounded in `primary` (#00488d) for authority and `secondary` (#006a6a) for growth. However, the sophistication lies in how these colors interact with our surface tiers.

#### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries are defined through background shifts. A card should be a `surface-container-lowest` (#ffffff) shape sitting on a `surface-container-low` (#f2f3fb) background.

#### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper.
*   **Base Layer:** `surface` (#f9f9ff).
*   **Structural Sections:** `surface-container-low` (#f2f3fb) for sidebars or secondary panels.
*   **Active Workspaces:** `surface-container-lowest` (#ffffff) for the primary task area.
*   **Interactive Elements:** Use `surface-container-high` (#e7e8f0) for hovered states or secondary navigation pods.

#### The "Glass & Gradient" Rule
To escape the "default" look, main CTAs and progress indicators should utilize a subtle linear gradient: `primary` (#00488d) transitioning to `primary_container` (#005fb8). For floating modals, apply a **Backdrop Blur (20px)** to a semi-transparent `surface_container_low` to create an expensive, "frosted glass" depth.

---

### 3. Typography Scale

We use a dual-font strategy to balance character with utility. **Manrope** provides a modern, geometric headline presence, while **Inter** ensures maximum legibility for dense task data.

| Role | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | High-impact motivation (e.g., Daily Goal reached). |
| **Headline-MD** | Manrope | 1.75rem | Page headers and primary dashboard titles. |
| **Title-SM** | Inter | 1.0rem | Task names and card titles. |
| **Body-MD** | Inter | 0.875rem | Standard task descriptions and metadata. |
| **Label-SM** | Inter | 0.6875rem | Micro-tags, timestamps, and status labels. |

**Editorial Note:** Always pair a `display-sm` headline with a `label-md` uppercase sub-header for an authoritative, curated look.

---

### 4. Elevation & Depth

We eschew "flat" design in favor of **Tonal Layering**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. The difference in hex value provides a soft, natural "lift."
*   **Ambient Shadows:** When a true float is required (e.g., a Task Creation Modal), use an ultra-diffused shadow: `Offset: 0, 20 | Blur: 40 | Color: 4% opacity of on-surface (#191c21)`. It should look like a soft glow, not a dark smudge.
*   **Ghost Borders:** For accessibility in input fields, use the `outline_variant` (#c2c6d4) at **20% opacity**. This provides a guide without breaking the "No-Line" rule.

---

### 5. Components

#### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `md` radius (0.75rem), `on_primary` text.
*   **Secondary:** `surface-container-high` background with `primary` text. No border.
*   **Tertiary:** No background. `primary` text with a subtle `primary_fixed_dim` underline on hover.

#### Cards & Task Lists
**Forbidden:** Divider lines between tasks.
**Mandatory:** Use 12px or 16px of vertical white space to separate items. A task's status should be indicated by a 4px vertical "accent bar" of `tertiary` (#00524c) on the left edge of the card, rather than a full border.

#### Task Input Fields
Use a "Floating" style. The input field should be `surface_container_lowest` with a `lg` (1.0rem) radius. On focus, apply a subtle shadow and transition the `label-md` text to `primary`.

#### Specialty Component: The Focus Pod
A large-scale card using Glassmorphism (`surface_variant` at 60% opacity + blur) to house the current "Active Task." This breaks the grid and forces the user's eye to the most important item.

---

### 6. Do's and Don'ts

#### Do
*   **DO** use `tertiary` (#00524c) and its variants for "Success" or "Progress" states—it feels more sophisticated than standard lime green.
*   **DO** use the `xl` (1.5rem) roundedness for large layout containers to emphasize a soft, approachable brand personality.
*   **DO** utilize `surface_dim` for empty states to create a sense of "quiet" in the app.

#### Don't
*   **DON'T** use 100% black text. Always use `on_surface` (#191c21) to maintain a premium, ink-like feel.
*   **DON'T** use "Drop Shadows" on small elements like chips or buttons; stick to background color shifts.
*   **DON'T** crowd the UI. If a screen feels busy, increase the spacing scale rather than adding dividers.

---

### 7. Roundedness Scale (Reference)
*   **sm (0.25rem):** Micro-indicators, tooltips.
*   **md (0.75rem):** Standard buttons, checkboxes, chips.
*   **lg (1.0rem):** Task cards, input fields.
*   **xl (1.5rem):** Main dashboard containers, modals.
*   **full (9999px):** Status pills, avatars.