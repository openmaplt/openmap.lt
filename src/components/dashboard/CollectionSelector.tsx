"use client";

import { useState } from "react";
import { saveCollectionSelectionAction } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { COLLECTION_FILTERS } from "@/config/collection-filters";
import type { FilterCategory } from "@/config/places-filters";
import { cn } from "@/lib/utils";

interface CollectionSelectorProps {
  initialTypeCodes: string[];
}

export function CollectionSelector({
  initialTypeCodes,
}: CollectionSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialTypeCodes),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const toggleType = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setIsDirty(true);
  };

  const toggleCategory = (category: FilterCategory) => {
    const ids = category.items.map((item) => item.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveCollectionSelectionAction(Array.from(selected));
    setIsSaving(false);

    if (!result.ok) {
      toast.error(
        result.error === "rate_limited"
          ? "Per daug bandymų — pabandykite vėliau."
          : "Nepavyko išsaugoti pasirinkimo.",
      );
      return;
    }

    setIsDirty(false);
    toast.success("Pasirinkimas išsaugotas.");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {COLLECTION_FILTERS.map((category) => {
          const ids = category.items.map((item) => item.id);
          const selectedCount = ids.filter((id) => selected.has(id)).length;
          const allSelected = selectedCount === ids.length;

          return (
            <div
              key={category.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center gap-2 p-2 bg-muted/30">
                <Checkbox
                  id={`collect-category-${category.id}`}
                  checked={allSelected}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label
                  htmlFor={`collect-category-${category.id}`}
                  className={cn(
                    "font-medium text-sm cursor-pointer",
                    category.textColor,
                  )}
                >
                  {category.label}
                </Label>
                <span className="text-xs opacity-70 ml-auto">
                  {selectedCount}/{ids.length}
                </span>
              </div>
              <div className="p-2 space-y-1">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`collect-${item.id}`}
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleType(item.id)}
                    />
                    <Label
                      htmlFor={`collect-${item.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !isDirty}
      >
        {isSaving ? "Išsaugoma..." : "Išsaugoti"}
      </Button>
    </div>
  );
}
