import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LegalNotice } from "@/components/legal/legal-notice";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — LePlug Autocare",
  description: "How LePlug Autocare collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Privacy Policy</h1>
      <div className="mt-6">
        <LegalNotice />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-tarmac/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">1. Introduction</h2>
          <p className="mt-2">
            This Privacy Policy explains how {BUSINESS_INFO.legalName} collects, uses, and protects
            information when you browse or shop with us. By using this site, you agree to the
            practices described here.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">2. Information We Collect</h2>
          <p className="mt-2">We collect information you provide directly, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account details — name and email, when you register or log in</li>
            <li>Delivery details — address, delivery zone, and phone number, when you check out</li>
            <li>Order history — items purchased, order totals, and order status</li>
            <li>Contact messages — anything you send us through the Contact page</li>
          </ul>
          <p className="mt-2">
            We also store your cart, wishlist, and account data locally in your browser so they
            persist between visits.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">3. How We Use Your Information</h2>
          <p className="mt-2">We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and deliver your orders</li>
            <li>Communicate with you about your orders or enquiries</li>
            <li>Maintain your account, cart, and wishlist</li>
            <li>Improve the products and experience we offer</li>
          </ul>
          <p className="mt-2">We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">4. Cookies &amp; Local Storage</h2>
          <p className="mt-2">
            We use your browser&rsquo;s local storage to keep your cart, wishlist, and login state
            between visits. This data stays on your device and isn&rsquo;t used for tracking or
            advertising.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">5. Data Sharing</h2>
          <p className="mt-2">
            We share order and delivery details with the payment and delivery partners needed to
            fulfil your order, and only to the extent required to do so. We don&rsquo;t share your
            information for any other party&rsquo;s marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">6. Your Rights</h2>
          <p className="mt-2">
            You can request a copy of the information we hold about you, ask us to correct it, or ask
            us to delete your account and associated data, by contacting us using the details below.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">7. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this policy as the site evolves. Material changes will be reflected here
            with an updated date.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-tarmac">8. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Reach us at{" "}
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-murram underline underline-offset-2"
            >
              {BUSINESS_INFO.email}
            </a>{" "}
            or via our{" "}
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
