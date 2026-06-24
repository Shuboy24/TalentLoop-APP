---
trigger: always_on
---

# TalentLoop Design System

> **Token Rule — Non-Negotiable**
> `tokens/design-tokens.css` is the single source of truth. The agent must **never modify it**. Every color, spacing, radius, shadow, font size, font family, and transition value **must reference a CSS variable from `tokens/design-tokens.css`** (either directly via `var(--tl-*)` or via Tailwind utility classes that map to these variables in `tailwind.config.ts`). Raw hex values, hardcoded px values, and inline style literals are strictly forbidden.

---

## 1. Brand Identity

**Personality:** Trusted, empowering, professional — yet warm and accessible. The visual language must feel credible (not startup-playful) and human (not cold fintech). Clean structure with purposeful warmth: generous whitespace, strong typographic hierarchy, and a palette rooted in deep teal and amber.

---

## 2. Token Reference (`--tl-` prefix convention)

All tokens use the `--tl-` prefix. The definitive list lives in `tokens/design-tokens.css`.

### Color Role Tokens

Semantic color tokens resolved from Figma primitive palette. Follow Material Design role naming (on-*, *-container):

```
--tl-color-primary                    Deep blue (#2563eb) — primary actions, links
--tl-color-primary-on-primary         White — text/icon on primary
--tl-color-primary-primary-container  Light blue tint — backgrounds, chips, badges
--tl-color-primary-on-primary-container  Dark blue — text on container

--tl-color-secondary                  Teal (#14b8a6) — secondary actions
--tl-color-secondary-on-secondary     White
--tl-color-secondary-secondary-container  Light teal tint
--tl-color-secondary-on-secondary-container  Dark teal

--tl-color-tertiary                   Amber (#f59e0b) → CTA, reputation, points
--tl-color-tertiary-on-tertiary       White
--tl-color-tertiary-tertiary-container  Light amber tint
--tl-color-tertiary-on-tertiary-container  Dark amber

--tl-color-error                      Red (#c50707)
--tl-color-error-on-error             White
--tl-color-error-error-container      Light red tint
--tl-color-error-on-error-container   Dark red

--tl-color-neutral                    Light grey (#f9fafa) — page backgrounds
--tl-color-neutral-on-neutral         Dark (#2f3237) — primary text
--tl-color-neutral-neutral-container  Mid grey (#5e656e)
--tl-color-neutral-on-neutral-container  Light grey (#e4e5e7)

--tl-color-neutral-variant            Mid grey (#e6e6e6) — borders, dividers
--tl-color-neutral-variant-on-neutral-variant  Dark (#4c4c4c) — secondary text
--tl-color-neutral-variant-neutral-variant-container  Near-black (#191919)
--tl-color-neutral-variant-on-neutral-variant-container  Near-white (#f2f2f2)

--tl-color-accent                     Purple (#bf03c9) — highlights, badges
--tl-color-accent-on-accent           White
--tl-color-accent-accent-container    Light purple tint
--tl-color-accent-on-accent-container  Dark purple

--tl-color-success                    Green (#2ec804)
--tl-color-success-on-success         White
--tl-color-success-success-container  Light green tint
--tl-color-success-on-success-container  Dark green

--tl-color-warning                    Yellow-green (#bdc606)
--tl-color-warning-on-warning         White
--tl-color-warning-warning-container  Light yellow tint
--tl-color-warning-on-warning-container  Dark yellow-green
```

### Typography Tokens

Type scale: display → headline → title → body → label, each with large/medium/small.

```
/* Display — largest headings */
--tl-font-display-large-font-size: 64px
--tl-font-display-large-font-family: 'Inter', sans-serif
--tl-font-display-large-font-weight: 400
--tl-font-display-large-line-height: 96px
--tl-font-display-large-letter-spacing: -1.92px

/* Headline */
--tl-font-headline-large-font-size: 42px
--tl-font-headline-medium-font-size: 36px
--tl-font-headline-small-font-size: 32px

/* Title (weight 500) */
--tl-font-title-large-font-size: 28px  (weight: 500)
--tl-font-title-medium-font-size: 24px  (weight: 500)
--tl-font-title-small-font-size: 22px   (weight: 500)

/* Body (weight 400) */
--tl-font-body-large-font-size: 20px
--tl-font-body-medium-font-size: 18px
--tl-font-body-small-font-size: 16px

/* Label (weight 400, 16px/14px/12px) */
--tl-font-label-large-font-size: 16px
--tl-font-label-medium-font-size: 14px
--tl-font-label-small-font-size: 12px
```

All typography tokens export per-property vars: `--tl-font-{style}-{font-size|font-family|font-weight|font-style|line-height|letter-spacing}`.

### Spacing Tokens (System-level — always add to CSS if customising)

```
--tl-space-1(4px)  --tl-space-2(8px)   --tl-space-3(12px)  --tl-space-4(16px)
--tl-space-5(20px) --tl-space-6(24px)  --tl-space-8(32px)  --tl-space-10(40px)
--tl-space-12(48px) --tl-space-16(64px) --tl-space-20(80px) --tl-space-24(96px)
```

