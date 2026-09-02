"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="bg-tarmac text-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="max-w-lg">
          <h2 className="font-heading text-2xl font-black sm:text-3xl">
            Know What&apos;s New First
          </h2>
          <p className="mt-1 text-sm text-savanna/70">
            New arrivals, restocks, and offers — straight to your inbox.
          </p>
          {submitted ? (
            <p className="mt-6 text-sm font-medium text-savanna">
              You&apos;re subscribed. Watch your inbox for new arrivals and deals.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-steel bg-savanna/5 px-3 py-2 text-sm text-savanna placeholder:text-savanna/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram sm:flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
