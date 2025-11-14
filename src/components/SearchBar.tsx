"use client";

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { POIResult } from "@/lib/searchDb";

interface SearchBarProps {
  onResultSelect: (result: POIResult) => void;
}

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<POIResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error("Paieškos klaida");
      }

      const data = await response.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch (err) {
      setError(
        "Nepavyko atlikti paieškos. Įsitikinkite, kad LLM servisas veikia.",
      );
      console.error("Paieškos klaida:", err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleResultClick = (result: POIResult) => {
    onResultSelect(result);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 p-2">
          <Search className="size-5 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Ieškoti vietų natūralia kalba..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400 dark:text-white"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            size="sm"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Ieškoti"
            )}
          </Button>
        </div>

        {error && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {isOpen && results.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {result.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {result.type}
                  {result.distance !== undefined &&
                    ` • ${(result.distance / 1000).toFixed(1)} km`}
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && results.length === 0 && !isLoading && !error && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rezultatų nerasta
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Pavyzdžiai: "baras vilniuje prie balto angelo" • "ligoninė šalia Žirmūnų
        tilto"
      </div>
    </div>
  );
}
