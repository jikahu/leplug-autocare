import Link from "next/link";
import Image from "next/image";
import { CarFront } from "lucide-react";
import { ALL_VEHICLE_MAKES } from "@/lib/data/products";

const VEHICLE_MAKE_LOGOS: Record<string, string | undefined> = {
  Toyota: "/logos/makes/toyota.svg",
  Subaru: "/logos/makes/subaru.svg",
  Nissan: "/logos/makes/nissan.svg",
  Mazda: "/logos/makes/mazda.svg",
  Mitsubishi: "/logos/makes/mitsubishi.svg",
  Ford: "/logos/makes/ford.svg",
};

function MakeBadge({ make, logoSrc }: { make: string; logoSrc?: string }) {
  return (
    <Link
      href={`/shop?make=${encodeURIComponent(make)}`}
      className="flex flex-col items-center gap-2 rounded-lg border border-steel/60 bg-savanna/5 p-4 text-center transition-colors hover:border-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
    >
      {logoSrc ? (
        <span className="flex size-16 items-center justify-center rounded-md bg-savanna p-2.5">
          <Image
            src={logoSrc}
            alt={`${make} logo`}
            width={64}
            height={64}
            unoptimized
            className="size-full object-contain"
          />
        </span>
      ) : (
        <CarFront className="size-12 text-savanna/70" aria-hidden="true" />
      )}
      <span className="text-sm font-medium text-savanna">{make}</span>
    </Link>
  );
}

export function VehicleMakeStrip() {
  return (
    <section className="bg-tarmac text-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black sm:text-3xl">Shop by Vehicle Make</h2>
        <p className="mt-1 text-sm text-savanna/70">
          Parts and accessories fitted for these makes.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 md:grid-cols-6">
          {ALL_VEHICLE_MAKES.map((make) => (
            <MakeBadge key={make} make={make} logoSrc={VEHICLE_MAKE_LOGOS[make]} />
          ))}
        </div>
      </div>
    </section>
  );
}
