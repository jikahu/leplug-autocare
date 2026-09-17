"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type FormErrors = { name?: string; email?: string; message?: string };

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!email.trim()) {
      nextErrors.email = "Enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!message.trim()) nextErrors.message = "Write a message before sending.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-lg border border-acacia/40 bg-acacia/5 px-6 py-8 text-center"
      >
        <h3 className="font-heading text-lg font-bold text-tarmac">Message sent.</h3>
        <p className="mt-2 text-sm text-tarmac/70">
          Thanks for reaching out — we&rsquo;ll get back to you soon. For anything urgent, WhatsApp
          us directly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm font-medium text-murram">
          Fix the errors below before sending.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="contact-name" className="text-sm font-medium text-tarmac">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.name && (
          <p id="contact-name-error" className="text-xs text-murram">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="text-sm font-medium text-tarmac">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.email && (
          <p id="contact-email-error" className="text-xs text-murram">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="text-sm font-medium text-tarmac">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearFieldError("message");
          }}
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.message && (
          <p id="contact-message-error" className="text-xs text-murram">
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
}
