import { CarFront, Sofa, Wrench, SprayCan, Radio, LifeBuoy, Package } from "lucide-react";

/**
 * Renders the placeholder icon for a category directly, without exposing a
 * dynamically-selected component reference to callers. Use this (instead of
 * rendering `getCategoryIcon(...)` as a JSX tag) inside component bodies —
 * assigning a function's return value to a capitalized variable and using it
 * as `<Icon />` trips the `react-hooks/static-components` lint rule.
 */
export function CategoryPlaceholderIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  switch (category) {
    case "exterior":
      return <CarFront className={className} aria-hidden="true" />;
    case "interior":
      return <Sofa className={className} aria-hidden="true" />;
    case "performance-service-parts":
      return <Wrench className={className} aria-hidden="true" />;
    case "car-care-detailing":
      return <SprayCan className={className} aria-hidden="true" />;
    case "electronics-security":
      return <Radio className={className} aria-hidden="true" />;
    case "safety":
      return <LifeBuoy className={className} aria-hidden="true" />;
    default:
      return <Package className={className} aria-hidden="true" />;
  }
}
