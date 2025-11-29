import { ChevronDown, ChevronRight, Filter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type FilterCategory, PLACES_FILTERS } from "@/config/places-filters";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface PlacesFilterProps {
  selectedTypes: string;
  onTypesChange: (types: string) => void;
  className?: string;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
}

export function PlacesFilter({
  selectedTypes,
  onTypesChange,
  className,
  mobileActiveMode,
  setMobileActiveMode,
}: PlacesFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    PLACES_FILTERS.map((c) => c.label),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  // Handle click outside to collapse search on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const toggleType = (id: string) => {
    const currentTypes = selectedTypes.split("").filter(Boolean);
    const newTypes = currentTypes.includes(id)
      ? currentTypes.filter((t) => t !== id)
      : [...currentTypes, id];
    onTypesChange(newTypes.join(""));
  };

  const toggleCategoryTypes = (category: FilterCategory) => {
    const categoryIds = category.items.map((item) => item.id);
    const currentTypes = selectedTypes.split("").filter(Boolean);

    // Check if all items in this category are selected
    const allSelected = categoryIds.every((id) => currentTypes.includes(id));

    let newTypes: string[];
    if (allSelected) {
      // Deselect all
      newTypes = currentTypes.filter((t) => !categoryIds.includes(t));
    } else {
      // Select all (add missing ones)
      const missingIds = categoryIds.filter((id) => !currentTypes.includes(id));
      newTypes = [...currentTypes, ...missingIds];
    }
    onTypesChange(newTypes.join(""));
  };

  // Helper to check selection state
  const getCategorySelectionState = (category: FilterCategory) => {
    const categoryIds = category.items.map((item) => item.id);
    const currentTypes = selectedTypes.split("").filter(Boolean);
    const selectedCount = categoryIds.filter((id) =>
      currentTypes.includes(id),
    ).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === categoryIds.length) return "all";
    return "some";
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-300 ease-in-out flex flex-col gap-2 absolute top-3 right-3 bottom-3",
        className,
      )}
    >
      <Button
        variant={selectedTypes ? "default" : "outline"}
        className="shadow-lg gap-2"
        onClick={() => {
          setMobileActiveMode("filter");
          setIsOpen(!isOpen);
        }}
      >
        <Filter className="size-4" />
        {(!isMobile || (isMobile && mobileActiveMode !== "search")) && (
          <>
            {isOpen ? "Uždaryti pasirinkimus" : "Pasirinkti vietas"}
            {selectedTypes && (
              <span className="ml-2 bg-background/20 px-2 py-0.5 rounded text-xs">
                {selectedTypes.length}
              </span>
            )}
          </>
        )}
      </Button>

      {isOpen && (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden flex flex-col min-h-0 z-10">
          <div className="p-2 border-b flex justify-between items-center bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">
              Kategorijos
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTypesChange("")}
              disabled={!selectedTypes}
              className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Išvalyti visus
            </Button>
          </div>

          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {PLACES_FILTERS.map((category) => {
              const isExpanded = expandedCategories.includes(category.label);
              const selectionState = getCategorySelectionState(category);
              const selectedCount = category.items.filter((i) =>
                selectedTypes.includes(i.id),
              ).length;

              return (
                <div
                  key={category.label}
                  className="border rounded-md overflow-hidden bg-card/50"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 cursor-pointer transition-colors",
                      "hover:bg-accent/50",
                      "border-l-4 border-l-transparent",
                      selectionState !== "none" &&
                        "bg-accent/10 border-l-primary",
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 flex-1 has-[>svg]:px-0 hover:bg-transparent py-0",
                        selectionState !== "none" && category.textColor,
                      )}
                      onClick={() => toggleCategory(category.label)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                      <span className="font-medium text-sm">
                        {category.label}
                      </span>
                      <span className="text-xs opacity-70 ml-auto mr-2">
                        {selectedCount}/{category.items.length}
                      </span>
                    </Button>
                    <Checkbox
                      checked={selectionState === "all"}
                      title={
                        selectionState === "all"
                          ? "Atžymėti visus"
                          : "Pažymėti visus"
                      }
                      onCheckedChange={() => toggleCategoryTypes(category)}
                    />
                  </div>

                  {isExpanded && (
                    <div className="p-1 space-y-0.5 bg-background/50 border-t">
                      {category.items.map((item) => {
                        const isSelected = selectedTypes.includes(item.id);
                        const activeColorClass = category.textColor;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center gap-2 p-1 rounded cursor-pointer text-sm transition-colors w-full",
                              isSelected
                                ? "bg-accent/20 font-medium"
                                : "hover:bg-accent/50 text-muted-foreground",
                            )}
                          >
                            <Checkbox
                              id={item.id}
                              checked={isSelected}
                              className={cn(
                                "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                                isSelected && activeColorClass,
                              )}
                              onCheckedChange={() => toggleType(item.id)}
                            />
                            <Label
                              htmlFor={item.id}
                              className="w-full cursor-pointer"
                            >
                              <item.icon
                                className={cn(
                                  "w-4 h-4",
                                  isSelected
                                    ? activeColorClass
                                    : "text-muted-foreground",
                                )}
                              />
                              <span
                                className={cn(isSelected && activeColorClass)}
                              >
                                {item.label}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
