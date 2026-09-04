import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
      <ShoppingCart className="size-10 text-steel" aria-hidden="true" />
      <h2 className="font-heading text-xl font-bold text-tarmac">Your cart is empty</h2>
      <p className="max-w-md text-sm text-tarmac/70">
        Add parts, accessories, or care products to see them here.
      </p>
      <Button render={<Link href="/shop" />} nativeButton={false} className="mt-2">
        Browse Shop
      </Button>
    </div>
  );
}
