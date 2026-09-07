import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service — LePlug Autocare",
  description: "The terms that govern your use of LePlug Autocare and any orders you place.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Terms of Service</h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Using This Site</h2>
          <p className="mt-2">
            By using LePlug Autocare, you agree to these terms. If you don&rsquo;t agree, please
            don&rsquo;t use the site. We may update these terms as the business evolves.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Orders &amp; Pricing</h2>
          <p className="mt-2">
            Prices are shown in Kenyan Shillings (KSh) and are treated as final and VAT-inclusive.
            Placing an order is an offer to buy — we&rsquo;ll confirm your order once it&rsquo;s placed.
            Occasionally a listed product may be mispriced or out of stock; if that happens, we&rsquo;ll
            contact you before processing the affected order.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. Payment</h2>
          <p className="mt-2">
            We accept M-Pesa, card, and cash on delivery, selected at checkout. Payment is due at the
            time of ordering, except for cash on delivery, which is paid on receipt of your order.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. Delivery</h2>
          <p className="mt-2">
            Delivery fees and timelines depend on your delivery zone — see our{" "}
            <a
              href="/faq#delivery"
              className="rounded-sm text-murram underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              delivery FAQ
            </a>{" "}
            for current rates. Delivery estimates are not guaranteed and may vary.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">
            5. Product Information &amp; Fitment
          </h2>
          <p className="mt-2">
            We do our best to list accurate compatibility information for each product. You&rsquo;re
            responsible for confirming fit for your specific vehicle before ordering — contact us if
            you&rsquo;re unsure.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">
            6. Trademarks &amp; Vehicle Make References
          </h2>
          <p className="mt-2">
            Vehicle manufacturer names and logos shown on this site are used only to describe part
            compatibility. LePlug Autocare is not an authorized dealer of, sponsored by, or
            affiliated with any vehicle manufacturer referenced on this site.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">7. Limitation of Liability</h2>
          <p className="mt-2">
            LePlug Autocare isn&rsquo;t liable for indirect or incidental damages arising from use of
            this site or its products, beyond what&rsquo;s required by Kenyan consumer protection law.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">8. Governing Law</h2>
          <p className="mt-2">These terms are governed by the laws of Kenya.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">9. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach us at{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="rounded-sm text-murram underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {BUSINESS_INFO.email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