### Other Tokens (System-level — add to CSS as needed)

```
/* Border & Radius */
--tl-radius-sm(4px) / md(8px) / lg(12px) / xl(16px) / 2xl(24px) / full(9999px)
--tl-border-width(1px) / --tl-border-width-thick(2px)
--tl-border-color: var(--tl-color-neutral-variant)
--tl-border-color-focus: var(--tl-color-primary)

/* Shadows */
--tl-shadow-sm / md / lg / focus

/* Transitions */
--tl-transition-fast(100ms ease) / base(200ms ease) / slow(350ms ease)

/* Z-Index */
--tl-z-base(0) / above(10) / dropdown(100) / modal(200) / toast(300) / overlay(400)

/* Icons */
--tl-icon-sm(16px) / md(20px) / lg(24px)

/* Breakpoints */
--tl-bp-sm(375px) / md(768px) / lg(1024px) / xl(1280px)
```

---

## 3. Layout System

- **Mobile-first.** All components start at 375px and scale up.
- **Grid:** 4-col (mobile) → 8-col (tablet) → 12-col (desktop). Gap: `var(--tl-space-4)`.
- **Section padding:** `var(--tl-space-12)` vertical (mobile) → `var(--tl-space-20)` (desktop).
- **Container:** max-width ~1200px, centred, horizontal padding `var(--tl-space-6)` mobile / `var(--tl-space-10)` desktop.

---

## 4. Core Components

### Buttons
- **Primary:** `bg: var(--tl-color-primary)` · `color: var(--tl-color-primary-on-primary)` · `radius: var(--tl-radius-md)` · `padding: var(--tl-space-3) var(--tl-space-6)` · `font-weight: 600` · hover → darken 10% · `transition: var(--tl-transition-base)`
- **Accent/CTA:** Same as primary but `bg: var(--tl-color-tertiary)` — use for "Propose Trade", "Confirm Agreement"
- **Outline:** `bg: transparent` · `border: 2px solid var(--tl-color-primary)` · `color: var(--tl-color-primary)`
- **Ghost:** No border/bg · `color: var(--tl-color-primary)` · hover `bg: var(--tl-color-primary-primary-container)`
- **Danger:** `bg: var(--tl-color-error)` — disputes, destructive actions only
- **Disabled (all):** `opacity: 0.45` · `cursor: not-allowed` · no hover
- **Loading:** Spinner replaces label; button width locked; pointer-events disabled

### Form Inputs
- `bg: var(--tl-color-neutral)` · `border: 1px solid var(--tl-color-neutral-variant)` · `radius: var(--tl-radius-md)` · `padding: var(--tl-space-3) var(--tl-space-4)`
- `font-size: var(--tl-font-body-small-font-size)` · `color: var(--tl-color-neutral-on-neutral)`
- Focus: `border-color: var(--tl-color-primary)` · `box-shadow: var(--tl-shadow-focus)` · `outline: none`
- Error: `border-color: var(--tl-color-error)` · inline error text below in `var(--tl-color-error)` · `font-size: var(--tl-font-label-small-font-size)`
- Labels: always visible · `font-size: var(--tl-font-label-medium-font-size)` · `font-weight: 500` · `color: var(--tl-color-neutral-variant-on-neutral-variant)`
- Placeholder: `color: var(--tl-color-neutral-variant)`
- Character count (bios, deliverables): bottom-right · `var(--tl-text-xs)` · turns `var(--tl-color-danger)` at limit

### Cards
- `bg: white` · `border: 1px solid var(--tl-color-neutral-variant)` · `radius: var(--tl-radius-xl)` · `padding: var(--tl-space-6)` · `shadow: var(--tl-shadow-sm)`
- Interactive hover: `shadow: var(--tl-shadow-md)` · `transition: var(--tl-transition-base)`

**Match Card** must show: avatar, name, location, reputation badge, offered skills (chips), needed skills (chips), match score bar (teal fill), "Propose Trade" button.

### Badges, Chips & Status Pills
- **Skill chips:** `bg: var(--tl-color-primary-primary-container)` · `color: var(--tl-color-primary)` · `radius: var(--tl-radius-full)` · `padding: var(--tl-space-1) var(--tl-space-3)` · `font-size: var(--tl-font-label-small-font-size)`
- **Reputation badge color by level:** Beginner→neutral · Bronze→amber · Silver→neutral variant · Gold→tertiary · Expert→primary
- **Trade status pills:** Proposed→info · In Progress→tertiary · Awaiting Confirmation→warning · Completed→success · Disputed→error · Cancelled→neutral variant

### Navigation
- `bg: white` · `border-bottom: 1px solid var(--tl-color-neutral-variant)` · height: `var(--tl-space-16)`
- Unread badge: `bg: var(--tl-color-error)` · `color: var(--tl-color-error-on-error)` · `font-size: var(--tl-font-label-small-font-size)`
- Mobile: hamburger → full-screen drawer overlay using `z-index: 400`

