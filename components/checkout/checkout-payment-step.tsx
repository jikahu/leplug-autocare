"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_OPTIONS, type PaymentMethod } from "@/components/checkout/types";

export function CheckoutPaymentStep({
  method,
  onChangeMethod,
  mpesaPhone,
  onChangeMpesaPhone,
  onNext,
  onBack,
}: {
  method: PaymentMethod | null;
  onChangeMethod: (method: PaymentMethod) => void;
  mpesaPhone: string;
  onChangeMpesaPhone: (phone: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!method) {
      setError("Choose a payment method to continue.");
      return;
    }
    if (method === "mpesa" && !mpesaPhone.trim()) {
      setError("Enter the M-Pesa phone number to send the payment request to.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Payment Method</h2>
      {error && (
        <p role="alert" className="text-sm font-medium text-murram">
          {error}
        </p>
      )}

      <fieldset className="space-y-3">
        <legend className="sr-only">Choose a payment method</legend>
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
              method === option.value ? "border-murram bg-murram/5" : "border-steel/40"
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={option.value}
              checked={method === option.value}
              onChange={() => {
                onChangeMethod(option.value);
                setError(null);
              }}
              className="mt-1 accent-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            />
            <span>
              <span className="block font-medium text-tarmac">{option.label}</span>
              <span className="block text-sm text-tarmac/70">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === "mpesa" && (
        <div className="space-y-1">
          <label htmlFor="mpesa-phone" className="text-sm font-medium text-tarmac">
            M-Pesa phone number
          </label>
          <input
            id="mpesa-phone"
            type="tel"
            value={mpesaPhone}
            onChange={(e) => onChangeMpesaPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            className="w-full max-w-xs rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          />
        </div>
      )}

      {method === "card" && (
        <p className="text-sm text-tarmac/70">
          Card details would be collected securely here in a real checkout. No payment is
          processed in this demo.
        </p>
      )}

      {method === "cod" && (
        <p className="text-sm text-tarmac/70">
          Have the exact amount ready for the courier on delivery.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Review Order
        </Button>
      </div>
    </div>
  );
}
