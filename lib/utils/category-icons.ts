import { CarFront, Sofa, Wrench, SprayCan, Radio, LifeBuoy, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  exterior: CarFront,
  interior: Sofa,
  "performance-service-parts": Wrench,
  "car-care-detailing": SprayCan,
  "electronics-security": Radio,
  safety: LifeBuoy,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? Package;
}