### Trade Pipeline Stepper
- Inactive step: `color: var(--tl-color-neutral-variant)` · `border-color: var(--tl-color-neutral-variant)`
- Active step: `color: var(--tl-color-primary)` · filled circle
- Complete step: `bg: var(--tl-color-success)` · checkmark
- Disputed: `bg: var(--tl-color-error)` · warning icon

### Modals
- Backdrop: `bg: rgba(0,0,0,0.5)` · `z-index: 400`
- Panel: `bg: white` · `radius: var(--tl-radius-2xl)` · `shadow: var(--tl-shadow-lg)` · `padding: var(--tl-space-8)` · `z-index: 200`
- Always: visible close button · focus trap · ESC to dismiss

### Toast Notifications
- Position: bottom-right (desktop), bottom-centre (mobile) · `z-index: 300`
- `radius: var(--tl-radius-lg)` · `padding: var(--tl-space-4) var(--tl-space-5)` · `shadow: var(--tl-shadow-md)`
- Auto-dismiss 5s with progress bar · Types: success/error/info/warning (left border in semantic color)

### Empty States
All list views require a designed empty state: icon in `var(--tl-color-primary-primary-container)`, heading at title-large size, supporting copy in `var(--tl-color-neutral-variant-on-neutral-variant)`, and a CTA button where relevant.

### Loading States
- Card lists → skeleton loaders (`bg: var(--tl-color-neutral)` + shimmer keyframe animation)
- Single async ops → spinner
- Never show blank white space during loading

---

## 5. Typography Rules

| Role | Font Family | Size (var) | Weight | Leading |
|---|---|---|---|---|
| H1 | Inter | `--tl-font-display-large-font-size` (64px) | 400 | 1.5 |
| H2 | Inter | `--tl-font-display-medium-font-size` (56px) | 400 | 1.5 |
| H3 | Inter | `--tl-font-headline-large-font-size` (42px) | 400 | 1.5 |
| Body | Inter | `--tl-font-body-medium-font-size` (18px) | 400 | 1.5 |
| Label | Inter | `--tl-font-label-medium-font-size` (14px) | 400 | 1.5 |
| Caption | Inter | `--tl-font-label-small-font-size` (12px) | 400 | 1.5 |

---

## 6. Accessibility Rules

- WCAG 2.1 Level AA minimum
- Focus: always visible using `var(--tl-shadow-focus)` + outline in `var(--tl-color-primary)`
- Color alone never indicates state — always pair with icon or text label
- All images/avatars: descriptive `alt` text
- Form fields: always use `<label>` — never rely on placeholder as label
- Touch targets: minimum 44×44px on mobile
- `prefers-reduced-motion`: wrap all animations in the media query

---

## 7. Page Layout Notes

- **Dashboard:** 2-col desktop (match feed 2/3, active trades 1/3) · single column mobile
- **Match Feed:** 1-col (mobile) → 2-col (tablet) → 3-col (desktop) · paginated at 20
- **Trade Tracker:** Pipeline stepper at top · filterable trade card list below
- **Onboarding:** Full-screen wizard · progress indicator (5 steps) · no nav access · "Back"/"Continue" only
- **Profile:** Hero (avatar, trust score, badges) + tabbed sections (Skills, Portfolio, Reviews)
- **Proposal Form:** All required fields marked · inline validation · character counters · deadline defaults 7 days

---

## 8. Motion Principles

- Hover/focus/active: 200ms ease
- Route transitions: subtle fade · 350ms ease
- Modal open: scale 0.96→1.0 + fade · 200ms ease
- Toast enter: slide up · 100ms ease
- Match score bar: animate width on mount (the primary delight moment)
- Never animate layout dimensions of content containers

---

## 9. Writing & Microcopy Rules

- Sentence case everywhere — no ALL CAPS
- Active voice: "Propose a Trade" not "Trade Proposal Submission"
- Errors: specific and actionable — "Enter a timeline between 1 and 90 days" not "Invalid input"
- Button labels must match resulting state: "Confirm Agreement" → toast "Agreement confirmed"
- Always use "trade" — never "gig", "job", or "project"
- Destructive actions always require a confirmation modal with a clear "Cancel" escape

---

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|---|
| Reference `var(--tl-*)` from `tokens/design-tokens.css` | Hardcode any hex, px, rem, or rgba value |
| Keep `tokens/design-tokens.css` read-only | Modify, extend, or override `tokens/design-tokens.css` |
| Mobile-first, scale up | Build desktop-first with mobile as afterthought |
| Skeleton loaders during data fetch | Show blank white space while loading |
| Pair status colour with icon or text | Use colour alone to convey state |
| Use tertiary button for "Propose Trade" CTA | Use primary for every button |
| Character counters on all textarea fields | Let users hit limits without warning |
| Confirm destructive actions in a modal | Execute on single click without confirmation |