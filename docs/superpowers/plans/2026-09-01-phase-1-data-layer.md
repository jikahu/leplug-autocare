# Phase 1 — Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the CLAUDE.md §7 data model as TypeScript types, seed realistic mock data (~40-60 products across all 6 §6 categories, plus categories and reviews), and write the pure utility functions (`formatCurrency`, `filterProducts`, `sortProducts`, `deliveryFee`) that every later page/component will call — each covered by unit tests since these are pure functions with no UI dependency.

**Architecture:** Types live in `lib/types/` (one file per entity, re-exported from `lib/types/index.ts`). Mock data lives in `lib/data/` as plain exported arrays/constants (no fetch/async — this phase has no backend). Utility functions live in `lib/utils/<name>.ts` (sibling to shadcn's `lib/utils.ts`, reached via subpath imports like `@/lib/utils/format-currency`, never the bare `@/lib/utils` specifier which stays shadcn's `cn()`). Tests use Vitest (not yet installed — Task 1 adds it) with `*.test.ts` files colocated next to the code they test.

**Tech Stack:** TypeScript, Vitest (new dependency for this phase).

---

### Task 1: Install and configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [x] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [x] **Step 2: Add a minimal Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
  },
});
```

- [x] **Step 3: Add a `test` script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [x] **Step 4: Verify Vitest runs with zero tests**

Run: `npm test`

Expected: `No test files found` (or similar) — exits without crashing, confirming config is valid before any test files exist.

- [x] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest for testing pure utility functions"
```

---

### Task 2: Core types

**Files:**
- Create: `lib/types/product.ts`, `lib/types/category.ts`, `lib/types/review.ts`, `lib/types/user.ts`, `lib/types/cart.ts`, `lib/types/order.ts`
- Modify: `lib/types/index.ts`

- [x] **Step 1: Create `lib/types/product.ts`**

```ts
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  compatibleMakes?: string[];
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  keyFeatures: string[];
  stock: StockStatus;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
};
```

- [x] **Step 2: Create `lib/types/category.ts`**

```ts
export type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  subcategories: Subcategory[];
};
```

- [x] **Step 3: Create `lib/types/review.ts`**

```ts
export type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
};
```

- [x] **Step 4: Create `lib/types/user.ts`**

```ts
export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  zone: "nairobi_metro" | "outside_nairobi";
};

export type User = {
  id: string;
  name: string;
  email: string;
  addresses: Address[];
};
```

- [x] **Step 5: Create `lib/types/cart.ts`**

```ts
export type CartItem = {
  productId: string;
  quantity: number;
};
```

- [x] **Step 6: Create `lib/types/order.ts`**

```ts
import type { CartItem } from "./cart";

export type OrderStatus = "processing" | "shipped" | "delivered";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  placedAt: string;
};
```

- [x] **Step 7: Re-export everything from the barrel**

Replace `lib/types/index.ts` (currently just `export {};`):

```ts
export type { Product, StockStatus } from "./product";
export type { Category, Subcategory } from "./category";
export type { Review } from "./review";
export type { User, Address } from "./user";
export type { CartItem } from "./cart";
export type { Order, OrderStatus } from "./order";
```

- [x] **Step 8: Verify it compiles**

Run: `npx tsc --noEmit`

Expected: no errors.

- [x] **Step 9: Commit**

```bash
git add lib/types
git commit -m "feat: add core data model types per CLAUDE.md section 7"
```

---

### Task 3: `formatCurrency` utility (TDD)

**Files:**
- Create: `lib/utils/format-currency.ts`
- Test: `lib/utils/format-currency.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/format-currency.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it("formats whole numbers with KSh prefix and thousands separators", () => {
    expect(formatCurrency(4500)).toBe("KSh 4,500");
  });

  it("formats numbers under 1000 without a separator", () => {
    expect(formatCurrency(850)).toBe("KSh 850");
  });

  it("rounds fractional KES to the nearest whole shilling", () => {
    expect(formatCurrency(1299.6)).toBe("KSh 1,300");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("KSh 0");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/format-currency.test.ts`

Expected: FAIL — `Cannot find module './format-currency'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/format-currency.ts`:

```ts
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `KSh ${rounded.toLocaleString("en-KE")}`;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/format-currency.test.ts`

Expected: PASS (4/4).

- [x] **Step 5: Commit**

```bash
git add lib/utils/format-currency.ts lib/utils/format-currency.test.ts
git commit -m "feat: add formatCurrency utility"
```

---

### Task 4: `deliveryFee` utility (TDD)

**Files:**
- Create: `lib/utils/delivery-fee.ts`
- Test: `lib/utils/delivery-fee.test.ts`

Implements CLAUDE.md §10: Nairobi Metro = KSh 300, Outside Nairobi = KSh 600, free over KSh 5,000 subtotal.

- [x] **Step 1: Write the failing test**

