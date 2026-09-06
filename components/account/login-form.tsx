"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";

type FormErrors = { email?: string; password?: string; form?: string };

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email.";
    if (!password.trim()) nextErrors.password = "Enter your password.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const success = login(email.trim());
    if (!success) {
      setErrors({ form: "No account found with that email." });
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
          <Link href="/account/register" className="underline">
            Create an account
          </Link>
          .
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="login-email" className="text-sm font-medium text-tarmac">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.email && (
          <p id="login-email-error" className="text-xs text-murram">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="login-password" className="text-sm font-medium text-tarmac">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
          }}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.password && (
          <p id="login-password-error" className="text-xs text-murram">
            {errors.password}
          </p>
        )}
      </div>

      <p className="text-xs text-tarmac/60">
        This is a demo login — no real password is checked. Try{" "}
        <span className="font-medium text-tarmac">jane@example.com</span> to see an existing
        account, or{" "}
        <Link href="/account/register" className="underline">
          create a new one
        </Link>
        .
      </p>

      <Button type="submit" className="w-full">
        Log In
      </Button>
    </form>
  );
}
