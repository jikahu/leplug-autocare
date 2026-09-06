"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";

type FormErrors = { name?: string; email?: string };

export function ProfileForm() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  if (!currentUser) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!email.trim()) nextErrors.email = "Enter your email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateProfile({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Profile</h2>

      <div className="space-y-1">
        <label htmlFor="profile-name" className="text-sm font-medium text-tarmac">
          Full name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "profile-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.name && (
          <p id="profile-name-error" className="text-xs text-murram">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="profile-email" className="text-sm font-medium text-tarmac">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "profile-email-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.email && (
          <p id="profile-email-error" className="text-xs text-murram">
            {errors.email}
          </p>
        )}
      </div>

      <Button type="submit">Save Changes</Button>
      {saved && (
        <p role="status" className="text-sm font-medium text-acacia">
          Changes saved.
        </p>
      )}
    </form>
  );
}