Create `lib/utils/delivery-fee.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { deliveryFee } from "./delivery-fee";

describe("deliveryFee", () => {
  it("charges KSh 300 for Nairobi Metro under the free threshold", () => {
    expect(deliveryFee("nairobi_metro", 2000)).toBe(300);
  });

  it("charges KSh 600 for Outside Nairobi under the free threshold", () => {
    expect(deliveryFee("outside_nairobi", 2000)).toBe(600);
  });

  it("is free for Nairobi Metro at exactly the KSh 5,000 threshold", () => {
    expect(deliveryFee("nairobi_metro", 5000)).toBe(0);
  });

  it("is free for Outside Nairobi above the KSh 5,000 threshold", () => {
    expect(deliveryFee("outside_nairobi", 7500)).toBe(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/delivery-fee.test.ts`

Expected: FAIL — module not found.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/delivery-fee.ts`:

```ts
import type { Address } from "@/lib/types";

export const DELIVERY_ZONE_FEES: Record<Address["zone"], number> = {
  nairobi_metro: 300,
  outside_nairobi: 600,
};

export const FREE_DELIVERY_THRESHOLD = 5000;

export function deliveryFee(zone: Address["zone"], subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_ZONE_FEES[zone];
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/delivery-fee.test.ts`

Expected: PASS (4/4).

- [x] **Step 5: Commit**

```bash
git add lib/utils/delivery-fee.ts lib/utils/delivery-fee.test.ts
git commit -m "feat: add deliveryFee utility per CLAUDE.md section 10"
```

---

### Task 5: Category mock data

**Files:**
- Create: `lib/data/categories.ts`

- [x] **Step 1: Write the 6 top-level categories with subcategories**

Create `lib/data/categories.ts` (full content — all 6 categories from CLAUDE.md §6):

```ts
import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "exterior",
    name: "Exterior",
    slug: "exterior",
    description: "Car covers, lighting, spoilers, mud flaps, wind breakers, and wipers.",
    heroImage: "/images/categories/exterior.jpg",
    subcategories: [
      { id: "car-covers", name: "Car Covers", slug: "car-covers" },
      { id: "lighting", name: "Lighting", slug: "lighting" },
      { id: "spoilers", name: "Spoilers", slug: "spoilers" },
      { id: "mud-flaps", name: "Mud Flaps", slug: "mud-flaps" },
      { id: "wind-breakers", name: "Wind Breakers", slug: "wind-breakers" },
      { id: "wipers", name: "Wipers", slug: "wipers" },
    ],
  },
  {
    id: "interior",
    name: "Interior",
    slug: "interior",
    description: "Seat covers, floor mats, dashboard covers, organizers, steering covers, and car fragrance.",
    heroImage: "/images/categories/interior.jpg",
    subcategories: [
      { id: "seat-covers", name: "Seat Covers", slug: "seat-covers" },
      { id: "floor-mats", name: "Floor Mats", slug: "floor-mats" },
      { id: "dashboard-covers", name: "Dashboard Covers", slug: "dashboard-covers" },
      { id: "organizers", name: "Organizers", slug: "organizers" },
      { id: "steering-covers", name: "Steering Covers", slug: "steering-covers" },
      { id: "car-fragrance", name: "Car Fragrance", slug: "car-fragrance" },
    ],
  },
  {
    id: "performance-service-parts",
    name: "Performance & Service Parts",
    slug: "performance-service-parts",
    description: "Brake pads, oil filters, spark plugs, batteries, and bulbs.",
    heroImage: "/images/categories/performance-service-parts.jpg",
    subcategories: [
      { id: "brake-pads", name: "Brake Pads", slug: "brake-pads" },
      { id: "oil-filters", name: "Oil Filters", slug: "oil-filters" },
      { id: "spark-plugs", name: "Spark Plugs", slug: "spark-plugs" },
      { id: "batteries", name: "Batteries", slug: "batteries" },
      { id: "bulbs", name: "Bulbs", slug: "bulbs" },
    ],
  },
  {
    id: "car-care-detailing",
    name: "Car Care & Detailing",
    slug: "car-care-detailing",
    description: "Cleaning products, polish, tire shine, protection kits, and air fresheners.",
    heroImage: "/images/categories/car-care-detailing.jpg",
    subcategories: [
      { id: "cleaning-products", name: "Cleaning Products", slug: "cleaning-products" },
      { id: "polish", name: "Polish", slug: "polish" },
      { id: "tire-shine", name: "Tire Shine", slug: "tire-shine" },
      { id: "protection-kits", name: "Protection Kits", slug: "protection-kits" },
      { id: "air-fresheners", name: "Air Fresheners", slug: "air-fresheners" },
    ],
  },
  {
    id: "electronics-security",
    name: "Electronics & Security",
    slug: "electronics-security",
    description: "Dash cams, alarms, parking sensors, and car stereo/speakers.",
    heroImage: "/images/categories/electronics-security.jpg",
    subcategories: [
      { id: "dash-cams", name: "Dash Cams", slug: "dash-cams" },
      { id: "alarms", name: "Alarms", slug: "alarms" },
      { id: "parking-sensors", name: "Parking Sensors", slug: "parking-sensors" },
      { id: "car-stereo-speakers", name: "Car Stereo & Speakers", slug: "car-stereo-speakers" },
    ],
  },
  {
    id: "safety",
    name: "Safety",
    slug: "safety",
    description: "Jumper cables, reflectors, safety belts, and emergency kits.",
    heroImage: "/images/categories/safety.jpg",
    subcategories: [
      { id: "jumper-cables", name: "Jumper Cables", slug: "jumper-cables" },
      { id: "reflectors", name: "Reflectors", slug: "reflectors" },
      { id: "safety-belts", name: "Safety Belts", slug: "safety-belts" },
      { id: "emergency-kits", name: "Emergency Kits", slug: "emergency-kits" },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add lib/data/categories.ts
git commit -m "feat: add category mock data per CLAUDE.md section 6"
```

---

### Task 6: Product mock data generator

**Files:**
- Create: `lib/data/products.ts`

Rather than hand-writing 50 product literals (unmaintainable and error-prone to type out by hand), this task builds the product list from small per-category templates expanded with a deterministic generator — still fully static data (no runtime randomness), just less repetition. 42 products total across the 6 categories.

- [x] **Step 1: Create `lib/data/products.ts`**

```ts
import type { Product } from "@/lib/types";

const VEHICLE_MAKES = ["Toyota", "Subaru", "Nissan", "Mazda", "Mitsubishi", "Ford"];

type ProductSeed = {
  name: string;
  subcategory: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  makes?: string[];
  tags?: Product["tags"];
  stock?: Product["stock"];
  rating?: number;
  reviewCount?: number;
  features: string[];
  description: string;
};

const SEEDS: Record<string, ProductSeed[]> = {
  exterior: [
    { name: "All-Weather Car Cover (Sedan)", subcategory: "car-covers", brand: "ShieldPro", price: 3200, features: ["UV-resistant polyester", "Elastic hem for a snug fit", "Machine washable"], description: "Full-body protection from sun, dust, and rain for sedans parked outdoors.", stock: "in_stock", rating: 4.5, reviewCount: 18 },
    { name: "LED Fog Light Kit", subcategory: "lighting", brand: "BrightBeam", price: 4500, compareAtPrice: 5500, makes: ["Toyota", "Subaru"], tags: ["Sale"], features: ["6000K white LED", "Plug-and-play harness", "IP67 waterproof"], description: "Bright, focused fog lighting for low-visibility driving conditions.", stock: "in_stock", rating: 4.7, reviewCount: 31 },
    { name: "Sport Rear Spoiler", subcategory: "spoilers", brand: "AeroForm", price: 8900, makes: ["Nissan", "Mazda"], features: ["ABS plastic construction", "Paint-ready primer finish", "Includes mounting hardware"], description: "A subtle aerodynamic addition that sharpens the rear profile.", stock: "low_stock", rating: 4.2, reviewCount: 9 },
    { name: "Heavy-Duty Mud Flaps (Set of 4)", subcategory: "mud-flaps", brand: "TerraGuard", price: 1800, features: ["Flexible rubber compound", "No-drill mounting", "Fits most sedans and SUVs"], description: "Keeps mud and road spray off your paintwork on Nairobi's unpaved roads.", stock: "in_stock", rating: 4.4, reviewCount: 22 },
    { name: "Wind Deflector Set (Front Windows)", subcategory: "wind-breakers", brand: "ClearAir", price: 2600, features: ["Smoke-tint acrylic", "3M adhesive mount", "Reduces cabin wind noise"], description: "Crack your windows for airflow without the wind noise or rain.", stock: "in_stock", rating: 4.1, reviewCount: 14 },
    { name: "Frameless Wiper Blades (Pair)", subcategory: "wipers", brand: "ClearView", price: 1500, tags: ["Bestseller"], features: ["Aerodynamic frameless design", "All-season silicone edge", "Universal J-hook adapter"], description: "Streak-free wiping in Nairobi's rainy season.", stock: "in_stock", rating: 4.6, reviewCount: 47 },
    { name: "Bonnet Bra Protector", subcategory: "car-covers", brand: "ShieldPro", price: 2900, makes: ["Toyota"], features: ["Scratch-resistant vinyl", "Adjustable straps", "Custom sedan fit"], description: "Protects your bonnet's paint from chips on long highway drives.", stock: "in_stock", rating: 4.1, reviewCount: 10 },
  ],
  interior: [
    { name: "Premium Leatherette Seat Covers (Full Set)", subcategory: "seat-covers", brand: "LuxeFit", price: 12500, makes: ["Toyota", "Nissan"], tags: ["Bestseller"], features: ["Water-resistant leatherette", "Airbag-compatible design", "Fits 5-seater sedans"], description: "A full interior refresh with a premium leather look and easy-clean surface.", stock: "in_stock", rating: 4.8, reviewCount: 63 },
    { name: "3D Molded Floor Mats", subcategory: "floor-mats", brand: "TerraGuard", price: 4200, makes: ["Subaru", "Mazda"], features: ["Raised edges trap mud and water", "Odorless TPE material", "Custom-fit per model"], description: "Full coverage floor protection built for Nairobi's rainy commutes.", stock: "in_stock", rating: 4.6, reviewCount: 38 },
    { name: "Carbon-Fiber Dashboard Cover", subcategory: "dashboard-covers", brand: "AeroForm", price: 3100, features: ["Anti-glare matte finish", "UV-protective layer", "No-drill adhesive install"], description: "Cuts dashboard glare and protects against sun damage.", stock: "in_stock", rating: 4.0, reviewCount: 11 },
    { name: "Backseat Organizer with Tablet Holder", subcategory: "organizers", brand: "TidyRide", price: 2200, tags: ["New"], features: ["Multiple storage pockets", "Adjustable tablet mount", "Waterproof lining"], description: "Keeps the back seat tidy on longer family trips.", stock: "in_stock", rating: 4.3, reviewCount: 7 },
    { name: "Suede Steering Wheel Cover", subcategory: "steering-covers", brand: "GripTech", price: 1600, features: ["Non-slip suede grip", "Breathable microfiber lining", "Fits 36-38cm wheels"], description: "A better grip and a premium feel on every drive.", stock: "in_stock", rating: 4.4, reviewCount: 25 },
    { name: "Car Fragrance Set (4 Scents)", subcategory: "car-fragrance", brand: "PureAir", price: 950, tags: ["Bestseller"], features: ["Long-lasting vent clips", "4 scent variety pack", "Adjustable intensity"], description: "Keep the cabin smelling fresh on every drive.", stock: "in_stock", rating: 4.5, reviewCount: 54 },
    { name: "Memory Foam Lumbar Cushion", subcategory: "seat-covers", brand: "LuxeFit", price: 2400, features: ["Ergonomic lumbar support", "Breathable mesh cover", "Adjustable strap mount"], description: "Reduces back fatigue on long drives or daily traffic.", stock: "low_stock", rating: 4.2, reviewCount: 16 },
  ],
  "performance-service-parts": [
    { name: "Ceramic Brake Pads (Front Set)", subcategory: "brake-pads", brand: "StopSure", price: 5400, makes: ["Toyota", "Nissan"], tags: ["Bestseller"], features: ["Low-dust ceramic compound", "Reduced brake noise", "OEM fitment"], description: "Reliable stopping power with less brake dust on your rims.", stock: "in_stock", rating: 4.7, reviewCount: 41 },
    { name: "High-Flow Oil Filter", subcategory: "oil-filters", brand: "FlowMax", price: 850, makes: ["Toyota", "Subaru", "Mazda"], features: ["Anti-drainback valve", "High dirt-holding capacity", "Fits most 4-cylinder engines"], description: "Keeps engine oil clean between service intervals.", stock: "in_stock", rating: 4.5, reviewCount: 29 },
    { name: "Iridium Spark Plugs (Set of 4)", subcategory: "spark-plugs", brand: "IgniPro", price: 3600, makes: ["Toyota", "Mitsubishi"], features: ["Iridium center electrode", "Improved fuel efficiency", "100,000km rated lifespan"], description: "Smoother idling and better fuel economy from a cleaner spark.", stock: "in_stock", rating: 4.6, reviewCount: 33 },
    { name: "Maintenance-Free Car Battery 12V 65Ah", subcategory: "batteries", brand: "VoltCore", price: 9800, tags: ["Bestseller"], features: ["Sealed maintenance-free design", "2-year warranty", "High cold-cranking amps"], description: "Dependable starting power, even on cold mornings.", stock: "in_stock", rating: 4.8, reviewCount: 52 },
    { name: "LED Headlight Bulbs H4 (Pair)", subcategory: "bulbs", brand: "BrightBeam", price: 3400, compareAtPrice: 4200, tags: ["Sale"], features: ["6500K daylight white", "Plug-and-play CANbus ready", "50,000-hour lifespan"], description: "A brighter, whiter upgrade over stock halogen bulbs.", stock: "in_stock", rating: 4.4, reviewCount: 27 },
    { name: "Performance Air Filter", subcategory: "oil-filters", brand: "FlowMax", price: 2100, makes: ["Nissan", "Ford"], features: ["Washable and reusable", "Increased airflow", "Direct OEM replacement"], description: "A reusable upgrade that improves throttle response.", stock: "out_of_stock", rating: 4.1, reviewCount: 8 },
  ],
  "car-care-detailing": [
    { name: "Premium Car Shampoo (1L)", subcategory: "cleaning-products", brand: "ShineWorks", price: 1200, tags: ["Bestseller"], features: ["pH-balanced formula", "Rich foam, safe on wax", "Concentrated — up to 40 washes"], description: "A gentle, high-foam wash that won't strip existing wax.", stock: "in_stock", rating: 4.7, reviewCount: 66 },
    { name: "Carnauba Wax Polish (500ml)", subcategory: "polish", brand: "ShineWorks", price: 2400, features: ["Deep gloss carnauba blend", "UV protection layer", "Lasts up to 3 months"], description: "A show-quality shine with lasting weather protection.", stock: "in_stock", rating: 4.6, reviewCount: 34 },
    { name: "Tire Shine Gel (500ml)", subcategory: "tire-shine", brand: "ShineWorks", price: 950, features: ["Long-lasting matte-to-gloss finish", "No sling formula", "UV-resistant"], description: "A rich, non-greasy shine that resists flinging onto your paint.", stock: "in_stock", rating: 4.3, reviewCount: 19 },
    { name: "Complete Detailing Kit (8-Piece)", subcategory: "protection-kits", brand: "DetailPro", price: 6500, tags: ["New"], features: ["Shampoo, wax, microfiber towels, applicator pads", "All-in-one storage case", "Suitable for full exterior + interior detailing"], description: "Everything needed for a full weekend detailing session.", stock: "in_stock", rating: 4.5, reviewCount: 12 },
    { name: "Ceramic Paint Sealant (250ml)", subcategory: "protection-kits", brand: "DetailPro", price: 4800, features: ["9H hardness ceramic coating", "Hydrophobic finish", "Up to 6 months protection"], description: "Long-term paint protection with an easy DIY application.", stock: "low_stock", rating: 4.4, reviewCount: 15 },
    { name: "Vent-Clip Air Freshener (Citrus)", subcategory: "air-fresheners", brand: "PureAir", price: 450, features: ["30-day scent release", "Adjustable fragrance intensity", "Discreet vent-clip design"], description: "A clean citrus scent that doesn't overpower the cabin.", stock: "in_stock", rating: 4.2, reviewCount: 21 },
  ],
  "electronics-security": [
    { name: "1080p Dual Dash Cam", subcategory: "dash-cams", brand: "ViewGuard", price: 7200, tags: ["Bestseller"], features: ["Front and rear 1080p recording", "Night vision sensor", "Loop recording with G-sensor"], description: "Front and rear coverage for evidence you can trust.", stock: "in_stock", rating: 4.6, reviewCount: 44 },
    { name: "Car Alarm & Immobilizer System", subcategory: "alarms", brand: "SecureDrive", price: 5600, makes: ["Toyota", "Subaru", "Nissan"], features: ["Remote arm/disarm", "Shock sensor with adjustable sensitivity", "Engine immobilizer relay"], description: "An extra layer of theft deterrence for street parking.", stock: "in_stock", rating: 4.5, reviewCount: 23 },
    { name: "Rear Parking Sensor Kit (4 Sensors)", subcategory: "parking-sensors", brand: "SecureDrive", price: 3900, features: ["4-sensor rear coverage", "In-cabin audio + display alert", "Simple bumper-mount install"], description: "Confident reversing in tight Nairobi parking spots.", stock: "in_stock", rating: 4.3, reviewCount: 17 },
    { name: "Bluetooth Car Stereo (Double-DIN)", subcategory: "car-stereo-speakers", brand: "SoundDrive", price: 8900, tags: ["New"], features: ["Bluetooth + USB + AUX input", "7-inch touchscreen display", "Steering wheel control compatible"], description: "Modern connectivity for older stereo units.", stock: "in_stock", rating: 4.4, reviewCount: 13 },
    { name: "6.5-inch Coaxial Speakers (Pair)", subcategory: "car-stereo-speakers", brand: "SoundDrive", price: 4200, features: ["Full-range coaxial design", "Easy factory mount replacement", "Balanced mid and treble response"], description: "A clear upgrade over factory-standard door speakers.", stock: "in_stock", rating: 4.5, reviewCount: 20 },
  ],
  safety: [
    { name: "Heavy-Duty Jumper Cables (3m)", subcategory: "jumper-cables", brand: "VoltCore", price: 1800, tags: ["Bestseller"], features: ["Copper-clad aluminum core", "Insulated color-coded clamps", "500A peak capacity"], description: "Reliable jump-starts without the guesswork.", stock: "in_stock", rating: 4.6, reviewCount: 36 },
    { name: "Reflective Warning Triangles (Set of 2)", subcategory: "reflectors", brand: "SafeRoad", price: 900, features: ["High-visibility reflective panels", "Foldable for compact storage", "Meets standard road safety specs"], description: "Essential roadside visibility for breakdowns at night.", stock: "in_stock", rating: 4.4, reviewCount: 18 },
    { name: "Adjustable Safety Seat Belt Extender", subcategory: "safety-belts", brand: "SafeRoad", price: 650, features: ["Universal buckle fit", "Reinforced webbing", "Easy snap-in install"], description: "A comfortable, secure fit for every passenger.", stock: "in_stock", rating: 4.0, reviewCount: 6 },
    { name: "Roadside Emergency Kit (22-Piece)", subcategory: "emergency-kits", brand: "SafeRoad", price: 3200, tags: ["New"], features: ["Jumper cables, tow rope, gloves, first aid basics", "Compact storage bag", "Reflective vest included"], description: "One kit covering the essentials for common roadside issues.", stock: "in_stock", rating: 4.5, reviewCount: 14 },
    { name: "Portable Tire Inflator (12V)", subcategory: "emergency-kits", brand: "VoltCore", price: 4500, features: ["Digital pressure gauge", "12V cigarette lighter plug", "LED work light"], description: "Top up tire pressure anywhere, no compressor needed.", stock: "low_stock", rating: 4.3, reviewCount: 22 },
  ],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const products: Product[] = Object.entries(SEEDS).flatMap(([category, seeds]) =>
  seeds.map((seed, index) => {
    const slug = slugify(seed.name);
    return {
      id: `${category}-${index + 1}`,
      slug,
      sku: `LP-${category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      name: seed.name,
      category,
      subcategory: seed.subcategory,
      compatibleMakes: seed.makes,
      brand: seed.brand,
      price: seed.price,
      compareAtPrice: seed.compareAtPrice,
      images: [`/images/products/${slug}.jpg`],
      description: seed.description,
      keyFeatures: seed.features,
      stock: seed.stock ?? "in_stock",
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      tags: seed.tags,
    };
  })
);

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export const ALL_VEHICLE_MAKES = VEHICLE_MAKES;
```

- [x] **Step 2: Verify the product count and compile**

Run:

```bash
npx tsc --noEmit
node -e "const {products}=require('./lib/data/products.ts')" 2>&1 || npx tsx -e "import('./lib/data/products.ts').then(m => console.log(m.products.length))"
```

Expected: no TypeScript errors; product count logs as 36 (7+7+6+6+5+5 across the six categories — just below the 40-60 target, so Step 3 tops it up).

- [x] **Step 3: Add more seeds to reach 40-60 total**

Add 6-10 more seeds distributed across categories with the lowest counts (`car-care-detailing`, `electronics-security`, `safety` each currently have 5-6) — for example, add these three to `car-care-detailing`:

```ts
{ name: "Interior Trim Cleaner (500ml)", subcategory: "cleaning-products", brand: "ShineWorks", price: 1100, features: ["Anti-static formula", "UV-fade protection for plastics", "Streak-free finish"], description: "Restores faded interior plastics without a greasy residue.", stock: "in_stock", rating: 4.3, reviewCount: 12 },
{ name: "Glass Cleaner (500ml)", subcategory: "cleaning-products", brand: "ShineWorks", price: 700, tags: ["Bestseller"], features: ["Ammonia-free formula", "Streak-free on tinted windows", "Anti-fog additive"], description: "A safe, streak-free clean for windshields and tinted glass.", stock: "in_stock", rating: 4.5, reviewCount: 28 },
{ name: "Leather Conditioner (250ml)", subcategory: "polish", brand: "DetailPro", price: 1900, features: ["UV-protective conditioning oils", "Restores suppleness to worn leather", "Non-greasy finish"], description: "Keeps leather seats supple and crack-free in Nairobi's sun.", stock: "in_stock", rating: 4.4, reviewCount: 17 },
```

and these two to `electronics-security`:

```ts
{ name: "Steering Wheel Lock", subcategory: "alarms", brand: "SecureDrive", price: 2200, features: ["High-visibility red finish", "Hardened steel bar", "Universal steering wheel fit"], description: "A visible theft deterrent for street parking overnight.", stock: "in_stock", rating: 4.2, reviewCount: 15 },
{ name: "GPS Vehicle Tracker", subcategory: "alarms", brand: "ViewGuard", price: 6800, tags: ["New"], makes: ["Toyota", "Nissan"], features: ["Real-time location via app", "Geofence alerts", "Hidden wiring install"], description: "Track your vehicle's location in real time from your phone.", stock: "in_stock", rating: 4.6, reviewCount: 9 },
```

and this one to `safety`:

```ts
{ name: "Fire Extinguisher (1kg, Car-Mount)", subcategory: "emergency-kits", brand: "SafeRoad", price: 2100, features: ["ABC dry powder type", "Compact car-mount bracket", "Pressure gauge indicator"], description: "A compact, mountable extinguisher sized for car interiors.", stock: "in_stock", rating: 4.5, reviewCount: 11 },
```

This brings the total to 42 products.

- [x] **Step 5: Verify final count and compile**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 6: Commit**

```bash
git add lib/data/products.ts
git commit -m "feat: add 42 mock products across all 6 categories"
```

---

### Task 7: Review mock data

**Files:**
- Create: `lib/data/reviews.ts`

- [x] **Step 1: Create reviews for a representative subset of products**

Create `lib/data/reviews.ts` — not every product needs reviews (some products should legitimately show "no reviews yet" per the empty-state pattern), so this seeds reviews for roughly two-thirds of products, 1-4 reviews each:

```ts
import type { Review } from "@/lib/types";
import { products } from "./products";

const SAMPLE_COMMENTS = [
  "Exactly as described, fits perfectly and arrived quickly.",
  "Good quality for the price. Would buy again.",
  "Installation was straightforward, no issues so far after a month of use.",
  "Does the job well, though packaging could be better.",
  "Great value — noticeably better than the one I had before.",
  "Solid build quality, feels durable.",
  "Works well but took a few days longer to arrive than expected.",
  "Very happy with this purchase, highly recommend.",
];

const SAMPLE_NAMES = [
  "Wanjiku M.", "Brian K.", "Achieng O.", "Kevin M.", "Faith N.",
  "Dennis O.", "Njeri W.", "Samuel K.", "Mercy A.", "Peter G.",
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const reviews: Review[] = products.flatMap((product, productIndex) => {
  const shouldHaveReviews = productIndex % 3 !== 0;
  if (!shouldHaveReviews) return [];

  const count = 1 + Math.floor(pseudoRandom(productIndex) * 4);
  return Array.from({ length: count }, (_, i) => {
    const seed = productIndex * 10 + i;
    const rating = 3 + Math.floor(pseudoRandom(seed) * 3);
    return {
      id: `${product.id}-review-${i + 1}`,
      productId: product.id,
      userName: SAMPLE_NAMES[Math.floor(pseudoRandom(seed + 1) * SAMPLE_NAMES.length)],
      rating,
      comment: SAMPLE_COMMENTS[Math.floor(pseudoRandom(seed + 2) * SAMPLE_COMMENTS.length)],
      date: new Date(2026, Math.floor(pseudoRandom(seed + 3) * 8), 1 + Math.floor(pseudoRandom(seed + 4) * 27)).toISOString().slice(0, 10),
      verifiedPurchase: pseudoRandom(seed + 5) > 0.3,
    };
  });
});

export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add lib/data/reviews.ts
git commit -m "feat: add mock review data for two-thirds of products"
```

---

### Task 8: `filterProducts` utility (TDD)

**Files:**
- Create: `lib/utils/filter-products.ts`
- Test: `lib/utils/filter-products.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/filter-products.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/types";
import { filterProducts } from "./filter-products";

const sample: Product[] = [
  { id: "1", slug: "a", sku: "A1", name: "Brake Pads", category: "performance-service-parts", brand: "StopSure", price: 5000, images: [], description: "", keyFeatures: [], stock: "in_stock", compatibleMakes: ["Toyota"] },
  { id: "2", slug: "b", sku: "B1", name: "Seat Covers", category: "interior", brand: "LuxeFit", price: 12000, images: [], description: "", keyFeatures: [], stock: "in_stock", compatibleMakes: ["Subaru"] },
  { id: "3", slug: "c", sku: "C1", name: "Floor Mats", category: "interior", brand: "TerraGuard", price: 4000, images: [], description: "", keyFeatures: [], stock: "out_of_stock", compatibleMakes: ["Toyota"] },
];

describe("filterProducts", () => {
  it("filters by category", () => {
    expect(filterProducts(sample, { category: "interior" }).map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("filters by brand", () => {
    expect(filterProducts(sample, { brand: "LuxeFit" }).map((p) => p.id)).toEqual(["2"]);
  });

  it("filters by vehicle make", () => {
    expect(filterProducts(sample, { make: "Toyota" }).map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("filters by price range", () => {
    expect(filterProducts(sample, { minPrice: 4500, maxPrice: 12000 }).map((p) => p.id)).toEqual(["1", "2"]);
  });

  it("combines multiple filters with AND semantics", () => {
    expect(filterProducts(sample, { category: "interior", make: "Toyota" }).map((p) => p.id)).toEqual(["3"]);
  });

  it("returns all products when no filters are given", () => {
    expect(filterProducts(sample, {})).toHaveLength(3);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/filter-products.test.ts` — expect module-not-found failure.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/filter-products.ts`:

```ts
import type { Product } from "@/lib/types";

export type ProductFilters = {
  category?: string;
  subcategory?: string;
  brand?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.subcategory && product.subcategory !== filters.subcategory) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.make && !product.compatibleMakes?.includes(filters.make)) return false;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    return true;
  });
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/filter-products.test.ts` — expect PASS (6/6).

- [x] **Step 5: Commit**

```bash
git add lib/utils/filter-products.ts lib/utils/filter-products.test.ts
git commit -m "feat: add filterProducts utility"
```

---

### Task 9: `sortProducts` utility (TDD)

**Files:**
- Create: `lib/utils/sort-products.ts`
- Test: `lib/utils/sort-products.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/sort-products.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/types";
import { sortProducts } from "./sort-products";

const sample: Product[] = [
  { id: "1", slug: "a", sku: "A1", name: "A", category: "x", price: 3000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 4.2, tags: [] },
  { id: "2", slug: "b", sku: "B1", name: "B", category: "x", price: 1000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 4.8, tags: ["Bestseller"] },
  { id: "3", slug: "c", sku: "C1", name: "C", category: "x", price: 2000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 3.9, tags: ["New"] },
];

describe("sortProducts", () => {
  it("sorts price low to high", () => {
    expect(sortProducts(sample, "price-asc").map((p) => p.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts price high to low", () => {
    expect(sortProducts(sample, "price-desc").map((p) => p.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by rating descending", () => {
    expect(sortProducts(sample, "rating").map((p) => p.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts bestselling first (tagged Bestseller)", () => {
    expect(sortProducts(sample, "bestselling")[0].id).toBe("2");
  });

  it("does not mutate the input array", () => {
    const copy = [...sample];
    sortProducts(sample, "price-asc");
    expect(sample).toEqual(copy);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/sort-products.test.ts` — expect module-not-found failure.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/sort-products.ts`:

```ts
import type { Product } from "@/lib/types";

export type SortOption = "price-asc" | "price-desc" | "newest" | "bestselling" | "rating";

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "bestselling":
      return copy.sort((a, b) => {
        const aBestseller = a.tags?.includes("Bestseller") ? 1 : 0;
        const bBestseller = b.tags?.includes("Bestseller") ? 1 : 0;
        return bBestseller - aBestseller;
      });
    case "newest":
      return copy.sort((a, b) => {
        const aNew = a.tags?.includes("New") ? 1 : 0;
        const bNew = b.tags?.includes("New") ? 1 : 0;
        return bNew - aNew;
      });
    default:
      return copy;
  }
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/sort-products.test.ts` — expect PASS (5/5).

- [x] **Step 5: Commit**

```bash
git add lib/utils/sort-products.ts lib/utils/sort-products.test.ts
git commit -m "feat: add sortProducts utility"
```

---

### Task 10: Full verification gate

**Files:** none (verification only)

- [x] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all test files pass (format-currency, delivery-fee, filter-products, sort-products — 19 tests total).

- [x] **Step 2: Run lint**

Run: `npm run lint` — expect no errors.

- [x] **Step 3: Run typecheck**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Verify product/category/review data is internally consistent**

Run:

```bash
npx tsx -e "
import('./lib/data/products.ts').then(async ({ products }) => {
  const { categories } = await import('./lib/data/categories.ts');
  const categoryIds = new Set(categories.map(c => c.id));
  const orphans = products.filter(p => !categoryIds.has(p.category));
  console.log('product count:', products.length);
  console.log('orphaned category refs:', orphans.length);
})
"
```

Expected: `product count: 42`, `orphaned category refs: 0`. If `tsx` isn't available, install it as a dev dependency first: `npm install -D tsx`.

- [x] **Step 5: Commit any fixes found**

```bash
git add -A
git commit -m "fix: resolve issues found in Phase 1 verification gate"
```

(Skip if Steps 1-4 were already clean.)

---

## Definition of done for Phase 1

- [x] All six type files exist and re-export cleanly from `lib/types/index.ts`
- [x] 42 products exist across all 6 categories, each with a valid `category` id
- [x] Reviews exist for roughly two-thirds of products
- [x] `formatCurrency`, `deliveryFee`, `filterProducts`, `sortProducts` are all implemented and unit-tested
- [x] `npm test`, `npm run lint`, and `npx tsc --noEmit` all pass clean
- [x] One commit per task above

## Deviations from plan (discovered during execution)

- Vitest is v4 in this project, not the older version assumed when drafting — `defineConfig`'s native (non-Vite-bundled) config loader flagged CommonJS/`__dirname` usage as deprecated. Fixed by naming the config `vitest.config.mts` (explicit ESM) and using `import.meta.dirname` instead of `path.resolve(__dirname, ".")`.
- Corrected the product count math before executing Task 6: the seed data as written totals 36 base + 6 added = 42 products, not 46 as originally estimated in the plan draft — fixed throughout the plan text before writing any code, so no code changed as a result.
- `node --experimental-strip-types` (Node 22's native TS loader) can't resolve extensionless relative imports (`./products`) the way Next.js/Vitest's bundler-style resolution does — it only worked for the `lib/data/reviews.ts` sanity check when run through Vitest instead of directly through Node.
