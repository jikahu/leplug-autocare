import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center md:px-8">
      <span className="font-stencil text-7xl text-murram sm:text-8xl">404</span>
      <h1 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">Page not found</h1>
      <p className="max-w-md text-sm text-tarmac/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Check the URL, or
        head back to browsing.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />} nativeButton={false}>
          Back to Home
        </Button>
        <Button render={<Link href="/shop" />} nativeButton={false} variant="outline">
          Browse Shop
        </Button>
      </div>
    </main>
  );
}
