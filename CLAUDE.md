# CLAUDE.md — LePlug Autocare

This file is the source of truth for building the LePlug Autocare website. Read it fully before writing code. It defines the product, the design system, the data model, and what's in vs. out of scope for this phase.

---

## 1. Project Overview

**LePlug Autocare** is a premium online store for car accessories, parts, and car-care/detailing products, serving car owners in Nairobi, Kenya.

The direct reference point is [Robstar Autocare](https://www.robstarautocare.com/) — a functional but dated Kenyan auto-accessories e-commerce site (cluttered mega-menu, plain product grid, WhatsApp-only ordering, generic template feel, no real cart). LePlug should feel like a generation ahead of it: a confident, motorsport-inspired, premium retail experience with a real cart and checkout.

**One-liner:** *"Nairobi's plug for premium car care — parts, accessories, and detailing, done right."*

**Target user:** Nairobi-based car owners — from daily commuters to enthusiasts — who care about how their car looks and runs, are comfortable buying online, and expect a slicker experience than the typical local auto-parts shop.

**Market specifics:**
- Currency: **KES (Kenyan Shilling)**, formatted as `KSh 4,500`
- Payment culture: M-Pesa is dominant; card and cash-on-delivery also expected (UI only this phase — see §13)
- Language: English (Kenyan English conventions) — no translation infrastructure needed

---

## 2. Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS, using the design tokens in §3 — no inline hex codes or magic numbers, extend the Tailwind theme
- **Components:** shadcn/ui (Radix primitives) for interactive elements — dropdowns, dialogs, select, tabs, toast — styled with the tokens in §3. This buys correct accessibility behavior (focus trapping, keyboard nav, ARIA) for free instead of hand-building it.
- **State:** Zustand for cart and wishlist state, persisted to `localStorage` (this is a real deployed app, not a Claude artifact — browser storage is fine here)
- **Data (this phase):** Local mock data (TypeScript files under `lib/data/`) — see §7. No live database or CMS yet.
- **Images:** `next/image`, optimized, consistent aspect ratio per component
- **Icons:** `lucide-react`
- **Deployment target:** Vercel (standard Next.js hosting)

**Scripts (standard):** `dev`, `build`, `start`, `lint` — scaffold with `create-next-app` (TypeScript + Tailwind + ESLint + App Router).

---

## 3. Design Direction

### Grounding

"Motorsport-inspired and premium" is easy to make generic (near-black background, one bright racing-red accent, condensed all-caps type — the default any AI reaches for). To make this specific to LePlug instead, the design is anchored to something real: the **Safari Rally** — the legendary WRC rally run on Kenya's red-earth roads, part of Kenyan car culture specifically, not motorsport in the abstract. That's where the palette and a few signature details come from.

### Color system

| Token | Hex | Use |
|---|---|---|
| `tarmac` | `#16130F` | Primary dark background — a warm, dusty near-black (asphalt/dust), not a cold digital black |
| `murram` | `#A8382A` | Primary accent — named for Kenya's red laterite ("murram") rally roads. CTAs, price highlights, active states, the one signature stripe motif |
| `murram-dim` | `#7A281E` | Hover/pressed state for `murram` |
| `savanna` | `#EDE7D8` | Primary light surface — warm sand/parchment, not stark white. Product cards, content sections |
| `acacia` | `#22452F` | Secondary accent, used sparingly — in-stock indicators, small brand flourishes |
| `steel` | `#3D3A34` | Borders, dividers — warm-toned gray, not cold gray |
| `chrome` gradient | `#DCD9D0 → #A39C8E` | Premium metallic touches on badges/icon backgrounds — bronzed, not icy silver |

Dark `tarmac` sections for the hero, footer, and full-bleed marketing moments; light `savanna` sections for dense product-browsing (shop grid, product detail, checkout) so pricing and specs stay highly legible.

### Typography

- **Headlines:** Archivo (Black/Bold weight) — a confident, heavy grotesk. Used for real headings, not decoration.
- **Body/UI:** Inter — clean and legible at small sizes for specs, prices, filters.
- **Signature accent (used sparingly):** Big Shoulders (Stencil) — reserved for numeric/stencil moments that echo rally car door numbers: SKU tags, a featured-product callout number, checkout step indicators. Not used for general headings — its whole value is that it's rare.

### Layout concept

Left-aligned throughout (not centered) — reads more editorial and confident than the generic centered-hero look. One diagonal `murram` stripe crosses the homepage hero once, at an angle, as the single signature visual moment — not repeated as decoration elsewhere.

```
+------------------------------------------------------+
| LOGO         Shop   About   Contact      [Search][Cart]|
+------------------------------------------------------+
|                                        ╱               |
|  LE PLUG AUTOCARE                    ╱   [dynamic       |
|  Your plug for                      ╱     product/      |
|  premium car care.                 ╱      action photo] |
|  [ Shop Now ]                                            |
+------------------------------------------------------+
```

### Motion

One deliberate load-in moment on the homepage hero (the stripe wipe-in). Everywhere else, motion responds to a person's action — add-to-cart confirmation, filter drawer opening, cart drawer sliding in — not scroll-triggered decoration on every section. Respect `prefers-reduced-motion`.

### Explicit avoid-list (common AI-template tells, ruled out on purpose)

- Tracked-out ALL-CAPS eyebrow labels above every heading
- Accenting a single word in a headline with italics/bold/color
- Numbered 01/02/03 markers unless the content is genuinely sequential (fine for checkout steps, not for a feature list)
- Identical rounded-corner cards with the same soft drop-shadow on everything, regardless of hierarchy
- Decorative gradient washes with no purpose
- A "→" appended to every link or button

### Automaker logo usage (flagged for legal review)

LePlug wants real manufacturer logos (Toyota, Subaru, Nissan, Mazda, Mitsubishi, Ford, etc.) in the "shop by vehicle make" section to appeal directly to owners of those brands — a deliberate choice, not an oversight. Since LePlug isn't an authorized dealer of any of these marks, this carries trademark exposure, so build it in a way that's cheap to adjust if legal calls for changes:

- Frame it informationally — "Parts for your Toyota," "Shop by Vehicle Make" — never phrasing that implies sponsorship or authorization ("Official Toyota Parts Partner")
- Size each logo just large enough to be recognizable, not as a dominant design element
- Source logos from official manufacturer press/media kits rather than scraped web images, and keep them unaltered — no recoloring to fit the palette
- Build the "shop by vehicle make" component so each logo can fall back to text/silhouette with a single prop change, in case legal clears some brands but not others
- **This is a pre-launch legal gate, not a build blocker** — I'm not a lawyer and this isn't legal advice; it's the working assumption until your legal team confirms it, per your plan

### Quality floor (non-negotiable, not the "bold" part — the baseline)

Responsive down to 375px, visible keyboard focus rings in `murram`, reduced motion respected, WCAG AA contrast verified against the actual `tarmac`/`savanna` backgrounds (don't assume a warm dark palette passes contrast — test it).

---

## 4. Site Structure / Pages

1. **Home** — hero (brand statement + the one signature stripe moment), category tiles, bestsellers rail, "shop by vehicle make" strip (real manufacturer logos, pending legal review — see §3), trust signals (delivery, warranty, M-Pesa), newsletter signup
2. **Shop (all products)** — filterable/sortable grid
3. **Category page** — same pattern, scoped to one category, with a short intro block
4. **Product Detail Page** — image gallery, price, stock status, key features, description, compatible vehicle makes, reviews & ratings, related products, add to cart / wishlist
5. **Search results** — same grid pattern, driven by query, handles zero-result state (§9)
6. **Cart** — line items, quantity edit, price summary, promo code field (UI only), proceed to checkout
7. **Checkout** — delivery details → delivery zone/fee → payment method selection → order review → confirmation (see §13 for what's real vs. mocked)
8. **Account** — Login / Register, Order history, Wishlist, Profile & saved addresses
9. **About Us** — brand story, why LePlug, service area
10. **Contact** — form + phone/WhatsApp/location, map embed placeholder
11. **FAQ** — delivery, returns, payment, warranty
12. **Privacy Policy**, **Terms of Service**, **Returns & Refunds Policy** — real legal pages, not just FAQ entries (see §16 for what content you need to supply here)

---

## 5. Navigation & Layout

- **Header:** logo (left), primary nav (Shop, About, Contact — kept short, not a sprawling mega-menu), search bar, account icon, cart icon with item-count badge. Sticky on scroll, compresses slightly (reduced height) once scrolled.
- **Mobile:** header collapses to logo + search + cart + hamburger. Hamburger opens a full-screen nav, not a cramped dropdown.
- **Category navigation:** a visible category bar/mega-panel on Shop pages (max 6 top-level categories from §6, each showing its subcategories) — deliberately shallower than the reference site's exhaustive flat-link menu.
- **Breadcrumbs:** Home / Category / Subcategory / Product — on all product and category pages.
- **Footer:** four columns — Information (About, Delivery, How to Buy, FAQ), Shop (top categories), Account (Login, Orders, Wishlist), Contact & Social — plus a bottom bar with copyright, and Privacy/Terms/Returns links. Payment method icons (M-Pesa, Visa/Mastercard) shown here as a trust signal even before real payment integration.

---

## 6. Proposed Category Structure

Curated, not exhaustive — the key differentiator vs. Robstar's sprawling menu. Category *names* stay plain and functional (people scan for what they need — this is where clarity wins over theming); the motorsport/premium personality lives in the visual design and photography, not the taxonomy.

1. **Exterior** — car covers, lighting (fog/sport lights), spoilers, mud flaps, wind breakers, wipers
2. **Interior** — seat covers, floor mats, dashboard covers, organizers, steering covers, car fragrance
3. **Performance & Service Parts** — brake pads, oil filters, spark plugs, batteries, bulbs
4. **Car Care & Detailing** — cleaning products, polish, tire shine, protection kits, air fresheners
5. **Electronics & Security** — dash cams, alarms, parking sensors, car stereo/speakers
6. **Safety** — jumper cables, reflectors, safety belts, emergency kits

Each product also carries an optional `compatibleMakes` tag (Toyota, Subaru, Nissan, Mazda, Mitsubishi, Ford, etc.) so the shop grid can filter by vehicle make. Logo assets for these makes appear on the homepage strip and filter UI per the usage guidance in §3.

---

## 7. Data Model (mock data, `lib/data/` + `lib/types/`)

```ts
type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;           // top-level category id
  subcategory?: string;
  compatibleMakes?: string[]; // e.g. ["Toyota", "Subaru"]
  brand?: string;
  price: number;               // KES
  compareAtPrice?: number;     // for "was/now" pricing
  images: string[];
  description: string;
  keyFeatures: string[];
  stock: "in_stock" | "low_stock" | "out_of_stock";
  rating?: number;              // avg, derived from reviews
  reviewCount?: number;
  tags?: string[];               // "New", "Bestseller", "Sale"
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  subcategories: { id: string; name: string; slug: string }[];
};

type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
  addresses: Address[];
};

type CartItem = { productId: string; quantity: number };

type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: "processing" | "shipped" | "delivered";
  placedAt: string;
};
```

Seed ~40–60 mock products spread across all categories, with realistic KES pricing and placeholder images, so grid/filter/search never feels empty.

---

## 8. Features & Functionality — In Scope Now

- Product browsing with category/subcategory/brand/price/vehicle-make filters
- Sort: price low–high, price high–low, newest, bestselling, rating
- Search with basic name/category/brand matching
- Product detail page with gallery, reviews display, related products
- **Reviews & ratings** — display mock reviews; allow (mock, client-side) submission of a new review
- **Wishlist** — add/remove, persisted client-side
- **Cart** — add/remove/update quantity, persisted client-side, running subtotal/delivery/total
- **Accounts** — mock login/register (client-side only, no real auth provider), order history from mock data, editable profile/address
- **Checkout flow UI** — full multi-step flow (address → delivery zone/fee → payment method → review → confirmation)

---

## 9. States & Edge Cases

Interface copy for these states should explain what happened and what to do next, in plain language — not apologize, not be vague.

- **Empty cart:** clear message + primary CTA back to Shop
- **Empty wishlist:** same pattern
- **No search results:** state the query, suggest checking spelling or browsing categories instead
- **Out of stock product:** disable Add to Cart, offer "notify me" (UI only) instead of hiding the product
- **Low stock:** small inline indicator on product card/detail ("Only 3 left") once stock drops below a threshold (e.g. 5)
- **404 page:** on-brand, links back to Shop and Home
- **Loading states:** skeleton placeholders for grids/product detail, not blank screens or spinners-only
- **Form validation:** inline, field-level errors (checkout address, login/register, review submission) — state what's wrong and how to fix it, not just "invalid input"

---

## 10. Delivery & Pricing Logic (mock)

- Two delivery zones: **Nairobi Metro** (flat fee, e.g. KSh 300) and **Outside Nairobi** (higher flat fee, e.g. KSh 600) — selectable at checkout, values are placeholders until real logistics are defined
- Free delivery threshold (e.g. orders over KSh 5,000) — nice premium-feel touch, easy to tune later
- Prices displayed are treated as final/VAT-inclusive — note this assumption in checkout copy rather than adding tax-calculation logic this phase

---

## 11. Explicitly Out of Scope for This Phase

- Live payment processing (M-Pesa Daraja API, card processor e.g. Pesapal/Flutterwave/Stripe)
- Real backend/database (mock data only, this phase)
- Real authentication/session security
- Admin/inventory management dashboard
- Transactional email/SMS notifications
- Delivery logistics/courier integration
- CMS for non-technical content editing
- Multi-language support

Flag these clearly if asked to "finish" the site — they're infrastructure decisions beyond a frontend build, not just more UI work.

---

## 12. SEO & Performance Basics

- Per-page `<title>`/meta description, using Next.js Metadata API
- Open Graph tags (title, description, image) on Home, Shop, and Product pages, so links shared on WhatsApp/social render properly
- `schema.org/Product` structured data on product pages (name, price, availability, rating) for search rich results
- `sitemap.xml` and `robots.txt`
- Images served via `next/image`, correctly sized — don't ship full-resolution source images to a 300px card

---

## 13. Payments — What's Real vs. Mocked

The checkout UI presents M-Pesa, Card, and Cash on Delivery as selectable payment methods, and the flow completes end-to-end (address → delivery → payment → confirmation). No payment method actually processes money this phase — "Place Order" writes to mock order data. This is called out explicitly so it's never accidentally treated as launch-ready for real transactions.

---

## 14. Brand Voice & Copy Guidelines

**Tone:** Confident, knowledgeable, a little sharp — like a trusted mechanic with good taste. Premium through competence (precise specs, fit/compatibility info, real photography), not through ornamental language.

- Active voice, plain verbs: a button labeled "Save changes" produces a confirmation that says "Changes saved" — the same word carries through the whole flow
- Name things the way a user understands them, not the way the system is built
- Short sentences over long descriptive ones; cut filler ("We are passionate about...")
- Errors and empty states speak in the interface's voice: state what happened and what to do, don't apologize or hedge

**Sample tagline directions** (pick/refine one for the hero):
- "Your Plug for Premium Car Care"
- "Parts. Care. Performance."
- "Everything Your Car Deserves"

---

## 15. Folder Structure Convention

```
/app
  /page.tsx                     → Home
  /shop/page.tsx                → All products
  /shop/[category]/page.tsx     → Category page
  /product/[slug]/page.tsx      → Product detail
  /search/page.tsx
  /cart/page.tsx
  /checkout/page.tsx
  /account/login/page.tsx
  /account/register/page.tsx
  /account/orders/page.tsx
  /account/wishlist/page.tsx
  /account/profile/page.tsx
  /about/page.tsx
  /contact/page.tsx
  /faq/page.tsx
  /privacy/page.tsx
  /terms/page.tsx
  /returns/page.tsx
  /not-found.tsx
/components
  /ui          → shadcn/ui primitives, themed to §3 tokens
  /layout      → header, footer, nav, mobile menu, breadcrumbs
  /product     → ProductCard, ProductGallery, ProductGrid, Filters, ReviewList
  /cart        → CartLineItem, CartSummary, CartDrawer
  /account     → AccountNav, OrderCard
/lib
  /data        → products.ts, categories.ts, reviews.ts, users.ts (mock data)
  /types       → shared TypeScript types (§7)
  /store       → Zustand stores (cart, wishlist)
  /utils       → formatCurrency, filterProducts, deliveryFee, etc.
```

---

## 16. Content You'll Need to Supply Before Launch

These can't be guessed or defaulted — flagging them now so they're not a surprise later:

- Real phone number and WhatsApp number for Contact/footer
- Physical address / service area description (which parts of Nairobi you deliver to)
- Operating hours
- Social media handles (Instagram/Facebook/TikTok/X — whichever are real)
- Registered business name, for the footer copyright line and the Privacy/Terms/Returns pages (these need real, not placeholder, policy text before going live)
- Actual product photography — mock data will use placeholder images; decide whether launch uses real photos, licensed stock, or a mix
- Final delivery zones and fees (§10 uses placeholder numbers)
- Official high-resolution logo assets for each vehicle make you carry (from manufacturer press/media kits), plus legal sign-off on usage before public launch

---

## 17. Definition of Done — Phase 1 (Frontend, Mock Data)

- [ ] All pages in §4 built and linked, including legal pages (placeholder text acceptable until §16 content arrives)
- [ ] Responsive from 375px through desktop
- [ ] Keyboard focus visible throughout; reduced motion respected
- [ ] Cart and wishlist persist across a page reload
- [ ] Checkout flow completable end-to-end with mock data, ends in a confirmation screen
- [ ] Search, filter, and sort all functional against mock data
- [ ] Reviews visible on product pages; new (mock) review submission works
- [ ] All empty/error/loading/404 states from §9 implemented
- [ ] SEO basics from §12 present on Home, Shop, and Product pages
- [ ] Vehicle-make logos implemented per §3 usage guidance (informational framing, official assets, swappable per-brand)

**Separate pre-launch gate (doesn't block the frontend build):**
- [ ] Legal has reviewed and cleared automaker logo usage (§3) before the site goes live publicly

---

## 18. Assumptions Log

- Currency is KES only, English-only copy
- Deployment assumed to be Vercel — flag if you need different hosting
- Delivery zones/fees in §10 are placeholders pending real numbers from you
- Mock accounts are client-side only — fine for demoing the UX, not for real users until a backend exists
- "Shop by vehicle make" uses real manufacturer logos, framed informationally per §3 — subject to legal review before public launch, and built to swap per-brand easily if legal requires changes to specific marks