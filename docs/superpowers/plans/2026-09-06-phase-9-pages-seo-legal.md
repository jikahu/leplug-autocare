# Phase 9 — Static, Legal & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the remaining static/legal pages and SEO basics per CLAUDE.md §4.9-§4.12 and the roadmap's Phase 9 scope: About, Contact (form + map placeholder), FAQ, Privacy/Terms/Returns (placeholder legal text), a custom 404, and Metadata API + OG tags + `sitemap.xml`/`robots.txt` across Home/Shop/Product.

**Architecture:**

- **This branches from `master` at its current tip** (`a483b84`, after Phase 8 merged). The footer (`components/layout/footer.tsx`) and header (`components/layout/header.tsx`) already link to `/about`, `/contact`, `/faq` (plus `/faq#delivery`, `/faq#how-to-buy` anchors), `/privacy`, `/terms`, and `/returns` — all of these currently 404 because the routes don't exist yet. This phase makes every one of those existing links resolve.
- **A new `lib/constants.ts` centralizes `SITE_URL` and placeholder business info** (phone, WhatsApp, email, address, hours, social handles, registered legal name) so Contact/About/legal pages and the new `sitemap.ts`/`robots.ts`/`layout.tsx` all read from one place instead of duplicating hardcoded strings. Every value is a clearly-labeled placeholder per CLAUDE.md §16 ("Content You'll Need to Supply Before Launch") — phone/WhatsApp use the `+254 700 000 000` pattern (obviously not a real number), and `legalName` is literally `"LePlug Autocare (registered business name pending)"` so it reads as an honest inline placeholder wherever it's interpolated into legal copy, the same way Phase 8's `RegisterForm` disclosed "This is a demo account" directly in the UI rather than hiding the caveat.
- **FAQ content lives in `lib/data/faqs.ts`**, following the established `lib/data/` convention (categories, products, reviews, users all live there already) rather than being inlined in the page component. Categories (`how-to-buy`, `delivery`, `returns`, `payment`, `warranty`) match CLAUDE.md §4.11 plus the footer's existing `/faq#how-to-buy` link, which has no corresponding section today.
- **FAQ accordion uses native `<details>`/`<summary>`, not a new shadcn component.** This follows the precedent already set twice in this codebase — Phase 5's `StarRatingInput` and Phase 7's delivery-zone/payment-method radios both chose plain accessible HTML elements over adding a Radix/Base UI wrapper "since native elements... are already accessible." A FAQ accordion has the same shape: `<details>` is keyboard-operable and screen-reader-friendly with zero JS and no new dependency.
- **Legal pages (Privacy/Terms/Returns) share one `LegalNotice` component** (`components/legal/legal-notice.tsx`) for the identical "this is placeholder text pending legal review" banner, instead of copy-pasting the same JSX three times.
- **The Contact form is mock/client-side only, matching the Reviews and Register forms' established pattern exactly**: `useState` per field, an `errors` object keyed by field, `clearFieldError` on change, a `role="alert"` summary when errors exist, and a `role="status"` success state after submit — no backend call, consistent with CLAUDE.md §11 (no real backend this phase).
- **The Contact page's map is a static styled placeholder div, not a real Google Maps embed.** CLAUDE.md §4.10 asks for a "map embed placeholder" specifically — embedding a real iframe pointed at a placeholder Nairobi coordinate would look like real location data when it isn't. A labeled placeholder box is the honest version of what's being asked for.
- **The 404 page gets one sparing use of the stencil font** — a large `font-stencil` "404" numeral, styled the same way `CheckoutSteps` already uses `font-stencil` for its step-number circles. CLAUDE.md §3 reserves Big Shoulders Stencil for "numeric/stencil moments" precisely like this one, and explicitly warns its value depends on staying rare — this is the first and only other place it's used.
- **SEO additions are scoped exactly to what CLAUDE.md §12 asks for**: `metadataBase` + default OpenGraph/Twitter card on the root layout (so every page's relative image URLs resolve to absolute ones, which WhatsApp/social unfurling requires), explicit `openGraph` blocks added to Home and Shop (Product already has one from Phase 5; Category already has `generateMetadata` but isn't in §12's named list, so it's left alone), plus `app/sitemap.ts` and `app/robots.ts`. No title-template restructuring — every existing page already sets a full self-contained title like `"Shop All Products — LePlug Autocare"`, and introducing `title.template` now would require touching every existing page.tsx to avoid double-suffixing. Not worth the blast radius for this phase.
- **The sitemap excludes `/cart`, `/checkout`, `/account/*`, and `/search`** — none of these are canonical, indexable destinations (they're user-state or query-driven), which is standard practice for e-commerce sitemaps and keeps `robots.ts`'s disallow list and the sitemap's inclusion list in obvious agreement.
- **OG images for Home/Shop reference `/images/og/default.jpg`, a file that doesn't exist yet.** This matches the codebase's existing, already-accepted convention: `lib/data/products.ts` image paths (`/images/products/${slug}.jpg`) and `lib/data/categories.ts` `heroImage` paths already reference files that don't exist in `public/`, because CLAUDE.md §16 explicitly defers real photography to launch. Phase 9 follows the same convention rather than inventing a new one.

**Tech Stack:** Existing stack, no new dependencies. Next.js 16.3.4 App Router (`MetadataRoute.Sitemap`, `MetadataRoute.Robots` types for the new `sitemap.ts`/`robots.ts`), reusing `components/layout/breadcrumbs.tsx` (`Breadcrumbs`), `components/ui/button.tsx` (`Button`, including the `render`/`nativeButton={false}` pattern `EmptyCart` already uses for button-styled links), `lib/data/categories.ts` (`categories`), `lib/data/products.ts` (`products`, each with a `slug`), `lucide-react` icons (`Phone`, `MessageCircle`, `MapPin`, `Clock` — all standard icons already available in the installed version). No unit tests this phase: everything built is either static content (pages, data files) or thin Next.js routing conventions (`sitemap.ts`, `robots.ts`, `not-found.tsx`), matching the established convention that component/page-level work stays manual/browser-verified only (confirmed again in Phases 6, 7, and 8) while `lib/utils`/`lib/store` pure functions get co-located `.test.ts` files. Baseline to confirm clean before starting: `npm test`, `npm run lint`, `npx tsc --noEmit` (after one `next build` to generate `.next/types`), `npm run build`.

---

### Task 1: `lib/constants.ts`

**Files:**
- Create: `lib/constants.ts`

- [x] **Step 1: Create the file**

```ts
// Placeholder values throughout — see CLAUDE.md §16 ("Content You'll Need to Supply Before Launch").
export const SITE_URL = "https://leplugautocare.co.ke";

export const BUSINESS_INFO = {
  legalName: "LePlug Autocare (registered business name pending)",
  phone: "+254 700 000 000",
  whatsapp: "+254 700 000 000",
  email: "hello@leplugautocare.co.ke",
  address: "Nairobi, Kenya — service area and exact address to be confirmed",
  hours: "Mon–Sat, 8:00 AM – 6:00 PM",
  social: {
    instagram: "https://instagram.com/leplugautocare",
    facebook: "https://facebook.com/leplugautocare",
    tiktok: "https://tiktok.com/@leplugautocare",
  },
} as const;
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add site URL and placeholder business info constants"
```

---

### Task 2: `components/legal/legal-notice.tsx`

**Files:**
- Create: `components/legal/legal-notice.tsx`

- [x] **Step 1: Create the file**

```tsx
export function LegalNotice() {
  return (
    <div className="mb-8 rounded-lg border border-murram/30 bg-murram/5 px-4 py-3 text-sm text-tarmac/80">
      This is placeholder policy text for development and design purposes. It will be replaced with
      reviewed legal text from LePlug Autocare&rsquo;s legal counsel before the site goes live.
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/legal/legal-notice.tsx
git commit -m "feat: add shared legal-page placeholder notice"
```

---

### Task 3: `app/privacy/page.tsx`

**Files:**
- Create: `app/privacy/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — LePlug Autocare",
  description: "How LePlug Autocare collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Privacy Policy</h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Introduction</h2>
          <p className="mt-2">
            This Privacy Policy explains how {BUSINESS_INFO.legalName} collects, uses, and protects
            information when you browse or shop with us. By using this site, you agree to the
            practices described here.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Information We Collect</h2>
          <p className="mt-2">We collect information you provide directly, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account details — name and email, when you register or log in</li>
            <li>Delivery details — address, delivery zone, and phone number, when you check out</li>
            <li>Order history — items purchased, order totals, and order status</li>
            <li>Contact messages — anything you send us through the Contact page</li>
          </ul>
          <p className="mt-2">
            We also store your cart, wishlist, and account data locally in your browser so they
            persist between visits.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. How We Use Your Information</h2>
          <p className="mt-2">We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and deliver your orders</li>
            <li>Communicate with you about your orders or enquiries</li>
            <li>Maintain your account, cart, and wishlist</li>
            <li>Improve the products and experience we offer</li>
          </ul>
          <p className="mt-2">We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. Cookies &amp; Local Storage</h2>
          <p className="mt-2">
            We use your browser&rsquo;s local storage to keep your cart, wishlist, and login state
            between visits. This data stays on your device and isn&rsquo;t used for tracking or
            advertising.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">5. Data Sharing</h2>
          <p className="mt-2">
            We share order and delivery details with the payment and delivery partners needed to
            fulfil your order, and only to the extent required to do so. We don&rsquo;t share your
            information for any other party&rsquo;s marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">6. Your Rights</h2>
          <p className="mt-2">
            You can request a copy of the information we hold about you, ask us to correct it, or ask
            us to delete your account and associated data, by contacting us using the details below.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">7. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this policy as the site evolves. Material changes will be reflected here
            with an updated date.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">8. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Reach us at{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-murram underline underline-offset-2"
            >
              {BUSINESS_INFO.email}
            </a>{" "}
            or via our{" "}
            <a href="/contact" className="text-murram underline underline-offset-2">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/privacy/page.tsx
git commit -m "feat: add /privacy page"
```

---

### Task 4: `app/terms/page.tsx`

**Files:**
- Create: `app/terms/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service — LePlug Autocare",
  description: "The terms that govern your use of LePlug Autocare and any orders you place.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Terms of Service</h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Using This Site</h2>
          <p className="mt-2">
            By using LePlug Autocare, you agree to these terms. If you don&rsquo;t agree, please
            don&rsquo;t use the site. We may update these terms as the business evolves.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Orders &amp; Pricing</h2>
          <p className="mt-2">
            Prices are shown in Kenyan Shillings (KSh) and are treated as final and VAT-inclusive.
            Placing an order is an offer to buy — we&rsquo;ll confirm your order once it&rsquo;s placed.
            Occasionally a listed product may be mispriced or out of stock; if that happens, we&rsquo;ll
            contact you before processing the affected order.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. Payment</h2>
          <p className="mt-2">
            We accept M-Pesa, card, and cash on delivery, selected at checkout. Payment is due at the
            time of ordering, except for cash on delivery, which is paid on receipt of your order.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. Delivery</h2>
          <p className="mt-2">
            Delivery fees and timelines depend on your delivery zone — see our{" "}
            <a href="/faq#delivery" className="text-murram underline underline-offset-2">
              delivery FAQ
            </a>{" "}
            for current rates. Delivery estimates are not guaranteed and may vary.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">
            5. Product Information &amp; Fitment
          </h2>
          <p className="mt-2">
            We do our best to list accurate compatibility information for each product. You&rsquo;re
            responsible for confirming fit for your specific vehicle before ordering — contact us if
            you&rsquo;re unsure.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">
            6. Trademarks &amp; Vehicle Make References
          </h2>
          <p className="mt-2">
            Vehicle manufacturer names and logos shown on this site are used only to describe part
            compatibility. LePlug Autocare is not an authorized dealer of, sponsored by, or
            affiliated with any vehicle manufacturer referenced on this site.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">7. Limitation of Liability</h2>
          <p className="mt-2">
            LePlug Autocare isn&rsquo;t liable for indirect or incidental damages arising from use of
            this site or its products, beyond what&rsquo;s required by Kenyan consumer protection law.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">8. Governing Law</h2>
          <p className="mt-2">These terms are governed by the laws of Kenya.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">9. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach us at{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-murram underline underline-offset-2"
            >
              {BUSINESS_INFO.email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/terms/page.tsx
git commit -m "feat: add /terms page"
```

---

### Task 5: `app/returns/page.tsx`

**Files:**
- Create: `app/returns/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy — LePlug Autocare",
  description: "How returns, exchanges, and refunds work at LePlug Autocare.",
};

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Returns & Refunds" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">
        Returns &amp; Refunds Policy
      </h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Return Window</h2>
          <p className="mt-2">
            You can return most items within 7 days of delivery, provided they&rsquo;re unused, in
            their original packaging, and in resellable condition.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Non-Returnable Items</h2>
          <p className="mt-2">
            Installed or used parts, opened consumables (fluids, sprays, fragrances), and items
            marked as final sale can&rsquo;t be returned unless they&rsquo;re faulty.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. Damaged or Incorrect Items</h2>
          <p className="mt-2">
            If your order arrives damaged or isn&rsquo;t what you ordered, contact us with your order
            number and a photo of the item as soon as you notice. We&rsquo;ll arrange a replacement or
            refund at no extra cost — this doesn&rsquo;t count against the standard return window.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. How to Start a Return</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Contact us with your order number and the reason for the return.</li>
            <li>We&rsquo;ll confirm whether the item qualifies and share return instructions.</li>
            <li>Once we receive and inspect the item, we&rsquo;ll process your refund or exchange.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">5. Refunds</h2>
          <p className="mt-2">
            Approved refunds are issued to your original payment method — M-Pesa, card, or as store
            credit for cash-on-delivery orders — typically within 5-7 business days of approval.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">6. Contact</h2>
          <p className="mt-2">
            To start a return, email{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-murram underline underline-offset-2"
            >
              {BUSINESS_INFO.email}
            </a>{" "}
            or use our{" "}
            <a href="/contact" className="text-murram underline underline-offset-2">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/returns/page.tsx
git commit -m "feat: add /returns page"
```

---

### Task 6: `lib/data/faqs.ts`

**Files:**
- Create: `lib/data/faqs.ts`

- [x] **Step 1: Create the file**

```ts
export type FaqCategoryId = "how-to-buy" | "delivery" | "returns" | "payment" | "warranty";

export type FaqCategory = { id: FaqCategoryId; label: string };

export const faqCategories: FaqCategory[] = [
  { id: "how-to-buy", label: "How to Buy" },
  { id: "delivery", label: "Delivery" },
  { id: "returns", label: "Returns" },
  { id: "payment", label: "Payment" },
  { id: "warranty", label: "Warranty" },
];

export type Faq = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    id: "how-to-buy-1",
    category: "how-to-buy",
    question: "How do I order from LePlug Autocare?",
    answer:
      "Browse or search for what you need, add it to your cart, then head to checkout. You'll enter your delivery details, pick a delivery zone, choose a payment method, and review your order before placing it. You don't need an account to check out, but creating one lets you track order history and save addresses.",
  },
  {
    id: "how-to-buy-2",
    category: "how-to-buy",
    question: "How do I know a part fits my car?",
    answer:
      "Product pages list compatible vehicle makes where relevant. If you're not sure a part fits your specific model, contact us with your car's make, model, and year before ordering.",
  },
  {
    id: "delivery-1",
    category: "delivery",
    question: "What are your delivery zones and fees?",
    answer:
      "We deliver across Nairobi Metro for a flat KSh 300, and outside Nairobi for a flat KSh 600. Orders over KSh 5,000 qualify for free delivery, regardless of zone.",
  },
  {
    id: "delivery-2",
    category: "delivery",
    question: "How long does delivery take?",
    answer:
      "Most Nairobi Metro orders arrive within 1-2 business days of dispatch. Deliveries outside Nairobi may take longer depending on the destination.",
  },
  {
    id: "returns-1",
    category: "returns",
    question: "Can I return a product?",
    answer:
      "Yes — unused items in their original packaging can be returned within 7 days of delivery. See our Returns & Refunds Policy for the full process.",
  },
  {
    id: "returns-2",
    category: "returns",
    question: "What if my order arrives damaged or wrong?",
    answer:
      "Contact us with your order number and a photo of the item as soon as you notice the issue. We'll sort a replacement or refund — this doesn't count against the standard return window.",
  },
  {
    id: "payment-1",
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "M-Pesa, card, and cash on delivery. You'll choose your method at checkout, and prices shown are final and VAT-inclusive.",
  },
  {
    id: "payment-2",
    category: "payment",
    question: "How do you protect my payment details?",
    answer:
      "We don't store your card details on our own servers. M-Pesa payments are confirmed directly on your phone via STK push, so you're always the one approving the transaction.",
  },
  {
    id: "warranty-1",
    category: "warranty",
    question: "Do products come with a warranty?",
    answer:
      "Parts and accessories are backed by manufacturer warranty where applicable — check the individual product page for specifics, or ask us before you order.",
  },
  {
    id: "warranty-2",
    category: "warranty",
    question: "How do I make a warranty claim?",
    answer:
      "Contact us with your order number and a description of the issue. We'll guide you through the manufacturer's warranty process for that product.",
  },
];
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add lib/data/faqs.ts
git commit -m "feat: add FAQ seed data"
```

---

### Task 7: `app/faq/page.tsx`

**Files:**
- Create: `app/faq/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { faqCategories, faqs } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: "FAQ — LePlug Autocare",
  description: "Answers to common questions about delivery, returns, payment, and warranty.",
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">
        Frequently Asked Questions
      </h1>
      <p className="mt-2 text-sm text-tarmac/70">
        Can&rsquo;t find what you&rsquo;re looking for?{" "}
        <a href="/contact" className="text-murram underline underline-offset-2">
          Contact us
        </a>{" "}
        directly.
      </p>

      <div className="mt-8 space-y-10">
        {faqCategories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <h2 className="font-heading text-xl font-bold text-tarmac">{category.label}</h2>
            <div className="mt-4 divide-y divide-steel/30 border-t border-steel/30">
              {faqs
                .filter((faq) => faq.category === category.id)
                .map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-sm font-medium text-tarmac [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram">
                      {faq.question}
                      <span
                        className="shrink-0 text-tarmac/50 transition-transform group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-tarmac/70">{faq.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/faq/page.tsx
git commit -m "feat: add /faq page"
```

> **Deviation applied during execution:** code-quality review found `list-none` alone doesn't suppress Safari/WebKit's native `::-webkit-details-marker` on `<summary>`, which would show a duplicate disclosure indicator alongside the custom "+" on Safari. The `[&::-webkit-details-marker]:hidden` class shown above (in the `<summary>` element) was added as a follow-up fix commit (`4e7ecf3`) — see the Deviations section at the end of this document.

---

### Task 8: `app/about/page.tsx`

**Files:**
- Create: `app/about/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us — LePlug Autocare",
  description: "Why LePlug Autocare exists, and what to expect when you shop with us.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "About" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">About LePlug Autocare</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-tarmac/80">
        <p>
          LePlug Autocare started with a simple frustration: buying car parts and care products in
          Nairobi meant either haggling at a physical shop that may or may not have what you need in
          stock, or scrolling through a cluttered website built more like a catalogue than a store.
          We built LePlug to be the plug — the one place that actually has what your car needs, sold
          the way a premium retailer should sell it.
        </p>
        <p>
          The name is deliberate. In Nairobi, your &ldquo;plug&rdquo; is the person who always comes
          through — the connect who knows where to get the real thing, fairly priced, without the
          runaround. That&rsquo;s the role we want LePlug to play for your car: parts that fit, care
          products that work, and accessories that hold up, without you having to guess.
        </p>
        <p>
          Our look draws from the Safari Rally — Kenya&rsquo;s own motorsport legend, run on the same
          red-earth roads much of Nairobi drives every day. It&rsquo;s not motorsport as an abstract
          aesthetic; it&rsquo;s a nod to a car culture that&rsquo;s specifically ours.
        </p>
        <p>
          We carry parts and accessories across exterior, interior, performance, detailing,
          electronics, and safety — with fitment info for common makes on the road in Kenya, so you
          know before you buy that it&rsquo;ll actually fit your car.
        </p>
        <p>
          {BUSINESS_INFO.address}. Delivery is available across Nairobi Metro and beyond — see our{" "}
          <a href="/faq#delivery" className="text-murram underline underline-offset-2">
            delivery FAQ
          </a>{" "}
          for details.
        </p>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add /about page"
```

---

### Task 9: `components/contact/contact-form.tsx`

**Files:**
- Create: `components/contact/contact-form.tsx`

- [x] **Step 1: Create the file**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type FormErrors = { name?: string; email?: string; message?: string };

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!message.trim()) nextErrors.message = "Write a message before sending.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-lg border border-acacia/40 bg-acacia/5 px-6 py-8 text-center"
      >
        <h3 className="font-heading text-lg font-bold text-tarmac">Message sent.</h3>
        <p className="mt-2 text-sm text-tarmac/70">
          Thanks for reaching out — we&rsquo;ll get back to you soon. For anything urgent, WhatsApp
          us directly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm font-medium text-murram">
          Fix the errors below before sending.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="contact-name" className="text-sm font-medium text-tarmac">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.name && (
          <p id="contact-name-error" className="text-xs text-murram">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="text-sm font-medium text-tarmac">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.email && (
          <p id="contact-email-error" className="text-xs text-murram">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="text-sm font-medium text-tarmac">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearFieldError("message");
          }}
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.message && (
          <p id="contact-message-error" className="text-xs text-murram">
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/contact/contact-form.tsx
git commit -m "feat: add ContactForm component"
```

---

### Task 10: `app/contact/page.tsx`

**Files:**
- Create: `app/contact/page.tsx`

- [x] **Step 1: Create the file**

```tsx
import type { Metadata } from "next";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us — LePlug Autocare",
  description: "Get in touch with LePlug Autocare — phone, WhatsApp, and location details.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-sm text-tarmac/70">
        Questions about a part, an order, or fit for your car? Reach us directly or send a message
        below.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Call us</p>
                <a
                  href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}
                  className="text-sm text-tarmac/70 hover:text-murram"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">WhatsApp</p>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace(/[^\d]/g, "")}`}
                  className="text-sm text-tarmac/70 hover:text-murram"
                >
                  {BUSINESS_INFO.whatsapp}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Location &amp; delivery area</p>
                <p className="text-sm text-tarmac/70">{BUSINESS_INFO.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Hours</p>
                <p className="text-sm text-tarmac/70">{BUSINESS_INFO.hours}</p>
              </div>
            </div>
          </div>

          <div className="flex aspect-video items-center justify-center rounded-lg border border-steel/40 bg-tarmac/5 px-4 text-center text-sm text-tarmac/50">
            Map placeholder — {BUSINESS_INFO.address}
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/contact/page.tsx
git commit -m "feat: add /contact page"
```

---

### Task 11: `app/not-found.tsx`

**Files:**
- Create: `app/not-found.tsx`

- [x] **Step 1: Create the file**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center md:px-8">
      <span className="font-stencil text-7xl text-murram sm:text-8xl">404</span>
      <h1 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">Page not found</h1>
      <p className="max-w-md text-sm text-tarmac/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Check the URL, or
        head back to browsing.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />} nativeButton={false}>
          Back to Home
        </Button>
        <Button render={<Link href="/shop" />} nativeButton={false} variant="outline">
          Browse Shop
        </Button>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add custom 404 page"
```

---

### Task 12: Root layout — `metadataBase` + default OpenGraph/Twitter

**Files:**
- Modify: `app/layout.tsx:1,25-29`

- [x] **Step 1: Update the metadata export**

In `app/layout.tsx`, add an import for `SITE_URL` and replace the existing `metadata` export:

```tsx
import type { Metadata } from "next";
import { Archivo, Inter, Big_Shoulders_Stencil } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreHydration } from "@/components/layout/store-hydration";
import { SITE_URL } from "@/lib/constants";
```

Replace:

```tsx
export const metadata: Metadata = {
  title: "LePlug Autocare",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
};
```

with:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LePlug Autocare",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "LePlug Autocare",
    title: "LePlug Autocare",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: [{ url: "/images/og/default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LePlug Autocare",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: ["/images/og/default.jpg"],
  },
};
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add metadataBase and default OpenGraph/Twitter metadata"
```

---

### Task 13: Home page OpenGraph

**Files:**
- Modify: `app/page.tsx:9-13`

- [x] **Step 1: Update the metadata export**

Replace:

```tsx
export const metadata: Metadata = {
  title: "LePlug Autocare — Premium Car Care in Nairobi",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
};
```

with:

```tsx
export const metadata: Metadata = {
  title: "LePlug Autocare — Premium Car Care in Nairobi",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "LePlug Autocare",
    title: "LePlug Autocare — Premium Car Care in Nairobi",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: [{ url: "/images/og/default.jpg", width: 1200, height: 630 }],
  },
};
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add OpenGraph metadata to home page"
```

> **Deviation applied during execution:** the `openGraph` block originally specified here did not include `type`/`locale`/`siteName`. Code-quality review found Next.js shallow-merges `openGraph` objects between a layout and a page — since this page declares its own complete `openGraph` object, it fully replaced the root layout's `openGraph` object rather than merging into it, silently dropping the root layout's `type`/`locale`/`siteName`. The code block above already reflects the fix (those three fields added directly here); the original commit (`a05264f`) didn't have them, and a follow-up commit (`b136193`) added them — see the Deviations section at the end of this document.

---

### Task 14: Shop page OpenGraph

**Files:**
- Modify: `app/shop/page.tsx:12-15`

- [x] **Step 1: Update the metadata export**

Replace:

```tsx
export const metadata: Metadata = {
  title: "Shop All Products — LePlug Autocare",
  description: "Browse every car part, accessory, and detailing product LePlug Autocare carries.",
};
```

with:

```tsx
export const metadata: Metadata = {
  title: "Shop All Products — LePlug Autocare",
  description: "Browse every car part, accessory, and detailing product LePlug Autocare carries.",
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "LePlug Autocare",
    title: "Shop All Products — LePlug Autocare",
    description: "Browse every car part, accessory, and detailing product LePlug Autocare carries.",
    images: [{ url: "/images/og/default.jpg", width: 1200, height: 630 }],
  },
};
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/shop/page.tsx
git commit -m "feat: add OpenGraph metadata to shop page"
```

> **Deviation applied during execution:** same fix as Task 13 (see above) — `type`/`locale`/`siteName` added to this page's `openGraph` object via the same follow-up commit (`b136193`).

---

### Task 15: `app/sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`

- [x] **Step 1: Create the file**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/shop", "/about", "/contact", "/faq", "/privacy", "/terms", "/returns"];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/shop/${category.slug}`,
    lastModified: new Date(),
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: add dynamic sitemap.xml"
```

---

### Task 16: `app/robots.ts`

**Files:**
- Create: `app/robots.ts`

- [x] **Step 1: Create the file**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat: add robots.txt"
```

