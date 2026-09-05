"use client";

import { useState } from "react";
import { useCartStore, useCartHasHydrated } from "@/lib/store/cart";
import { useOrderStore } from "@/lib/store/orders";
import { products } from "@/lib/data/products";
import { getCartLines, getCartSubtotal } from "@/lib/utils/cart-lines";
import { deliveryFee } from "@/lib/utils/delivery-fee";
import { generateOrderId } from "@/lib/utils/generate-order-id";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutAddressStep } from "@/components/checkout/checkout-address-step";
import { CheckoutDeliveryStep } from "@/components/checkout/checkout-delivery-step";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { CheckoutReviewStep } from "@/components/checkout/checkout-review-step";
import { CheckoutConfirmation } from "@/components/checkout/checkout-confirmation";
import type { DeliveryDetails, PaymentMethod } from "@/components/checkout/types";
import type { Address, Order } from "@/lib/types";

export function CheckoutFlow() {
  const hasHydrated = useCartHasHydrated();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const placeOrder = useOrderStore((state) => state.placeOrder);

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<DeliveryDetails>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
  });
  const [zone, setZone] = useState<Address["zone"] | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!hasHydrated) {
    return null;
  }

  if (placedOrder) {
    return <CheckoutConfirmation order={placedOrder} />;
  }

  const lines = getCartLines(items, products);

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = getCartSubtotal(lines);
  const fee = zone ? deliveryFee(zone, subtotal) : 0;
  const total = subtotal + fee;

  function handlePlaceOrder() {
    if (!zone || !method) return;
    const order: Order = {
      id: generateOrderId(),
      userId: "guest",
      items,
      total,
      deliveryFee: fee,
      status: "processing",
      placedAt: new Date().toISOString(),
    };
    placeOrder(order);
    clearCart();
    setPlacedOrder(order);
  }

  return (
    <div className="space-y-8">
      <CheckoutSteps currentStep={step} />

      {step === 1 && (
        <CheckoutAddressStep details={details} onChange={setDetails} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <CheckoutDeliveryStep
          zone={zone}
          onChange={setZone}
          subtotal={subtotal}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <CheckoutPaymentStep
          method={method}
          onChangeMethod={setMethod}
          mpesaPhone={mpesaPhone}
          onChangeMpesaPhone={setMpesaPhone}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && zone && method && (
        <CheckoutReviewStep
          details={details}
          zone={zone}
          method={method}
          lines={lines}
          subtotal={subtotal}
          fee={fee}
          total={total}
          onBack={() => setStep(3)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}
