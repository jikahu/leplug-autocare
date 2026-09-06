"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import type { Address } from "@/lib/types";

type AddressFormState = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  zone: Address["zone"];
};

const EMPTY_ADDRESS_FORM: AddressFormState = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  zone: "nairobi_metro",
};

export function AddressManager() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const addAddress = useAuthStore((state) => state.addAddress);
  const updateAddress = useAuthStore((state) => state.updateAddress);
  const removeAddress = useAuthStore((state) => state.removeAddress);

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [showForm, setShowForm] = useState(false);

  if (!currentUser) {
    return null;
  }

  function startAdd() {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setShowForm(true);
  }

  function startEdit(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      zone: address.zone,
    });
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!addressForm.label.trim() || !addressForm.line1.trim() || !addressForm.city.trim()) {
      return;
    }
    const payload = {
      label: addressForm.label.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim() || undefined,
      city: addressForm.city.trim(),
      zone: addressForm.zone,
    };
    if (editingAddressId) {
      updateAddress(editingAddressId, payload);
    } else {
      addAddress({ id: `address-${Date.now()}`, ...payload });
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-tarmac">Saved Addresses</h2>
        {!showForm && (
          <Button type="button" variant="outline" onClick={startAdd}>
            Add Address
          </Button>
        )}
      </div>

      {currentUser.addresses.length === 0 && !showForm && (
        <p className="text-sm text-tarmac/70">You haven&apos;t saved any addresses yet.</p>
      )}

      <ul className="space-y-3">
        {currentUser.addresses.map((address) => (
          <li
            key={address.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-steel/40 p-4 text-sm"
          >
            <div>
              <p className="font-medium text-tarmac">{address.label}</p>
              <p className="text-tarmac/70">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}
              </p>
              <p className="text-tarmac/60">
                {address.zone === "nairobi_metro" ? "Nairobi Metro" : "Outside Nairobi"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => startEdit(address)}>
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeAddress(address.id)}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-steel/40 p-4">
          <h3 className="font-medium text-tarmac">{editingAddressId ? "Edit Address" : "New Address"}</h3>

          <div className="space-y-1">
            <label htmlFor="address-label" className="text-sm font-medium text-tarmac">
              Label
            </label>
            <input
              id="address-label"
              type="text"
              value={addressForm.label}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Home, Work, etc."
              className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="address-line1" className="text-sm font-medium text-tarmac">
              Address
            </label>
            <input
              id="address-line1"
              type="text"
              value={addressForm.line1}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line1: e.target.value }))}
              placeholder="Street, building, apartment"
              className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="address-line2" className="text-sm font-medium text-tarmac">
              Apartment, suite, etc. <span className="text-tarmac/50">(optional)</span>
            </label>
            <input
              id="address-line2"
              type="text"
              value={addressForm.line2}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line2: e.target.value }))}
              className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="address-city" className="text-sm font-medium text-tarmac">
              City / Town
            </label>
            <input
              id="address-city"
              type="text"
              value={addressForm.city}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-tarmac">Delivery zone</legend>
            <label className="flex items-center gap-2 text-sm text-tarmac">
              <input
                type="radio"
                name="address-zone"
                checked={addressForm.zone === "nairobi_metro"}
                onChange={() => setAddressForm((prev) => ({ ...prev, zone: "nairobi_metro" }))}
                className="accent-murram"
              />
              Nairobi Metro
            </label>
            <label className="flex items-center gap-2 text-sm text-tarmac">
              <input
                type="radio"
                name="address-zone"
                checked={addressForm.zone === "outside_nairobi"}
                onChange={() => setAddressForm((prev) => ({ ...prev, zone: "outside_nairobi" }))}
                className="accent-murram"
              />
              Outside Nairobi
            </label>
          </fieldset>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingAddressId ? "Save Address" : "Add Address"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
