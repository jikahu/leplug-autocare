import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  );
}
