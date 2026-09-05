import type { Address } from "@/lib/types";

export type DeliveryDetails = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
};

export type PaymentMethod = "mpesa" | "card" | "cod";

export const DELIVERY_ZONE_OPTIONS: {
  value: Address["zone"];
  label: string;
  description: string;
}[] = [
  {
    value: "nairobi_metro",
    label: "Nairobi Metro",
    description: "Delivery within Nairobi and immediate environs.",
  },
  {
    value: "outside_nairobi",
    label: "Outside Nairobi",
    description: "Delivery to the rest of Kenya.",
  },
];

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  { value: "mpesa", label: "M-Pesa", description: "Pay via M-Pesa STK push to your phone." },
  { value: "card", label: "Card", description: "Pay with Visa or Mastercard." },
  { value: "cod", label: "Cash on Delivery", description: "Pay in cash when your order arrives." },
];
