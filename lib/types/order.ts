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
