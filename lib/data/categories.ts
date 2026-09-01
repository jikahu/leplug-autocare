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
