import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-savanna text-tarmac">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-heading text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Your Plug for Premium Car Care
          </h1>
          <p className="max-w-md text-base text-tarmac/70 sm:text-lg">
            Parts, accessories, and detailing for Nairobi&apos;s drivers — real fit, real quality,
            ordered online.
          </p>
          <Button render={<Link href="/shop" />} nativeButton={false} size="lg">
            Shop Now
          </Button>
        </div>

        <div
          className="relative hidden h-64 overflow-hidden rounded-lg bg-tarmac md:block md:h-80 lg:h-96"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-24deg, var(--color-steel) 0px, var(--color-steel) 2px, transparent 2px, transparent 28px)",
            }}
          />
          <div className="absolute inset-y-0 right-[18%] w-20 -skew-x-12 bg-murram [clip-path:inset(0_0_100%_0)] motion-safe:[animation:stripe-wipe_900ms_ease-out_forwards] motion-reduce:[clip-path:inset(0_0_0_0)] lg:w-28" />
        </div>
      </div>
    </section>
  );
}
