import { Truck, ShieldCheck, Smartphone } from "lucide-react";

const SIGNALS = [
  {
    icon: Truck,
    title: "Nairobi Metro Delivery",
    description: "Flat-rate delivery across Nairobi, with wider coverage available.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty on Parts",
    description: "Parts and accessories backed by manufacturer warranty where applicable.",
  },
  {
    icon: Smartphone,
    title: "Pay Your Way",
    description: "M-Pesa, card, or cash on delivery — choose at checkout.",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-savanna">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3 md:px-8">
        {SIGNALS.map((signal) => (
          <div key={signal.title} className="flex flex-col items-start gap-2">
            <signal.icon className="size-7 text-murram" aria-hidden="true" />
            <h3 className="font-heading text-base font-bold text-tarmac">{signal.title}</h3>
            <p className="text-sm text-tarmac/70">{signal.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
