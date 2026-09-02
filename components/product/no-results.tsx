import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NoResultsProps =
  | { variant: "search"; query: string }
  | { variant: "filters"; clearHref: string };

export function NoResults(props: NoResultsProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
      <SearchX className="size-10 text-steel" aria-hidden="true" />
      {props.variant === "search" ? (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">
            No results for &quot;{props.query}&quot;
          </h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Check the spelling, try a shorter search term, or browse categories instead.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">No products match these filters</h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Try removing a filter, or clear them all to see more products.
          </p>
        </>
      )}
      <Button
        render={<Link href={props.variant === "search" ? "/shop" : props.clearHref} />}
        nativeButton={false}
        className="mt-2"
      >
        {props.variant === "search" ? "Browse Shop" : "Clear Filters"}
      </Button>
    </div>
  );
}
