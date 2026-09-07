import type { Metadata } from "next";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us — LePlug Autocare",
  description: "Get in touch with LePlug Autocare — phone, WhatsApp, and location details.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-sm text-tarmac/70">
        Questions about a part, an order, or fit for your car? Reach us directly or send a message
        below.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Call us</p>
                <a
                  href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}
                  className="text-sm text-tarmac/70 hover:text-murram"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">WhatsApp</p>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace(/[^\d]/g, "")}`}
                  className="text-sm text-tarmac/70 hover:text-murram"
                >
                  {BUSINESS_INFO.whatsapp}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Location &amp; delivery area</p>
                <p className="text-sm text-tarmac/70">{BUSINESS_INFO.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-murram" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-tarmac">Hours</p>
                <p className="text-sm text-tarmac/70">{BUSINESS_INFO.hours}</p>
              </div>
            </div>
          </div>

          <div className="flex aspect-video items-center justify-center rounded-lg border border-steel/40 bg-tarmac/5 px-4 text-center text-sm text-tarmac/50">
            Map placeholder — {BUSINESS_INFO.address}
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
