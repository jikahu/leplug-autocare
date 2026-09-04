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
        <SelectValue placeholder="Sort by">
          {(value: string | null) =>
            SORT_OPTIONS.find((option) => option.value === value)?.label ?? "Sort by"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-steel bg-savanna text-tarmac">
        {SORT_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus:bg-murram/10 focus:text-tarmac"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
