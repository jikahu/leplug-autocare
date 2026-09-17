import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { faqCategories, faqs } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: "FAQ — LePlug Autocare",
  description: "Answers to common questions about delivery, returns, payment, and warranty.",
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">
        Frequently Asked Questions
      </h1>
      <p className="mt-2 text-sm text-tarmac/70">
        Can&rsquo;t find what you&rsquo;re looking for?{" "}
        <a
          href="/contact"
          className="rounded-sm text-murram underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          Contact us
        </a>{" "}
        directly.
      </p>

      <div className="mt-8 space-y-10">
        {faqCategories.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <h2 className="font-heading text-xl font-bold text-tarmac">{category.label}</h2>
            <div className="mt-4 divide-y divide-steel/30 border-t border-steel/30">
              {faqs
                .filter((faq) => faq.category === category.id)
                .map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-sm font-medium text-tarmac [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram">
                      {faq.question}
                      <span
                        className="shrink-0 text-tarmac/70 transition-transform group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-tarmac/70">{faq.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
