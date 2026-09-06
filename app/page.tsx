import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryTiles } from "@/components/home/category-tiles";
import { BestsellersRail } from "@/components/home/bestsellers-rail";
import { VehicleMakeStrip } from "@/components/home/vehicle-make-strip";
import { TrustSignals } from "@/components/home/trust-signals";
import { NewsletterSignup } from "@/components/home/newsletter-signup";

export const metadata: Metadata = {
  title: "LePlug Autocare — Premium Car Care in Nairobi",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
  openGraph: {
    title: "LePlug Autocare — Premium Car Care in Nairobi",
    description:
      "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
    images: [{ url: "/images/og/default.jpg", width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryTiles />
      <BestsellersRail />
      <VehicleMakeStrip />
      <TrustSignals />
      <NewsletterSignup />
    </main>
  );
}
