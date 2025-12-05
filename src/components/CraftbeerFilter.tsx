"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FilterItem } from "@/config/craftbeer-filters";

type CraftbeerFilterProps = {
  filters: FilterItem[];
  onFilterChange: (filters: Record<string, boolean>) => void;
};

export function CraftbeerFilter({
  filters,
  onFilterChange,
}: CraftbeerFilterProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelected = { ...selected, [id]: checked };
    setSelected(newSelected);
    onFilterChange(newSelected);
  };

  return (
    <div className="absolute top-20 left-3 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Craft Beer Filters</h3>
      <div className="space-y-2">
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center space-x-2">
            <Checkbox
              id={filter.id}
              checked={selected[filter.id] || false}
              onCheckedChange={(checked) =>
                handleCheckboxChange(filter.id, !!checked)
              }
            />
            <Label htmlFor={filter.id}>{filter.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