---

### Task 17: Final verification, footer link check, and docs update

**Files:**
- Modify: `docs/client-updates/phase-9-pages-seo-legal.md`

- [x] **Step 1: Run the full quality gate**

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Expect: all four pass clean (the pre-existing "Big Shoulders Stencil font override" build warning is not a regression, per Phase 8's baseline notes).

- [x] **Step 2: Start the dev server and manually verify every new/changed route**

```bash
npm run dev
```

Visit each of the following and confirm it renders on-brand (no default Next.js error styling, header/footer present, focus rings visible on Tab):

- `/about`
- `/contact` — submit the form with empty fields (inline errors appear), then with valid data (success message appears)
- `/faq`, `/faq#delivery`, `/faq#how-to-buy` (page scrolls to the right section and the section's `<details>` are independently openable)
- `/privacy`, `/terms`, `/returns` (each shows the `LegalNotice` banner)
- Any nonsense URL, e.g. `/this-page-does-not-exist` (shows the custom 404, not Next.js's default)
- `/sitemap.xml` (renders valid XML listing static pages, all categories, and all products)
- `/robots.txt` (lists the disallow rules and points at `/sitemap.xml`)

Also click every footer link (Information, Shop, Account, Contact & Social columns, and the Privacy/Terms/Returns bottom-bar links) to confirm none of them 404 anymore.

- [x] **Step 3: Update the client-facing phase doc**

In `docs/client-updates/phase-9-pages-seo-legal.md`, change the status line at the top from:

```
**Status: ⏳ Planned**
```

to:

```
**Status: ✅ Complete**
```

- [x] **Step 4: Commit**

```bash
git add docs/client-updates/phase-9-pages-seo-legal.md
git commit -m "docs: mark Phase 9 plan complete"
```

---

## Deviations from plan (discovered during execution)

**Execution mode: full subagent-driven-development, no fallback needed.** Unlike Phases 7 and 8 (where an Agent-tool auto-mode classifier blocked dispatch and forced a fallback to inline execution), every task group in this plan ran through the intended fresh-subagent-per-task pipeline (implementer → spec-compliance reviewer → code-quality reviewer) without interruption. Tasks were batched into 9 logical groups (matching related, low-risk files together — e.g. the three legal pages as one group, the three metadata edits as one group) rather than 17 individual dispatches, to keep review overhead proportionate to each group's actual risk; every group still got its own independent implementer and both review stages.

**Two real, code-quality-review-caught fixes were applied during execution — both to code, not to this plan's task specifications:**

1. **FAQ accordion (Task 7): Safari doesn't respect `list-none` on `<summary>`'s native marker.** `list-style: none` suppresses the default disclosure triangle in Chromium/Firefox, but WebKit renders it via the non-standard `::-webkit-details-marker` pseudo-element, which `list-style` doesn't touch — so Safari (desktop and iOS) would have shown both the default triangle and the custom "+" side by side. Fixed by adding `[&::-webkit-details-marker]:hidden` to the `<summary>` className in `app/faq/page.tsx` (commit `4e7ecf3`, "fix: hide Safari's default details marker on FAQ accordion"). The code block under Task 7 above already reflects this fix.

2. **Root layout + Home/Shop OpenGraph (Tasks 12-14): Next.js shallow-merges `openGraph` between a layout and a page.** Because `app/page.tsx` and `app/shop/page.tsx` each declare a complete `openGraph` object, Next.js's metadata merging fully replaces the root layout's `openGraph` object for those two pages rather than merging into it — silently dropping the root layout's `type: "website"`, `locale: "en_KE"`, and `siteName: "LePlug Autocare"` from Home's and Shop's rendered `<head>`. Fixed by duplicating those three fields directly into each page's own `openGraph` object (commit `b136193`, "fix: restore site-wide OpenGraph defaults on Home and Shop pages") — matching this codebase's established preference for self-contained per-page metadata over a shared abstraction (the same reasoning already applied to Privacy/Terms/Returns not sharing a `LegalSection` wrapper). The code blocks under Tasks 13-14 above already reflect this fix.

**One inaccuracy in this plan's own narrative, not a code defect:** the Architecture section above frames the 404 page's `font-stencil` "404" numeral as "the second sparing use" of that font (after `CheckoutSteps`). Code-quality review found this undercount — `font-stencil` was already in use in at least four other places by Phase 9 (SKU tags, a bestseller callout number, checkout step indicators, and order IDs) by the time this phase started. The 404 numeral itself was still judged on-brand and proportionate (an error-page numeral is a conventional, sparing use of exactly this kind of font, not a general heading), so no code changed — this note exists only to correct the plan's claim for anyone reading it later.

**No other deviations.** Every other task (constants, legal-notice component, About, Contact form/page, sitemap.ts, robots.ts) passed both spec-compliance and code-quality review with zero issues on the first pass, matching the plan's code blocks verbatim. Final verification (Task 17) confirmed: `npm test` (97/97 passing), `npm run lint` (clean), `npx tsc --noEmit` (clean), `npm run build` (succeeds, all 21 routes generated including `/sitemap.xml` and `/robots.txt`, only the pre-existing "Big Shoulders Stencil font override" warning carried from Phase 8's baseline). Manual browser verification confirmed: all new pages render on-brand; the Contact form's inline validation and success state both work; the FAQ accordion expands correctly and `/faq#delivery`/`/faq#how-to-buy` anchors resolve to the right sections; the custom 404 renders for an unmatched route with working Home/Shop links; every link on the homepage (including all footer links that previously 404'd) now resolves to 200; `/sitemap.xml` contains 56 correctly-formed entries with no disallowed paths; `/robots.txt` correctly disallows `/cart`, `/checkout`, `/account/` and points at the sitemap.
