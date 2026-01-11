"use client";

import { Filter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PROTECTED_FILTERS } from "@/config/protected-filters";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface ProtectedFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  className?: string;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
}

export function ProtectedFilter({
  selectedTypes,
  onTypesChange,
  className,
  mobileActiveMode,
  setMobileActiveMode,
}: ProtectedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  const toggleType = (id: string) => {
    const newTypes = selectedTypes.includes(id)
      ? selectedTypes.filter((t) => t !== id)
      : [...selectedTypes, id];
    onTypesChange(newTypes);
  };

  const toggleAll = () => {
    if (selectedTypes.length === PROTECTED_FILTERS.length) {
      onTypesChange([]);
    } else {
      onTypesChange(PROTECTED_FILTERS.map((f) => f.id));
    }
  };

  const allSelected = selectedTypes.length === PROTECTED_FILTERS.length;

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-300 ease-in-out flex flex-col gap-2 absolute top-3 right-3 z-10",
        isOpen && "bottom-3",
        className,
      )}
    >
      <Button
        variant={selectedTypes.length > 0 ? "default" : "outline"}
        className="shadow-lg gap-2"
        onClick={() => {
          setMobileActiveMode("filter");
          setIsOpen(!isOpen);
        }}
      >
        <Filter className="size-4" />
        {(!isMobile || (isMobile && mobileActiveMode !== "search")) && (
          <>
            {isOpen ? "Uždaryti" : "Filtruoti teritorijas"}
            {selectedTypes.length > 0 && (
              <span className="ml-2 bg-background/20 px-2 py-0.5 rounded text-xs">
                {selectedTypes.length}
              </span>
            )}
          </>
        )}
      </Button>

      {isOpen && (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden flex flex-col min-h-0 min-w-[300px]">
          <div className="p-2 border-b flex justify-between items-center bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">
              Tipai
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTypesChange([])}
              disabled={selectedTypes.length === 0}
              className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Išvalyti visus
            </Button>
          </div>

          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <div className="flex items-center gap-2 p-1 rounded cursor-pointer text-sm transition-colors w-full hover:bg-accent/50">
              <Checkbox
                id="all"
                checked={allSelected}
                onCheckedChange={toggleAll}
              />
              <Label
                htmlFor="all"
                className="w-full cursor-pointer font-medium"
              >
                Visi tipai
              </Label>
            </div>
            <hr className="my-1" />
            {PROTECTED_FILTERS.map((item) => {
              const isSelected = selectedTypes.includes(item.id);
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
                    onCheckedChange={() => toggleType(item.id)}
                  />
                  <Label htmlFor={item.id} className="w-full cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
