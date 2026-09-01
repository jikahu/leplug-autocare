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
