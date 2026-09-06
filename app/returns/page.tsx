import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy — LePlug Autocare",
  description: "How returns, exchanges, and refunds work at LePlug Autocare.",
};

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Returns & Refunds" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">
        Returns &amp; Refunds Policy
      </h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Return Window</h2>
          <p className="mt-2">
            You can return most items within 7 days of delivery, provided they&rsquo;re unused, in
            their original packaging, and in resellable condition.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Non-Returnable Items</h2>
          <p className="mt-2">
            Installed or used parts, opened consumables (fluids, sprays, fragrances), and items
            marked as final sale can&rsquo;t be returned unless they&rsquo;re faulty.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. Damaged or Incorrect Items</h2>
          <p className="mt-2">
            If your order arrives damaged or isn&rsquo;t what you ordered, contact us with your order
            number and a photo of the item as soon as you notice. We&rsquo;ll arrange a replacement or
            refund at no extra cost — this doesn&rsquo;t count against the standard return window.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. How to Start a Return</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Contact us with your order number and the reason for the return.</li>
            <li>We&rsquo;ll confirm whether the item qualifies and share return instructions.</li>
            <li>Once we receive and inspect the item, we&rsquo;ll process your refund or exchange.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">5. Refunds</h2>
          <p className="mt-2">
            Approved refunds are issued to your original payment method — M-Pesa, card, or as store
            credit for cash-on-delivery orders — typically within 5-7 business days of approval.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">6. Contact</h2>
          <p className="mt-2">
            To start a return, email{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-murram underline underline-offset-2"
            >
              {BUSINESS_INFO.email}
            </a>{" "}
            or use our{" "}
            <a href="/contact" className="text-murram underline underline-offset-2">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
