import { Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CRAFTBEER_FILTERS } from "@/config/craftbeer-filters";
import { cn } from "@/lib/utils";

interface CraftbeerFilterProps {
  className?: string;
}

export function CraftbeerFilter({ className }: CraftbeerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterChange = (id: string) => {
    const newFilters = selectedFilters.includes(id)
      ? selectedFilters.filter((filter) => filter !== id)
      : [...selectedFilters, id];
    setSelectedFilters(newFilters);
    console.log("Selected craftbeer filters:", newFilters);
  };

  return (
    <div className={cn("absolute top-3 right-3 z-10", className)}>
      <Button
        variant="outline"
        className="shadow-lg gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="size-4" />
        Craftbeer Filters
      </Button>

      {isOpen && (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden flex flex-col min-h-0 min-w-[200px] mt-2">
          <div className="p-2 border-b flex justify-between items-center bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">
              Beer Types
            </span>
          </div>
          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {CRAFTBEER_FILTERS.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-2 p-1 rounded cursor-pointer text-sm transition-colors w-full"
              >
                <Checkbox
                  id={filter.id}
                  checked={selectedFilters.includes(filter.id)}
                  onCheckedChange={() => handleFilterChange(filter.id)}
                />
                <Label htmlFor={filter.id} className="w-full cursor-pointer">
                  {filter.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
