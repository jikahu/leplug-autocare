"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { DeliveryDetails } from "@/components/checkout/types";

type FormErrors = Partial<Record<keyof DeliveryDetails, string>>;

export function CheckoutAddressStep({
  details,
  onChange,
  onNext,
}: {
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<FormErrors>({});

  function clearFieldError(field: keyof DeliveryDetails) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function updateField(field: keyof DeliveryDetails, value: string) {
    onChange({ ...details, [field]: value });
    clearFieldError(field);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!details.fullName.trim()) nextErrors.fullName = "Enter your full name.";
    if (!details.phone.trim()) nextErrors.phone = "Enter a phone number we can reach you on.";
    if (!details.line1.trim()) nextErrors.line1 = "Enter your delivery address.";
    if (!details.city.trim()) nextErrors.city = "Enter your city or town.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Delivery Details</h2>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm font-medium text-murram">
          Fix the errors below before continuing.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="checkout-name" className="text-sm font-medium text-tarmac">
          Full name
        </label>
        <input
          id="checkout-name"
          type="text"
          value={details.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "checkout-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.fullName && (
          <p id="checkout-name-error" className="text-xs text-murram">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-phone" className="text-sm font-medium text-tarmac">
          Phone number
        </label>
        <input
          id="checkout-phone"
          type="tel"
          value={details.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.phone && (
          <p id="checkout-phone-error" className="text-xs text-murram">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-line1" className="text-sm font-medium text-tarmac">
          Address
        </label>
        <input
          id="checkout-line1"
          type="text"
          value={details.line1}
          onChange={(e) => updateField("line1", e.target.value)}
          placeholder="Street, building, apartment"
          aria-invalid={Boolean(errors.line1)}
          aria-describedby={errors.line1 ? "checkout-line1-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.line1 && (
          <p id="checkout-line1-error" className="text-xs text-murram">
            {errors.line1}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-line2" className="text-sm font-medium text-tarmac">
          Apartment, suite, etc. <span className="text-tarmac/70">(optional)</span>
        </label>
        <input
          id="checkout-line2"
          type="text"
          value={details.line2}
          onChange={(e) => updateField("line2", e.target.value)}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-city" className="text-sm font-medium text-tarmac">
          City / Town
        </label>
        <input
          id="checkout-city"
          type="text"
          value={details.city}
          onChange={(e) => updateField("city", e.target.value)}
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? "checkout-city-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.city && (
          <p id="checkout-city-error" className="text-xs text-murram">
            {errors.city}
          </p>
        )}
      </div>

      <Button type="submit">Continue to Delivery</Button>
    </form>
  );
}
