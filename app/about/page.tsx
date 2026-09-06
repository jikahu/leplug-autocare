import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us — LePlug Autocare",
  description: "Why LePlug Autocare exists, and what to expect when you shop with us.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "About" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">About LePlug Autocare</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-tarmac/80">
        <p>
          LePlug Autocare started with a simple frustration: buying car parts and care products in
          Nairobi meant either haggling at a physical shop that may or may not have what you need in
          stock, or scrolling through a cluttered website built more like a catalogue than a store.
          We built LePlug to be the plug — the one place that actually has what your car needs, sold
          the way a premium retailer should sell it.
        </p>
        <p>
          The name is deliberate. In Nairobi, your &ldquo;plug&rdquo; is the person who always comes
          through — the connect who knows where to get the real thing, fairly priced, without the
          runaround. That&rsquo;s the role we want LePlug to play for your car: parts that fit, care
          products that work, and accessories that hold up, without you having to guess.
        </p>
        <p>
          Our look draws from the Safari Rally — Kenya&rsquo;s own motorsport legend, run on the same
          red-earth roads much of Nairobi drives every day. It&rsquo;s not motorsport as an abstract
          aesthetic; it&rsquo;s a nod to a car culture that&rsquo;s specifically ours.
        </p>
        <p>
          We carry parts and accessories across exterior, interior, performance, detailing,
          electronics, and safety — with fitment info for common makes on the road in Kenya, so you
          know before you buy that it&rsquo;ll actually fit your car.
        </p>
        <p>
          {BUSINESS_INFO.address}. Delivery is available across Nairobi Metro and beyond — see our{" "}
          <a href="/faq#delivery" className="text-murram underline underline-offset-2">
            delivery FAQ
          </a>{" "}
          for details.
        </p>
      </div>
    </main>
  );
}
