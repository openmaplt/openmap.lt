"use client";

import { CraftbeerFilter } from "@/components/CraftbeerFilter";

export function CraftbeerFeature() {
  const handleFilterChange = (filters: Record<string, boolean>) => {
    console.log("Craftbeer filter changed:", filters);
  };

  return (
    <CraftbeerFilter
      onFilterChange={handleFilterChange}
    />
  );
}
