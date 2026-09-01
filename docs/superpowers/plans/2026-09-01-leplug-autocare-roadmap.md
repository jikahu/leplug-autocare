# LePlug Autocare — Phase Roadmap

> This is the top-level roadmap for building the site described in `CLAUDE.md`. Each phase gets its own detailed plan file (`docs/superpowers/plans/YYYY-MM-DD-phase-N-<name>.md`) written just before that phase starts, following `superpowers:writing-plans`. Writing full TDD-granular tasks for all ~11 phases upfront would be mostly placeholder for phases 3+ (their content depends on decisions made in earlier phases) — so this doc defines scope and sequencing, and each phase is detailed right before execution.

**Reference spec:** `CLAUDE.md` (source of truth for design tokens, data model, page list, copy voice, scope boundaries).

---

## Phase 0 — Project Scaffold & Design System
Next.js App Router + TypeScript + Tailwind project, extended with the CLAUDE.md §3 design tokens (colors, fonts), shadcn/ui initialized, base folder structure from §15. No pages beyond the default yet. **Detailed plan:** `2026-09-01-phase-0-scaffold.md`.

## Phase 1 — Data Layer
Types (`lib/types/`), mock data (~40-60 products across all 6 categories, categories, reviews), and pure utility functions (`formatCurrency`, `filterProducts`, `sortProducts`, `deliveryFee`) with unit tests. Everything here is a pure function — ideal for TDD. **Detailed plan:** `2026-09-01-phase-1-data-layer.md`.

## Phase 2 — Global Layout & Zustand Stores
Header (sticky, compresses on scroll), footer (4 columns + payment icons), mobile hamburger nav, breadcrumbs, category mega-panel. Zustand cart/wishlist stores with localStorage persistence (logic-only, no UI yet beyond count badges).

## Phase 3 — Home Page
Hero with the single diagonal stripe wipe-in, category tiles, bestsellers rail, "shop by vehicle make" strip (swappable logo/text-fallback component), trust signals, newsletter signup.

## Phase 4 — Shop, Category & Search
Product grid, filter sidebar/drawer (category/subcategory/brand/price/vehicle make), sort control, search matching, empty/zero-result states, loading skeletons.

## Phase 5 — Product Detail Page
Image gallery, price/stock display (in/low/out of stock states), key features, description, compatible makes, reviews list + mock submission form, related products, add-to-cart/wishlist actions, schema.org/Product structured data.

## Phase 6 — Cart & Wishlist
Cart page (line items, quantity edit, summary, promo field UI), cart drawer with add-to-cart animation, wishlist page, empty states for both.

## Phase 7 — Checkout Flow
Multi-step: address → delivery zone/fee → payment method (M-Pesa/Card/COD, UI only) → review → confirmation. Writes to mock order data.

## Phase 8 — Accounts
Login/Register (mock, client-side), order history, wishlist tab, profile + saved addresses, all backed by mock `User`/`Order` data.

## Phase 9 — Static, Legal & SEO
About, Contact (form + map placeholder), FAQ, Privacy/Terms/Returns (placeholder legal text), custom 404. Metadata API + OG tags + sitemap.xml/robots.txt across Home/Shop/Product.

## Phase 10 — Cross-Cutting Polish & QA
Responsive sweep down to 375px, keyboard focus rings, `prefers-reduced-motion` audit, WCAG AA contrast check on `tarmac`/`savanna`, all §9 edge-case states verified end to end, Definition of Done (§17) checklist run.

---

## Explicitly deferred (per CLAUDE.md §11)
Live payments, real backend/DB, real auth, admin dashboard, transactional email/SMS, courier integration, CMS, i18n. Not part of any phase above.

## Pre-launch gate (not a build phase)
Legal review of automaker logo usage (§3, §17) before public launch.
