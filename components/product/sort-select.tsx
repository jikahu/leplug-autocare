"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFilterHref, type ShopFilterParams } from "@/lib/utils/build-filter-url";
import { SORT_OPTIONS } from "@/lib/utils/sort-products";

export function SortSelect({
  basePath,
  current,
}: {
  basePath: string;
  current: ShopFilterParams;
}) {
  const router = useRouter();

  return (
    <Select
      value={current.sort ?? ""}
      onValueChange={(value: string | null) => {
        router.push(buildFilterHref(basePath, current, { sort: value || undefined }));
      }}
    >
      <SelectTrigger className="w-full sm:w-56" aria-label="Sort products">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
