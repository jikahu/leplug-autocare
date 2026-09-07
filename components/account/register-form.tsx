"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export function RegisterForm() {
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!email.trim()) nextErrors.email = "Enter your email.";
    if (!password.trim()) nextErrors.password = "Choose a password.";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords don't match.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const success = register(name.trim(), email.trim());
    if (!success) {
      setErrors({ form: "An account with that email already exists." });
      return;
    }
    setErrors({});
    router.push("/account/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      {errors.form && (
        <p role="alert" className="text-sm font-medium text-murram">
          {errors.form}{" "}
          <Link href="/account/login" className="underline">
            Log in
          </Link>
          .
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="register-name" className="text-sm font-medium text-tarmac">
          Full name
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.name && (
          <p id="register-name-error" className="text-xs text-murram">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="register-email" className="text-sm font-medium text-tarmac">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.email && (
          <p id="register-email-error" className="text-xs text-murram">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="register-password" className="text-sm font-medium text-tarmac">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.password && (
          <p id="register-password-error" className="text-xs text-murram">
            {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="register-confirm-password" className="text-sm font-medium text-tarmac">
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError("confirmPassword");
          }}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.confirmPassword && (
          <p id="register-confirm-password-error" className="text-xs text-murram">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <p className="text-xs text-tarmac/70">This is a demo account — no real password is stored.</p>

      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
