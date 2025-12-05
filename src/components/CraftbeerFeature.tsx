"use client";

import { CraftbeerFilter } from "@/components/CraftbeerFilter";
import { CRAFTBEER_FILTERS } from "@/config/craftbeer-filters";

export function CraftbeerFeature() {
  const handleFilterChange = (filters: Record<string, boolean>) => {
    console.log("Craftbeer filter changed:", filters);
  };

  return (
    <CraftbeerFilter
      filters={CRAFTBEER_FILTERS}
      onFilterChange={handleFilterChange}
    />
  );
}
